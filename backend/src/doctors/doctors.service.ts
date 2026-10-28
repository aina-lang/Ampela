import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDoctorDto } from './dto/register-doctor.dto';

const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * Accès des professionnelles de santé, sur invitation uniquement.
 * Une invitation est créée par un administrateur (scripts/invite-doctor.js),
 * liée ou non à un e-mail, à usage unique, éventuellement datée.
 */
@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Où en est le compte courant : déjà professionnelle vérifiée, invitée, ou sans accès. */
  async status(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true, verificationStatus: true, username: true },
    });
    if (!user) throw new ForbiddenException('Compte introuvable.');
    const invitation = await this.prisma.doctorInvitation.findFirst({
      where: {
        email: user.email.toLowerCase(),
        usedAt: null,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    });
    return {
      role: user.role,
      verificationStatus: user.verificationStatus,
      isDoctor: user.role === 'doctor' && user.verificationStatus === 'verified',
      hasProfile: !!user.username,
      invited: !!invitation,
    };
  }

  /** Consomme une invitation et accorde le rôle « doctor » vérifié. */
  async register(userId: string, dto: RegisterDoctorDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('Compte introuvable.');

    const code = normalizeCode(dto.code);
    const invitation = await this.prisma.doctorInvitation.findUnique({ where: { code } });
    if (!invitation || invitation.revokedAt) {
      throw new BadRequestException("Code d'invitation invalide.");
    }
    if (invitation.usedAt && invitation.usedById !== userId) {
      throw new BadRequestException("Ce code d'invitation a déjà été utilisé.");
    }
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new BadRequestException("Ce code d'invitation a expiré.");
    }
    if (invitation.email && invitation.email !== user.email.toLowerCase()) {
      throw new BadRequestException(
        "Ce code d'invitation est réservé à une autre adresse e-mail.",
      );
    }

    const now = new Date();
    const [profile] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          role: 'doctor',
          verificationStatus: 'verified',
          verifiedAt: now,
          verifiedBy: `invitation:${invitation.id}`,
          username: dto.username.trim(),
          profession: dto.profession.trim(),
          fullName: dto.fullName?.trim() || null,
          institution: dto.institution?.trim() || null,
          licenseNumber: dto.licenseNumber?.trim() || null,
          profileImage: dto.profileImage ?? user.profileImage,
        },
      }),
      this.prisma.doctorInvitation.update({
        where: { id: invitation.id },
        data: { usedAt: invitation.usedAt ?? now, usedById: userId },
      }),
    ]);
    return profile;
  }
}
