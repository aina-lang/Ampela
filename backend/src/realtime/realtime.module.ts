import { Module } from '@nestjs/common';
import { MessagesGateway } from '../messages/messages.gateway';

/** Passerelle socket.io partagée (messagerie + notifications). */
@Module({ providers: [MessagesGateway], exports: [MessagesGateway] })
export class RealtimeModule {}
