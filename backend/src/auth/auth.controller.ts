import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import type { JwtPayload } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('request-otp')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.email);
  }

  @Post('verify-otp')
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.email, dto.code);
  }

  /** Permet au client de vérifier qu'un jeton stocké est encore valide. */
  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: JwtPayload) {
    const profile = await this.prisma.user.findUnique({ where: { id: user.sub } });
    // Compte supprimé entre-temps (autre appareil) : le jeton ne vaut plus
    // rien, le client efface sa session sur ce 401.
    if (!profile) throw new UnauthorizedException('Ce compte n’existe plus.');
    return profile;
  }
}
