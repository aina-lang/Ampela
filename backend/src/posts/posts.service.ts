import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagesGateway } from '../messages/messages.gateway';
import { isVerifiedDoctor, publicUserSelect } from '../users/users.service';
import { CreatePostDto } from './dto/create-post.dto';

// userId absent (lecture anonyme) : aucun like ne peut être « le mien ».
const postInclude = (userId?: string) =>
  ({
    author: { select: publicUserSelect },
    _count: { select: { likes: true, comments: true } },
    likes: { where: { userId: userId ?? '' }, select: { id: true } },
  }) satisfies Prisma.PostInclude;

type PostRow = Prisma.PostGetPayload<{ include: ReturnType<typeof postInclude> }>;

/** Forme renvoyée au client : compteurs à plat + "likedByMe". */
const toView = (post: PostRow) => ({
  id: post.id,
  title: post.title,
  description: post.description,
  photos: post.photos,
  authorId: post.authorId,
  authorName: post.author.username,
  authorProfession: post.author.profession,
  authorRole: isVerifiedDoctor(post.author) ? 'doctor' : 'user',
  authorImage: post.author.profileImage,
  likeCount: post._count.likes,
  commentCount: post._count.comments,
  likedByMe: post.likes.length > 0,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly realtime: MessagesGateway,
  ) {}

  /** Compteurs publics d'une publication, diffusés à toutes en temps réel. */
  private async broadcastCounts(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, _count: { select: { likes: true, comments: true } } },
    });
    if (!post) return;
    this.realtime.broadcast('post:updated', {
      id: post.id,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
    });
  }

  async list(userId?: string) {
    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: postInclude(userId),
    });
    return posts.map(toView);
  }

  async getOne(userId: string | undefined, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: postInclude(userId),
    });
    if (!post) throw new NotFoundException('Publication introuvable.');
    return toView(post);
  }

  async create(userId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: { ...dto, authorId: userId },
      include: postInclude(userId),
    });
    const view = toView(post);
    this.realtime.broadcast('post:new', { ...view, likedByMe: false });
    return view;
  }

  async remove(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Publication introuvable.');
    if (post.authorId !== userId) {
      throw new ForbiddenException('Seule l’autrice peut supprimer ce post.');
    }
    await this.prisma.post.delete({ where: { id: postId } });
    this.realtime.broadcast('post:deleted', { id: postId });
    return { ok: true };
  }

  async like(userId: string, postId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
      select: { id: true },
    });
    await this.prisma.like.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId },
      update: {},
    });
    const view = await this.getOne(userId, postId);
    if (!existing) {
      const actor = await this.prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
      await this.notifications.create({
        userId: view.authorId,
        actorId: userId,
        type: 'like',
        title: `${actor?.username || 'Une membre'} a réagi à votre question`,
        body: view.title,
        postId,
      });
    }
    void this.broadcastCounts(postId);
    return view;
  }

  async unlike(userId: string, postId: string) {
    await this.prisma.like.deleteMany({ where: { userId, postId } });
    void this.broadcastCounts(postId);
    return this.getOne(userId, postId);
  }

  listComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: publicUserSelect } },
    });
  }

  async addComment(
    userId: string,
    postId: string,
    content: string,
    parentId?: string | null,
  ) {
    const exists = await this.prisma.post.count({ where: { id: postId } });
    if (!exists) throw new NotFoundException('Publication introuvable.');

    // Un seul niveau de réponses : on répond toujours au commentaire racine.
    let rootParentId: string | null = null;
    if (parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: parentId, postId },
        select: { id: true, parentId: true },
      });
      if (!parent) throw new NotFoundException('Commentaire introuvable.');
      rootParentId = parent.parentId ?? parent.id;
    }

    const comment = await this.prisma.comment.create({
      data: { postId, authorId: userId, content, parentId: rootParentId },
      include: { author: { select: publicUserSelect } },
    });

    // Notifications : l'auteure de la question, et l'auteure du commentaire racine en cas de réponse.
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true },
    });
    const actorName = comment.author.username || 'Une membre';
    if (post) {
      await this.notifications.create({
        userId: post.authorId,
        actorId: userId,
        type: 'comment',
        title: `${actorName} a commenté votre question`,
        body: content,
        postId,
        commentId: comment.id,
      });
    }
    if (rootParentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: rootParentId },
        select: { authorId: true },
      });
      if (parent && parent.authorId !== post?.authorId) {
        await this.notifications.create({
          userId: parent.authorId,
          actorId: userId,
          type: 'reply',
          title: `${actorName} a répondu à votre commentaire`,
          body: content,
          postId,
          commentId: comment.id,
        });
      }
    }
    this.realtime.broadcast('comment:new', { postId, comment });
    void this.broadcastCounts(postId);
    return comment;
  }

  /** Modification par son auteure uniquement. */
  async updateComment(userId: string, postId: string, commentId: string, content: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, postId },
      select: { authorId: true },
    });
    if (!comment) throw new NotFoundException('Commentaire introuvable.');
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos commentaires.');
    }
    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: { author: { select: publicUserSelect } },
    });
    this.realtime.broadcast('comment:updated', { postId, comment: updated });
    return updated;
  }

  /**
   * Suppression par son auteure, ou par l'auteure de la publication. Les
   * réponses d'un commentaire supprimé partent avec lui (cascade).
   */
  async deleteComment(userId: string, postId: string, commentId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, postId },
      select: { authorId: true, post: { select: { authorId: true } } },
    });
    if (!comment) throw new NotFoundException('Commentaire introuvable.');
    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos commentaires.');
    }
    await this.prisma.comment.delete({ where: { id: commentId } });
    this.realtime.broadcast('comment:deleted', { postId, commentId });
    void this.broadcastCounts(postId);
    return { ok: true };
  }
}
