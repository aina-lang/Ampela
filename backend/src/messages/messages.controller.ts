import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { EditMessageDto } from './dto/edit-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesGateway } from './messages.gateway';
import { MessagesService, roomIdFor } from './messages.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { MediaKind } from './messages.service';

@Controller('conversations')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(
    private readonly messages: MessagesService,
    private readonly gateway: MessagesGateway,
    private readonly notifications: NotificationsService,
  ) {}

  /** Messages avec une autre utilisatrice, du plus récent au plus ancien (`q` = recherche). */
  @Get(':userId/messages')
  list(
    @CurrentUser() me: JwtPayload,
    @Param('userId') other: string,
    @Query('before') before?: string,
    @Query('q') q?: string,
  ) {
    return this.messages.list(me.sub, other, before, q);
  }

  /** Médias, documents, vocaux ou liens échangés (`type` = image | file | audio | link). */
  @Get(':userId/media')
  media(
    @CurrentUser() me: JwtPayload,
    @Param('userId') other: string,
    @Query('type') type: MediaKind = 'image',
  ) {
    const kind: MediaKind = ['image', 'file', 'audio', 'link'].includes(type) ? type : 'image';
    return this.messages.media(me.sub, other, kind);
  }

  @Post(':userId/messages')
  async send(
    @CurrentUser() me: JwtPayload,
    @Param('userId') other: string,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.messages.send(me.sub, other, dto);
    this.gateway.notifyMessage([me.sub, other], message);
    const preview =
      message.attachmentType === 'image'
        ? 'Photo'
        : message.attachmentType === 'audio'
          ? 'Message vocal'
          : message.attachmentType === 'file'
            ? `Fichier : ${message.attachmentName ?? 'pièce jointe'}`
            : message.text;
    await this.notifications.create({
      userId: other,
      actorId: me.sub,
      type: 'message',
      title: `${message.user.username || 'Une membre'} vous a écrit`,
      body: preview,
      roomId: message.roomId,
    });
    return message;
  }

  @Patch(':userId/messages/:messageId')
  async edit(
    @CurrentUser() me: JwtPayload,
    @Param('userId') other: string,
    @Param('messageId') messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    const message = await this.messages.edit(me.sub, other, messageId, dto.text);
    this.gateway.emit([me.sub, other], 'message:updated', message);
    return message;
  }

  @Delete(':userId/messages/:messageId')
  async remove(
    @CurrentUser() me: JwtPayload,
    @Param('userId') other: string,
    @Param('messageId') messageId: string,
  ) {
    const message = await this.messages.remove(me.sub, other, messageId);
    this.gateway.emit([me.sub, other], 'message:updated', message);
    return message;
  }

  /** J'ai lu les messages reçus de cette utilisatrice (accusés de lecture). */
  @Post(':userId/read')
  async read(@CurrentUser() me: JwtPayload, @Param('userId') other: string) {
    const result = await this.messages.markRead(me.sub, other);
    if (result.ids.length) {
      this.gateway.emit([other], 'message:read', {
        roomId: roomIdFor(me.sub, other),
        ids: result.ids,
        readAt: result.readAt,
      });
    }
    return result;
  }

  /** Supprime la conversation pour moi (l'autre participante garde ses messages). */
  @Delete(':userId')
  clear(@CurrentUser() me: JwtPayload, @Param('userId') other: string) {
    return this.messages.clear(me.sub, other);
  }
}
