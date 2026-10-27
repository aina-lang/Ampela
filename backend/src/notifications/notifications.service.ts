import { Injectable } from '@nestjs/common';
import { MessagesGateway } from '../messages/messages.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/users.service';

export type NotificationType = 'like' | 'comment' | 'reply' | 'message';

export interface NotificationInput {
  userId: string;
  actorId: string;
  type: NotificationType;
  title: string;
  body: string;
  postId?: string | null;
  commentId?: string | null;
  roomId?: string | null;
}

const include = { actor: { select: publicUserSelect } } as const;

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: MessagesGateway,
  ) {}

  /** Crée et pousse une notification (jamais à soi-même). */
  async create(input: NotificationInput) {
    if (input.userId === input.actorId) return null;
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        actorId: input.actorId,
        type: input.type,
        title: input.title,
        body: input.body.slice(0, 300),
        postId: input.postId ?? null,
        commentId: input.commentId ?? null,
        roomId: input.roomId ?? null,
      },
      include,
    });
    this.gateway.emit([input.userId], 'notification:new', notification);
    return notification;
  }

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include,
    });
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, readAt: null } });
    return { count };
  }

  async markRead(userId: string, id?: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null, ...(id ? { id } : {}) },
      data: { readAt: new Date() },
    });
    return { ok: true, updated: result.count };
  }

  async remove(userId: string, id: string) {
    await this.prisma.notification.deleteMany({ where: { userId, id } });
    return { ok: true };
  }
}
