import { apiGet, apiPatch, apiPut, isSignedIn, updateSessionUser, uploadImage } from "@/services/api";
import {
  getAllCycle,
  addCyclesMenstruels,
  deleteAllCycles,
  getUser,
  addUser,
  updateUserSqlite,
} from "@/services/database";
import {
  userState,
  preferenceState,
  reminderState,
  cycleMenstruelState,
  updateUser,
  updatePreference,
  updateReminder,
  updateCycleMenstruelData,
} from "@/legendstate/AmpelaStates";
import { scheduleReminder, cancelReminder, rescheduleAllReminders } from "@/services/reminders";
import { normalizeCycles } from "@/utils/menstruationUtils";

/**
 * Synchronisation multi-appareils, règle unique : « le plus récent gagne ».
 *
 * Chaque donnée porte l'horodatage de sa dernière modification par
 * l'utilisatrice (profil, préférences, jeu de cycles, chaque rappel). À
 * chaque synchronisation on compare l'horodatage local à celui du cloud :
 *   - cloud plus récent → on l'applique sur l'appareil ;
 *   - appareil plus récent → on l'envoie (le serveur refuse lui aussi tout
 *     envoi plus ancien que ce qu'il détient) ;
 *   - égaux → rien à faire.
 * Les données sans horodatage (anciennes versions) sont traitées comme les
 * plus anciennes : la version du cloud l'emporte si elle existe.
 */

const ts = (value) => (value ? new Date(value).getTime() : 0);
const nowIso = () => new Date().toISOString();
const EPOCH = "1970-01-01T00:00:00.000Z";

// ---------- Profil ----------

/** URL servie par le serveur (partageable entre appareils), par opposition à un fichier local. */
const isRemoteUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value);

/**
 * Une photo choisie hors connexion (onboarding, session expirée) n'est
 * qu'un fichier local : elle est envoyée sur le serveur avant d'être
 * synchronisée, sinon les autres appareils ne la verraient jamais.
 */
const ensureRemotePhoto = async (local) => {
  const image = local.profileImage;
  if (!image || isRemoteUrl(image)) return image ?? null;
  try {
    const url = await uploadImage(image);
    updateUser({ profileImage: url });
    return url;
  } catch (error) {
    // Envoi raté (réseau) : on n'envoie pas de photo du tout, pour ne pas
    // effacer celle du cloud ; réessayé à la prochaine synchronisation.
    console.log("Avatar upload during sync failed:", error?.message ?? error);
    return undefined;
  }
};

const profilePayload = (local) => ({
  username: local.username ?? "",
  // Rôle et spécialité : réservés à l'application des professionnelles
  // de santé (même backend) ; l'app Ampela ne les modifie jamais.
  lastMenstruationDate: local.lastMenstruationDate ?? null,
  durationMenstruation: local.durationMenstruation ?? null,
  cycleDuration: local.cycleDuration ?? null,
  profileImage: local.profileImage ?? null,
});

/**
 * Applique le profil cloud à l'état local et à la base SQLite. Avec
 * `fillFromLocal` (données non datées des anciennes versions), un champ
 * vide côté cloud garde sa valeur locale au lieu de l'effacer.
 */
export const applyRemoteProfile = async (remote, { fillFromLocal = false } = {}) => {
  const local = userState.get();
  const pick = (remoteValue, localValue) =>
    fillFromLocal ? (remoteValue ?? localValue ?? null) : (remoteValue ?? null);
  const fields = {
    username: remote.username ?? "",
    profession: remote.profession ?? local.profession ?? "",
    lastMenstruationDate: pick(remote.lastMenstruationDate, local.lastMenstruationDate),
    durationMenstruation: pick(remote.durationMenstruation, local.durationMenstruation),
    cycleDuration: pick(remote.cycleDuration, local.cycleDuration),
    email: remote.email ?? local.email ?? "",
    // Une photo du cloud qui n'est pas une URL (ancien chemin local d'un
    // autre appareil) est inutilisable ici : on garde la photo locale.
    profileImage: isRemoteUrl(remote.profileImage)
      ? remote.profileImage
      : (local.profileImage ?? null),
  };
  const row = await getUser();
  if (row) {
    await updateUserSqlite(
      row.id,
      fields.username,
      fields.profession,
      fields.lastMenstruationDate,
      fields.durationMenstruation,
      fields.cycleDuration,
      fields.email,
      fields.profileImage
    );
  } else {
    await addUser(
      fields.username,
      fields.profession,
      fields.lastMenstruationDate,
      fields.durationMenstruation,
      fields.cycleDuration,
      fields.email,
      fields.profileImage
    );
  }
  updateUser({
    id: row?.id ?? local.id ?? 1,
    ...fields,
    profileUpdatedAt: remote.profileUpdatedAt ?? null,
  });
};

const syncProfile = async (remote) => {
  const local = userState.get();
  const localTs = ts(local.profileUpdatedAt);
  const remoteTs = ts(remote.profileUpdatedAt);
  const remoteHas = !!remote.username;
  const localHas = !!local.username;

  if (remoteHas && (!localHas || remoteTs > localTs || (!localTs && !remoteTs))) {
    await applyRemoteProfile(remote, { fillFromLocal: !localTs && !remoteTs });
    return;
  }
  if (localHas && (!remoteHas || localTs > remoteTs)) {
    const stamp = local.profileUpdatedAt ?? nowIso();
    if (!local.profileUpdatedAt) updateUser({ profileUpdatedAt: stamp });
    const profileImage = await ensureRemotePhoto(local);
    const payload = { ...profilePayload(local), profileUpdatedAt: stamp };
    if (profileImage !== undefined) payload.profileImage = profileImage;
    else delete payload.profileImage;
    await apiPatch("/users/me", payload);
    return;
  }
  // À jour des deux côtés, mais une photo encore locale doit partir.
  if (localHas && local.profileImage && !isRemoteUrl(local.profileImage)) {
    const profileImage = await ensureRemotePhoto(local);
    if (profileImage) {
      const stamp = nowIso();
      updateUser({ profileUpdatedAt: stamp });
      await apiPatch("/users/me", { ...profilePayload(local), profileImage, profileUpdatedAt: stamp });
    }
  }
};

// ---------- Préférences (langue, thème) ----------

const syncPreferences = async (remote) => {
  const local = preferenceState.get();
  const remotePrefs = remote.preferences && typeof remote.preferences === "object" ? remote.preferences : null;
  const localTs = ts(local.preferencesUpdatedAt);
  const remoteTs = ts(remote.preferencesUpdatedAt);
  const localHas = !!(local.language || local.theme);

  if (remotePrefs && (remoteTs > localTs || (!localHas && remoteTs))) {
    updatePreference(
      {
        language: remotePrefs.language ?? local.language,
        theme: remotePrefs.theme ?? local.theme,
        preferencesUpdatedAt: remote.preferencesUpdatedAt ?? null,
      },
      { touch: false }
    );
    return;
  }
  if (localHas && (!remotePrefs || localTs > remoteTs)) {
    const stamp = local.preferencesUpdatedAt ?? nowIso();
    if (!local.preferencesUpdatedAt) updatePreference({ preferencesUpdatedAt: stamp }, { touch: false });
    await apiPatch("/users/me", {
      preferences: { language: local.language, theme: local.theme },
      preferencesUpdatedAt: stamp,
    });
  }
};

// ---------- Cycles ----------

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

/** Remplace les cycles locaux par ceux du cloud et replanifie les rappels. */
const replaceLocalCycles = async (remoteCycles, updatedAt) => {
  // Cohérence avec le profil : prédictions mélangées écartées à l'arrivée.
  const { kept, dropped } = normalizeCycles(remoteCycles, userState.get());
  await deleteAllCycles();
  if (kept.length > 0) await addCyclesMenstruels(kept.map(toPayload));
  const refreshed = await getAllCycle();
  // Si le cloud contenait du mélange, la version nettoyée devient la plus
  // récente et repartira vers le cloud au prochain passage.
  updateCycleMenstruelData(refreshed, dropped.length > 0 ? { touch: true } : { updatedAt: updatedAt ?? null });
  await rescheduleAllReminders(refreshed);
};

const syncCyclesLww = async (remote) => {
  const localTs = ts(cycleMenstruelState.cyclesUpdatedAt.get());
  const remoteTs = ts(remote.cyclesUpdatedAt);
  const localCycles = await getAllCycle();

  if (remoteTs && (remoteTs > localTs || localCycles.length === 0)) {
    const remoteCycles = await apiGet("/cycles");
    await replaceLocalCycles(remoteCycles ?? [], remote.cyclesUpdatedAt);
    return;
  }
  if (localCycles.length > 0 && (localTs > remoteTs || !remoteTs)) {
    if (!remoteTs && !localTs) {
      // Anciennes versions (aucun côté daté) : jamais de mélange des deux
      // jeux (cycles qui se chevauchent). Comme pour le profil, le cloud
      // l'emporte s'il a des cycles ; sinon l'appareil envoie les siens.
      const remoteCycles = (await apiGet("/cycles")) ?? [];
      if (remoteCycles.length > 0) {
        const stamp = nowIso();
        const result = await apiPut("/cycles", { cycles: remoteCycles.map(toPayload), replace: true, updatedAt: stamp });
        await replaceLocalCycles(remoteCycles, result?.cyclesUpdatedAt ?? stamp);
        return;
      }
    }
    const stamp = cycleMenstruelState.cyclesUpdatedAt.get() ?? nowIso();
    const result = await apiPut("/cycles", { cycles: localCycles.map(toPayload), replace: true, updatedAt: stamp });
    if (!result?.skipped) updateCycleMenstruelData(localCycles, { updatedAt: result?.cyclesUpdatedAt ?? stamp });
  }
};

// ---------- Rappels ----------

const REMINDER_FIELDS = ["enabled", "hour", "minute", "frequency"];

const syncReminders = async () => {
  const all = reminderState.get() || {};
  const payload = Object.entries(all)
    .filter(([, saved]) => saved && typeof saved === "object")
    .map(([name, saved]) => ({
      name,
      enabled: !!saved.enabled,
      hour: saved.hour ?? 8,
      minute: saved.minute ?? 0,
      frequency: saved.frequency ?? "quotidien",
      updatedAt: saved.updatedAt ?? EPOCH,
    }));

  const merged = await apiPut("/reminders", { reminders: payload });
  if (!Array.isArray(merged)) return;

  let cycles = null;
  for (const remote of merged) {
    const local = all[remote.name];
    if (local && ts(remote.updatedAt) <= ts(local.updatedAt)) continue;
    const changed = !local || REMINDER_FIELDS.some((f) => (local[f] ?? null) !== (remote[f] ?? null));
    const next = {
      enabled: !!remote.enabled,
      hour: remote.hour,
      minute: remote.minute,
      frequency: remote.frequency,
      updatedAt: remote.updatedAt,
    };
    if (changed) {
      // Le rappel a changé sur un autre appareil : on reprogramme ici.
      await cancelReminder(local || {});
      let ids = [];
      if (next.enabled) {
        if (!cycles) cycles = await getAllCycle();
        ids = (await scheduleReminder(remote.name, next, cycles)) ?? [];
      }
      Object.assign(next, { notificationIds: ids, notificationId: null, scheduledAt: Date.now() });
    }
    updateReminder(remote.name, next);
  }
};

// ---------- Orchestration ----------

let running = null;

/**
 * Synchronise tout (profil, préférences, cycles, rappels) avec le cloud.
 * Ne fait rien sans session. Les étapes sont indépendantes : l'échec de
 * l'une n'empêche pas les autres. Un seul passage à la fois.
 */
export const syncAll = () => {
  if (!isSignedIn()) return Promise.resolve();
  if (running) return running;
  running = (async () => {
    try {
      const remote = await apiGet("/users/me");
      if (!remote) return;
      const steps = [
        ["profile", () => syncProfile(remote)],
        ["preferences", () => syncPreferences(remote)],
        ["cycles", () => syncCyclesLww(remote)],
        ["reminders", () => syncReminders()],
      ];
      for (const [name, step] of steps) {
        try {
          await step();
        } catch (error) {
          // Silencieux pour l'utilisatrice : réessayé à la prochaine occasion.
          console.log(`Sync ${name} failed:`, error?.message ?? error);
        }
      }
      updateSessionUser({ lastSyncAt: nowIso() });
    } finally {
      running = null;
    }
  })();
  return running;
};

/** Compatibilité : les anciens appels « cycles seulement » passent par tout. */
export const syncCycles = syncAll;

// ---------- Arrière-plan ----------
//
// Local d'abord : chaque écran enregistre sur le téléphone et appelle
// `scheduleSync()`. La synchronisation part un peu plus tard, regroupée
// (plusieurs modifications rapprochées = un seul passage), sans jamais
// bloquer l'interface ni afficher d'erreur. Si le réseau manque, le
// prochain déclencheur (retour en ligne, retour au premier plan,
// minuterie) réessaie : les horodatages garantissent que rien de plus
// récent n'est écrasé.

let timer = null;

/** Demande une synchronisation groupée (par défaut 1,5 s plus tard). */
export const scheduleSync = (delayMs = 1500) => {
  if (!isSignedIn()) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    syncAll().catch(() => undefined);
  }, delayMs);
};

/** Synchronisation périodique tant que l'app est ouverte (10 min). */
export const SYNC_INTERVAL_MS = 10 * 60 * 1000;
