import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { SyncRemindersDto } from './dto/reminder.dto';
import { RemindersService } from './reminders.service';

@Controller('reminders')
@UseGuards(AuthGuard)
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.reminders.list(user.sub);
  }

  /** Envoie l'état local ; renvoie l'état fusionné (le plus récent gagne). */
  @Put()
  merge(@CurrentUser() user: JwtPayload, @Body() dto: SyncRemindersDto) {
    return this.reminders.merge(user.sub, dto.reminders);
  }
}
