import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReminderDto } from './dto/reminder.dto';

/**
 * Rappels synchronisés entre appareils. Fusion rappel par rappel : la
 * version dont `updatedAt` est le plus récent l'emporte, que ce soit celle
 * du serveur ou celle envoyée. La réponse est toujours l'état fusionné,
 * que l'appareil applique à son tour.
 */
@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.reminder.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  async merge(userId: string, incoming: ReminderDto[]) {
    const stored = await this.list(userId);
    const byName = new Map(stored.map((r) => [r.name, r]));

    const writes = incoming
      .filter((dto) => {
        const current = byName.get(dto.name);
        return !current || new Date(dto.updatedAt).getTime() > current.updatedAt.getTime();
      })
      .map((dto) =>
        this.prisma.reminder.upsert({
          where: { userId_name: { userId, name: dto.name } },
          create: { userId, ...dto, updatedAt: new Date(dto.updatedAt) },
          update: { ...dto, updatedAt: new Date(dto.updatedAt) },
        }),
      );
    if (writes.length > 0) await this.prisma.$transaction(writes);
    return this.list(userId);
  }
}
