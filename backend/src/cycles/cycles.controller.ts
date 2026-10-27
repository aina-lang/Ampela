import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { CyclesService } from './cycles.service';
import { UpsertCyclesDto } from './dto/cycle.dto';

@Controller('cycles')
@UseGuards(AuthGuard)
export class CyclesController {
  constructor(private readonly cycles: CyclesService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.cycles.list(user.sub);
  }

  @Put()
  upsert(@CurrentUser() user: JwtPayload, @Body() dto: UpsertCyclesDto) {
    return this.cycles.upsertMany(user.sub, dto.cycles);
  }
}
