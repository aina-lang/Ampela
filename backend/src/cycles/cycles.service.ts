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

  /**
   * Upsert atomique de tous les cycles envoyés. Avec `replace`, les cycles
   * absents de l'envoi sont supprimés (l'appareil envoie son jeu complet).
   * Avec `updatedAt`, l'envoi est ignoré s'il est plus ancien que le jeu
   * déjà enregistré : un appareil en retard n'écrase jamais le plus récent.
   */
  async upsertMany(
    userId: string,
    cycles: CycleDto[],
    { replace = false, updatedAt }: { replace?: boolean; updatedAt?: string } = {},
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { cyclesUpdatedAt: true },
    });
    const incoming = updatedAt ? new Date(updatedAt) : new Date();
    if (updatedAt && user?.cyclesUpdatedAt && incoming.getTime() < user.cyclesUpdatedAt.getTime()) {
      return { ok: true, skipped: true, cyclesUpdatedAt: user.cyclesUpdatedAt };
    }

    const keys = cycles.map(cycleKey);
    await this.prisma.$transaction([
      ...(replace
        ? [this.prisma.cycle.deleteMany({ where: { userId, key: { notIn: keys } } })]
        : []),
      ...cycles.map((cycle, index) =>
        this.prisma.cycle.upsert({
          where: { userId_key: { userId, key: keys[index] } },
          create: { userId, key: keys[index], ...cycle },
          update: cycle,
        }),
      ),
      this.prisma.user.update({ where: { id: userId }, data: { cyclesUpdatedAt: incoming } }),
    ]);
    return { ok: true, count: cycles.length, cyclesUpdatedAt: incoming };
  }
}
