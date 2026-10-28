import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { DoctorsService } from './doctors.service';
import { RegisterDoctorDto } from './dto/register-doctor.dto';

@Controller('doctors')
@UseGuards(AuthGuard)
export class DoctorsController {
  constructor(private readonly doctors: DoctorsService) {}

  /** Statut d'accès de la professionnelle connectée (invitée, vérifiée…). */
  @Get('status')
  status(@CurrentUser() user: JwtPayload) {
    return this.doctors.status(user.sub);
  }

  /** Inscription avec code d'invitation : accorde le rôle « doctor » vérifié. */
  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterDoctorDto) {
    return this.doctors.register(user.sub, dto);
  }
}
