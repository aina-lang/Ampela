import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [NotificationsModule, RealtimeModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
