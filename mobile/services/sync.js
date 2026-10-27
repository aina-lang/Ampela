import { apiGet, apiPut, isSignedIn, updateSessionUser } from "@/services/api";
import { getAllCycle, addCyclesMenstruels } from "@/services/database";

// Identifiant déterministe : le même cycle écrase toujours la même ligne
// côté serveur, l'envoi est donc idempotent.
const cycleKey = (cycle) =>
  `${cycle.startMenstruationDate}_${cycle.month}`.replace(/[^\w-]/g, "-");

const toPayload = (cycle) => ({
  month: cycle.month,
  ovulationDate: cycle.ovulationDate,
  fecundityPeriodStart: cycle.fecundityPeriodStart,
  fecundityPeriodEnd: cycle.fecundityPeriodEnd,
  startMenstruationDate: cycle.startMenstruationDate,
  endMenstruationDate: cycle.endMenstruationDate,
  nextMenstruationStartDate: cycle.nextMenstruationStartDate,
  nextMenstruationEndDate: cycle.nextMenstruationEndDate,
});

/** Envoie tous les cycles locaux (transaction atomique côté serveur). */
export const uploadCycles = async () => {
  const cycles = await getAllCycle();
  if (!cycles || cycles.length === 0) return;
  await apiPut("/cycles", { cycles: cycles.map(toPayload) });
};

/** Récupère les cycles du cloud et ajoute localement ceux qui manquent. */
export const downloadCycles = async () => {
  const remote = await apiGet("/cycles");
  if (!remote || remote.length === 0) return;

  const localCycles = await getAllCycle();
  const localKeys = new Set(localCycles.map(cycleKey));
  const missing = remote.filter((c) => !localKeys.has(cycleKey(c)));
  if (missing.length > 0) {
    await addCyclesMenstruels(missing.map(toPayload));
  }
};

export const syncCycles = async () => {
  if (!isSignedIn()) return;
  await uploadCycles();
  await downloadCycles();
  updateSessionUser({ lastSyncAt: new Date().toISOString() });
};
