import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/users.service';
import { SendMessageDto } from './dto/send-message.dto';

/** Identifiant déterministe du salon entre deux utilisatrices. */
export const roomIdFor = (a: string, b: string) => [a, b].sort().join('_');

const messageInclude = { user: { select: publicUserSelect } } as const;

export type MediaKind = 'image' | 'file' | 'audio' | 'link';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureRoom(me: string, other: string) {
    const [mine, theirs] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: me }, select: { role: true } }),
      this.prisma.user.findUnique({ where: { id: other }, select: { role: true } }),
    ]);
    if (!theirs) throw new NotFoundException('Utilisatrice introuvable.');
    // Pas de conversation utilisatrice ↔ utilisatrice ni pro ↔ pro.
    if ((mine?.role ?? 'user') === (theirs.role ?? 'user')) {
      throw new ForbiddenException(
        'La messagerie est réservée aux échanges entre utilisatrices et professionnelles de santé.',
      );
    }
    const [userAId, userBId] = [me, other].sort();
    const id = roomIdFor(me, other);
    return this.prisma.room.upsert({
      where: { id },
      create: { id, userAId, userBId },
      update: {},
    });
  }

  /** Date à partir de laquelle `me` voit les messages du salon (après « supprimer la conversation »). */
  private clearedAt(room: { userAId: string; userAClearedAt: Date | null; userBClearedAt: Date | null }, me: string) {
    return room.userAId === me ? room.userAClearedAt : room.userBClearedAt;
  }

  private visibleWhere(roomId: string, clearedAt: Date | null): Prisma.MessageWhereInput {
    return { roomId, ...(clearedAt ? { createdAt: { gt: clearedAt } } : {}) };
  }

  /** Messages (du plus récent au plus ancien), avec recherche plein texte optionnelle. */
  async list(me: string, other: string, before?: string, q?: string) {
    const room = await this.ensureRoom(me, other);
    const term = q?.trim();
    return this.prisma.message.findMany({
      where: {
        ...this.visibleWhere(room.id, this.clearedAt(room, me)),
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
        ...(term
          ? {
              deletedAt: null,
              OR: [
                { text: { contains: term, mode: 'insensitive' } },
                { attachmentName: { contains: term, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: messageInclude,
    });
  }

  /** Historique des médias, liens et documents (comme WhatsApp). */
  async media(me: string, other: string, kind: MediaKind) {
    const room = await this.ensureRoom(me, other);
    const base = { ...this.visibleWhere(room.id, this.clearedAt(room, me)), deletedAt: null };
    const where: Prisma.MessageWhereInput =
      kind === 'link'
        ? { ...base, text: { contains: 'http', mode: 'insensitive' } }
        : { ...base, attachmentType: kind };
    return this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: messageInclude,
    });
  }

  async send(me: string, other: string, dto: SendMessageDto) {
    const text = (dto.text ?? '').trim();
    if (!text && !dto.attachmentUrl) {
      throw new BadRequestException('Message vide.');
    }
    if (dto.attachmentUrl && !dto.attachmentType) {
      throw new BadRequestException('Type de pièce jointe manquant.');
    }
    const room = await this.ensureRoom(me, other);
    return this.prisma.message.create({
      data: {
        roomId: room.id,
        userId: me,
        text,
        attachmentType: dto.attachmentType ?? null,
        attachmentUrl: dto.attachmentUrl ?? null,
        attachmentName: dto.attachmentName ?? null,
        attachmentSize: dto.attachmentSize ?? null,
        durationMs: dto.durationMs ?? null,
      },
      include: messageInclude,
    });
  }

  private async ownMessage(me: string, other: string, messageId: string) {
    const roomId = roomIdFor(me, other);
    const message = await this.prisma.message.findFirst({ where: { id: messageId, roomId } });
    if (!message) throw new NotFoundException('Message introuvable.');
    if (message.userId !== me) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos messages.');
    }
    if (message.deletedAt) throw new BadRequestException('Message déjà supprimé.');
    return message;
  }

  /** Modification du texte (messages texte uniquement, par leur auteure). */
  async edit(me: string, other: string, messageId: string, text: string) {
    const message = await this.ownMessage(me, other, messageId);
    if (message.attachmentType) {
      throw new BadRequestException('Seul le texte peut être modifié.');
    }
    return this.prisma.message.update({
      where: { id: messageId },
      data: { text: text.trim(), editedAt: new Date() },
      include: messageInclude,
    });
  }

  /** Suppression pour tout le monde : le contenu est effacé, la bulle reste (« Message supprimé »). */
  async remove(me: string, other: string, messageId: string) {
    await this.ownMessage(me, other, messageId);
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        text: '',
        attachmentType: null,
        attachmentUrl: null,
        attachmentName: null,
        attachmentSize: null,
        durationMs: null,
        deletedAt: new Date(),
      },
      include: messageInclude,
    });
  }

  /** Marque comme lus les messages reçus de `other` ; renvoie leurs identifiants. */
  async markRead(me: string, other: string) {
    const roomId = roomIdFor(me, other);
    const unread = await this.prisma.message.findMany({
      where: { roomId, userId: other, readAt: null },
      select: { id: true },
    });
    if (!unread.length) return { ids: [] as string[], readAt: null as Date | null };
    const readAt = new Date();
    await this.prisma.message.updateMany({
      where: { id: { in: unread.map((m) => m.id) } },
      data: { readAt },
    });
    return { ids: unread.map((m) => m.id), readAt };
  }

  /** « Supprimer la conversation » pour moi seulement : les messages restent visibles pour l'autre. */
  async clear(me: string, other: string) {
    const room = await this.ensureRoom(me, other);
    const now = new Date();
    await this.prisma.room.update({
      where: { id: room.id },
      data: room.userAId === me ? { userAClearedAt: now } : { userBClearedAt: now },
    });
    return { ok: true, clearedAt: now };
  }
}
