import {
  ForbiddenException,
  GoneException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute entre deux envois
const MAX_ATTEMPTS = 5;

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  /** Génère et envoie un code à 6 chiffres (1 envoi / minute / e-mail). */
  async requestOtp(rawEmail: string) {
    const email = this.normalizeEmail(rawEmail);
    const existing = await this.prisma.otpRequest.findUnique({
      where: { email },
    });
    const now = Date.now();
    if (
      existing &&
      now - existing.lastSentAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      throw new HttpException(
        "Un code vient d'être envoyé. Patientez une minute avant de redemander.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = String(randomInt(100000, 1000000));
    const data = {
      codeHash: sha256(`${email}:${code}`),
      expiresAt: new Date(now + OTP_TTL_MS),
      attempts: 0,
      lastSentAt: new Date(now),
    };
    await this.prisma.otpRequest.upsert({
      where: { email },
      create: { email, ...data },
      update: data,
    });
    await this.mail.sendOtp(email, code);
    return { ok: true };
  }

  /** Vérifie le code, crée le compte au besoin et renvoie un JWT. */
  async verifyOtp(rawEmail: string, code: string) {
    const email = this.normalizeEmail(rawEmail);
    const request = await this.prisma.otpRequest.findUnique({
      where: { email },
    });
    if (!request) {
      throw new NotFoundException('Aucun code demandé pour cet e-mail.');
    }
    if (Date.now() > request.expiresAt.getTime()) {
      await this.prisma.otpRequest.delete({ where: { email } });
      throw new GoneException('Ce code a expiré, demandez-en un nouveau.');
    }
    if (request.attempts >= MAX_ATTEMPTS) {
      await this.prisma.otpRequest.delete({ where: { email } });
      throw new HttpException(
        "Trop d'essais. Demandez un nouveau code.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (request.codeHash !== sha256(`${email}:${code}`)) {
      await this.prisma.otpRequest.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      throw new ForbiddenException('Code incorrect.');
    }
    await this.prisma.otpRequest.delete({ where: { email } });

    // L'e-mail vérifié EST l'identité : on trouve ou on crée le compte.
    let user = await this.prisma.user.findUnique({ where: { email } });
    const isNewUser = !user;
    if (!user) {
      user = await this.prisma.user.create({ data: { email } });
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return { accessToken, user, isNewUser };
  }
}
