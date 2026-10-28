import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from './auth.guard';
import type { JwtPayload } from './auth.service';

/** Injecte le payload JWT de l'utilisatrice connectée (indéfini sur une
 * route à authentification optionnelle sans jeton). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
