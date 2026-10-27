import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CycleDto } from './dto/cycle.dto';

// Même clé déterministe que l'app : le même cycle écrase toujours la
// même ligne, l'envoi est donc idempotent.
export const cycleKey = (cycle: CycleDto) =>
  `${cycle.startMenstruationDate}_${cycle.month}`.replace(/[^\w-]/g, '-');

@Injectable()
export class CyclesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.cycle.findMany({
      where: { userId },
      orderBy: { startMenstruationDate: 'asc' },
    });
  }

  /** Upsert atomique de tous les cycles envoyés (jamais de suppression). */
  async upsertMany(userId: string, cycles: CycleDto[]) {
    await this.prisma.$transaction(
      cycles.map((cycle) => {
        const key = cycleKey(cycle);
        return this.prisma.cycle.upsert({
          where: { userId_key: { userId, key } },
          create: { userId, key, ...cycle },
          update: cycle,
        });
      }),
    );
    return { ok: true, count: cycles.length };
  }
}
