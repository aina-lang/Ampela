import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './auth.service';
import { AuthenticatedRequest } from './auth.guard';

/**
 * Route lisible sans compte : sans en-tête Authorization, la requête passe
 * en anonyme (request.user indéfini). Un jeton présent mais invalide est
 * refusé, pour que le client sache que sa session a expiré.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return true;
    try {
      request.user = await this.jwt.verifyAsync<JwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Session expirée, reconnectez-vous.');
    }
  }
}
