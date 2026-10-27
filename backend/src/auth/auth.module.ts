import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret || secret === 'change-me') {
          throw new Error('JWT_SECRET doit être défini dans .env');
        }
        return {
          secret,
          signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '90d') as JwtModuleOptions['signOptions'] extends { expiresIn?: infer T } ? T : never,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
