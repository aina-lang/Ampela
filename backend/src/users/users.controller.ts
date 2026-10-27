import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.users.getMe(user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.users.updateMe(user.sub, dto);
  }

  /** Suppression définitive du compte et de ses données. */
  @Delete('me')
  deleteMe(@CurrentUser() user: JwtPayload) {
    return this.users.deleteMe(user.sub);
  }

  @Get()
  listOthers(@CurrentUser() user: JwtPayload) {
    return this.users.listOthers(user.sub);
  }
}
