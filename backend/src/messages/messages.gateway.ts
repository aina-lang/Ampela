import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/auth.service';

/**
 * Temps réel de la messagerie. Le client se connecte avec
 * `auth: { token }` et rejoint automatiquement sa salle personnelle
 * "user:<id>" ; chaque nouveau message est poussé aux deux participantes.
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly jwt: JwtService) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.headers.authorization ?? '').replace('Bearer ', '');
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      client.data.userId = payload.sub;
      await client.join(`user:${payload.sub}`);
    } catch {
      this.logger.debug('Connexion WebSocket refusée (jeton invalide)');
      client.disconnect(true);
    }
  }

  /** Pousse un message aux deux participantes du salon. */
  notifyMessage(userIds: string[], message: unknown) {
    this.emit(userIds, 'message:new', message);
  }

  /**
   * Événements : `message:new`, `message:updated` (modification ou
   * suppression), `message:read` ({ roomId, ids, readAt }).
   */
  emit(userIds: string[], event: string, payload: unknown) {
    for (const id of userIds) {
      this.server.to(`user:${id}`).emit(event, payload);
    }
  }
}
