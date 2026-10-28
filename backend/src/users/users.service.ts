import { Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

/** Champs publics d'un profil (jamais l'e-mail ni les données de santé). */
export const publicUserSelect = {
  id: true,
  username: true,
  profession: true,
  role: true,
  verificationStatus: true,
  profileImage: true,
} as const;

/** Professionnelle de santé effective : rôle « doctor » ET statut vérifié. */
export const isVerifiedDoctor = (
  user: { role?: string | null; verificationStatus?: string | null } | null | undefined,
) => user?.role === 'doctor' && user?.verificationStatus === 'verified';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Profil introuvable.');
    return user;
  }

  /**
   * Mise à jour du profil et des préférences avec la règle « le plus
   * récent gagne » : chaque groupe (profil / préférences) n'est appliqué
   * que si l'horodatage déclaré est plus récent que celui enregistré.
   * Sans horodatage déclaré (anciens clients, app professionnelle), la
   * modification est appliquée et datée de maintenant.
   */
  async updateMe(userId: string, dto: UpdateProfileDto) {
    const current = await this.getMe(userId);
    const { profileUpdatedAt, preferences, preferencesUpdatedAt, ...profile } = dto;
    const data: Prisma.UserUpdateInput = {};

    const profileFields = Object.fromEntries(
      Object.entries(profile).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(profileFields).length > 0) {
      const incoming = profileUpdatedAt ? new Date(profileUpdatedAt) : new Date();
      const stored = current.profileUpdatedAt;
      if (!stored || incoming.getTime() >= stored.getTime()) {
        Object.assign(data, profileFields, { profileUpdatedAt: incoming });
      }
    }

    if (preferences !== undefined) {
      const incoming = preferencesUpdatedAt ? new Date(preferencesUpdatedAt) : new Date();
      const stored = current.preferencesUpdatedAt;
      if (!stored || incoming.getTime() >= stored.getTime()) {
        data.preferences = preferences as Prisma.InputJsonValue;
        data.preferencesUpdatedAt = incoming;
      }
    }

    if (Object.keys(data).length === 0) return current;
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  /**
   * Suppression de compte (exigence Google Play) : efface l'utilisatrice et
   * tout ce qui lui est rattaché. Cycles, posts, likes, commentaires et
   * messages partent par cascade ; les salons de discussion et la demande
   * OTP sont supprimés explicitement, puis l'avatar sur le disque.
   */
  async deleteMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Profil introuvable.');

    await this.prisma.$transaction([
      this.prisma.room.deleteMany({
        where: { OR: [{ userAId: userId }, { userBId: userId }] },
      }),
      this.prisma.otpRequest.deleteMany({ where: { email: user.email } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);

    const avatarPath = this.localUploadPath(user.profileImage);
    if (avatarPath) await unlink(avatarPath).catch(() => undefined);

    return { ok: true };
  }

  /** Chemin disque d'une URL servie depuis /uploads/, sinon null. */
  private localUploadPath(url: string | null): string | null {
    const match = /\/uploads\/([A-Za-z0-9._-]+)$/.exec(url ?? '');
    return match ? join(process.cwd(), 'uploads', match[1]) : null;
  }

  /**
   * Contacts de la messagerie, triés par date du dernier message échangé.
   * La messagerie est réservée aux échanges professionnelle ↔ utilisatrice :
   * une utilisatrice voit les professionnelles, une professionnelle voit
   * les utilisatrices.
   */
  async listOthers(userId: string) {
    const me = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, verificationStatus: true },
    });
    const iAmDoctor = isVerifiedDoctor(me);
    const users = await this.prisma.user.findMany({
      where: iAmDoctor
        ? { id: { not: userId }, role: 'user', username: { not: '' } }
        : { id: { not: userId }, role: 'doctor', verificationStatus: 'verified', username: { not: '' } },
      select: publicUserSelect,
      take: 200,
    });
    const rooms = await this.prisma.room.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      select: { id: true, userAId: true, userBId: true, userAClearedAt: true, userBClearedAt: true },
    });
    type LastMessage = { text: string; userId: string; createdAt: Date; attachmentType: string | null; deletedAt: Date | null };
    const lastByUser = new Map<string, LastMessage>();
    const unreadByUser = new Map<string, number>();
    for (const room of rooms) {
      const other = room.userAId === userId ? room.userBId : room.userAId;
      const clearedAt = room.userAId === userId ? room.userAClearedAt : room.userBClearedAt;
      const visible = { roomId: room.id, ...(clearedAt ? { createdAt: { gt: clearedAt } } : {}) };
      const [last, unread] = await Promise.all([
        this.prisma.message.findFirst({
          where: visible,
          orderBy: { createdAt: 'desc' },
          select: { text: true, userId: true, createdAt: true, attachmentType: true, deletedAt: true },
        }),
        this.prisma.message.count({ where: { ...visible, userId: other, readAt: null } }),
      ]);
      if (last) lastByUser.set(other, last);
      unreadByUser.set(other, unread);
    }
    return users
      .map((u) => ({
        ...u,
        lastMessage: lastByUser.get(u.id) ?? null,
        unreadCount: unreadByUser.get(u.id) ?? 0,
      }))
      .sort(
        (a, b) =>
          (b.lastMessage?.createdAt.getTime() ?? 0) -
          (a.lastMessage?.createdAt.getTime() ?? 0),
      );
  }
}
