import * as Notifications from "expo-notifications";
import moment from "moment";
import { reminderState, updateReminder, preferenceState } from "@/legendstate/AmpelaStates";
import { ensureNotificationPermission } from "@/utils/notifications";

/**
 * Rappels planifiés côté OS (délivrés même app fermée).
 *
 *  - « Début des règles » et « Jour d'ovulation » : rappels liés aux
 *    événements prédits du cycle. Pour chaque événement à venir, une
 *    notification N jours avant (si N > 0) et une le jour même, avec la
 *    date et le contexte dans le texte.
 *  - « Prise de pilule » : rappel quotidien à heure fixe.
 */
export const REMINDER_KIND = {
  "Début des règles": "period",
  "Jour d'ovulation": "ovulation",
  "Prise de pilule": "pill",
};

// Clé i18n du libellé affiché pour chaque rappel (la clé interne `as`
// reste en français : elle sert d'identifiant dans reminderState).
export const REMINDER_LABEL_KEY = {
  "Début des règles": "debutDesRegles",
  "Jour d'ovulation": "jourDovulation",
  "Prise de pilule": "priseDePilule",
};

export const FREQUENCY_OPTIONS = [
  { label: "Quotidien", labelKey: "frequencyDaily", value: "quotidien" },
  { label: "Hebdomadaire", labelKey: "frequencyWeekly", value: "hebdomadaire" },
  { label: "Le jour même", labelKey: "frequencySameDay", value: "lejourmeme" },
  { label: "Chaque deux jours", labelKey: "frequencyEveryTwoDays", value: "chaquedeuxjours" },
  { label: "Chaque trois jours", labelKey: "frequencyEveryThreeDays", value: "chaquetroisjours" },
];

/**
 * Pour les rappels liés au cycle, la périodicité fixe les jours d'avance :
 *  - quotidien : chaque jour des 3 jours précédents, puis le jour même ;
 *  - hebdomadaire : une semaine avant, puis le jour même ;
 *  - le jour même : uniquement le jour prévu ;
 *  - chaque deux / trois jours : 2 ou 3 jours avant, puis le jour même.
 */
const daysBeforeFor = (frequency) => {
  switch (frequency) {
    case "hebdomadaire":
      return [7, 0];
    case "lejourmeme":
      return [0];
    case "chaquedeuxjours":
      return [2, 0];
    case "chaquetroisjours":
      return [3, 0];
    case "quotidien":
    default:
      return [3, 2, 1, 0];
  }
};

/** Déclencheur répétitif pour la pilule (périodicité d'avant). */
const pillTrigger = (frequency, hour, minute) => {
  const T = Notifications.SchedulableTriggerInputTypes;
  switch (frequency) {
    case "hebdomadaire":
      return { type: T.WEEKLY, weekday: new Date().getDay() + 1, hour, minute };
    case "chaquedeuxjours":
    case "chaquetroisjours": {
      const days = frequency === "chaquedeuxjours" ? 2 : 3;
      return { type: T.TIME_INTERVAL, seconds: days * 24 * 60 * 60, repeats: true };
    }
    case "lejourmeme": {
      const next = new Date();
      next.setHours(hour, minute, 0, 0);
      if (next <= new Date()) next.setDate(next.getDate() + 1);
      return { type: T.DATE, date: next };
    }
    case "quotidien":
    default:
      return { type: T.DAILY, hour, minute };
  }
};

// Jusqu'à 12 mois d'événements, soit au plus 24 notifications par rappel.
const MAX_EVENTS = 12;

const DAY_NAMES = {
  fr: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
  mg: ["alahady", "alatsinainy", "talata", "alarobia", "alakamisy", "zoma", "sabotsy"],
};
const MONTH_NAMES = {
  fr: [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ],
  mg: [
    "janoary", "febroary", "martsa", "aprily", "may", "jona",
    "jolay", "aogositra", "septambra", "oktobra", "novambra", "desambra",
  ],
};
const lang = () => (preferenceState.language.get() === "mg" ? "mg" : "fr");

/** « mercredi 12 novembre » dans la langue de l'app (sans locale moment). */
export const formatDateFr = (input) => {
  const d = moment(input);
  const l = lang();
  return `${DAY_NAMES[l][d.day()]} ${d.date()} ${MONTH_NAMES[l][d.month()]}`;
};

/** « 12 novembre » (sans le jour de la semaine, pour les intervalles). */
const shortDateFr = (input) => {
  const d = moment(input);
  return `${d.date()} ${MONTH_NAMES[lang()][d.month()]}`;
};

const pad = (n) => String(n).padStart(2, "0");

/** Événements à venir (triés) pour un type de rappel, d'après les cycles. */
export const upcomingEvents = (kind, cycles = []) => {
  const today = moment().startOf("day");
  return [...cycles]
    .map((cycle) => ({
      date: kind === "period" ? cycle.startMenstruationDate : cycle.ovulationDate,
      cycle,
    }))
    .filter((e) => e.date && moment(e.date).isSameOrAfter(today))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, MAX_EVENTS);
};

const dayWord = (n) => (n === 7 ? "1 semaine" : `${n} jour${n > 1 ? "s" : ""}`);

const buildContent = (kind, event, daysBefore) => {
  const dateFr = formatDateFr(event.date);
  if (kind === "period") {
    if (daysBefore > 0) {
      return {
        title: `Règles dans ${dayWord(daysBefore)}`,
        body: `Vos prochaines règles sont prévues ${dateFr}. Pensez à prévoir vos protections.`,
      };
    }
    return {
      title: "Règles prévues aujourd'hui",
      body: `D'après votre cycle, vos règles devraient commencer aujourd'hui (${dateFr}). Si ce n'est pas le cas, mettez à jour vos informations dans Ampela.`,
    };
  }
  // ovulation
  const { fecundityPeriodStart, fecundityPeriodEnd } = event.cycle;
  const window =
    fecundityPeriodStart && fecundityPeriodEnd
      ? ` Période de fécondité du ${shortDateFr(fecundityPeriodStart)} au ${shortDateFr(fecundityPeriodEnd)}.`
      : "";
  if (daysBefore > 0) {
    return {
      title: `Ovulation dans ${dayWord(daysBefore)}`,
      body: `Votre ovulation est estimée ${dateFr}.${window}`,
    };
  }
  return {
    title: "Jour d'ovulation",
    body: `Aujourd'hui (${dateFr}) est votre jour d'ovulation estimé, le pic de votre période de fécondité.${window}`,
  };
};

const atTime = (dateKey, hour, minute) => {
  const d = moment(dateKey).toDate();
  d.setHours(hour, minute, 0, 0);
  return d;
};

// Rappel pilule quotidien : une notification par jour sur les 60 prochains
// jours, chacune adaptée au cycle (jour du cycle, période de fécondité,
// début d'un nouveau cycle = nouvelle plaquette).
const PILL_DAYS_AHEAD = 60;

/** Cycle qui contient la date (début ≤ date < début suivant), sinon null. */
const cycleAt = (dateKey, cycles = []) => {
  const sorted = [...cycles]
    .filter((c) => c.startMenstruationDate)
    .sort((a, b) => a.startMenstruationDate.localeCompare(b.startMenstruationDate));
  let found = null;
  for (const cycle of sorted) {
    if (cycle.startMenstruationDate <= dateKey) found = cycle;
    else break;
  }
  return found;
};

const pillContent = (dateKey, hour, minute, cycles) => {
  const time = `${pad(hour)}:${pad(minute)}`;
  const cycle = cycleAt(dateKey, cycles);
  if (!cycle) {
    return {
      title: "Prise de pilule",
      body: `C'est l'heure de votre pilule (${time}). Prenez-la chaque jour au même moment, dans une plage de 3 heures au plus.`,
    };
  }
  const dayOfCycle = moment(dateKey).diff(moment(cycle.startMenstruationDate), "days") + 1;
  const inFertileWindow =
    cycle.fecundityPeriodStart &&
    cycle.fecundityPeriodEnd &&
    dateKey >= cycle.fecundityPeriodStart &&
    dateKey <= cycle.fecundityPeriodEnd;

  if (dayOfCycle === 1) {
    return {
      title: "Pilule · jour 1 du cycle",
      body: `Premier jour de votre cycle : c'est l'heure de votre pilule (${time}). Si vous débutez la pilule, la première plaquette se commence aujourd'hui (au plus tard le 5e jour du cycle).`,
    };
  }
  if (inFertileWindow) {
    return {
      title: `Pilule · jour ${dayOfCycle} du cycle`,
      body: `C'est l'heure de votre pilule (${time}). D'après votre calendrier, vous seriez en période de fécondité : ne sautez aucune prise et restez dans la plage de 3 heures.`,
    };
  }
  return {
    title: `Pilule · jour ${dayOfCycle} du cycle`,
    body: `C'est l'heure de votre pilule (${time}). Même moment chaque jour, plaquette suivante dès la fin de celle-ci, sans pause.`,
  };
};

const schedulePillDaily = async (hour, minute, cycles) => {
  const now = new Date();
  const ids = [];
  for (let i = 0; i < PILL_DAYS_AHEAD; i++) {
    const dateKey = moment().add(i, "days").format("YYYY-MM-DD");
    const fireAt = atTime(dateKey, hour, minute);
    if (fireAt <= now) continue;
    const id = await Notifications.scheduleNotificationAsync({
      content: { ...pillContent(dateKey, hour, minute, cycles), sound: true, data: { kind: "reminder", as: "Prise de pilule" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
    });
    ids.push(id);
  }
  return ids;
};

/**
 * Planifie un rappel et renvoie les identifiants des notifications.
 * config = { hour, minute, frequency } ; cycles = cyclesData.
 */
export const scheduleReminder = async (as, config, cycles) => {
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  const kind = REMINDER_KIND[as] ?? "pill";
  const { hour = 8, minute = 0, frequency = "quotidien" } = config;

  if (kind === "pill") {
    if (frequency === "quotidien") {
      return schedulePillDaily(hour, minute, cycles);
    }
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Prise de pilule",
        body: `C'est l'heure de votre pilule (${pad(hour)}:${pad(minute)}). La prendre à heure fixe garantit son efficacité.`,
        sound: true,
        data: { kind: "reminder", as: "Prise de pilule" },
      },
      trigger: pillTrigger(frequency, hour, minute),
    });
    return [id];
  }

  const now = new Date();
  const ids = [];
  const slots = daysBeforeFor(frequency);
  for (const event of upcomingEvents(kind, cycles)) {
    for (const before of slots) {
      const fireAt = atTime(
        moment(event.date).subtract(before, "days").format("YYYY-MM-DD"),
        hour,
        minute
      );
      if (fireAt <= now) continue;
      const id = await Notifications.scheduleNotificationAsync({
        content: { ...buildContent(kind, event, before), sound: true, data: { kind: "reminder", as } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
      });
      ids.push(id);
    }
  }
  return ids;
};

export const cancelReminder = async (saved = {}) => {
  const ids = [
    ...(Array.isArray(saved.notificationIds) ? saved.notificationIds : []),
    ...(saved.notificationId ? [saved.notificationId] : []),
  ];
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)
    )
  );
};

/** Prochaine date d'événement (texte court) pour l'affichage. */
export const nextEventLabel = (as, cycles) => {
  const kind = REMINDER_KIND[as];
  if (!kind || kind === "pill") return null;
  const next = upcomingEvents(kind, cycles)[0];
  return next ? formatDateFr(next.date) : null;
};

/**
 * À appeler après une mise à jour des informations de cycle : chaque
 * rappel actif lié au cycle est replanifié sur les nouvelles dates.
 */
export const rescheduleAllReminders = async (cycles, { onlyIfStale = false } = {}) => {
  const all = reminderState.get() || {};
  const staleBefore = Date.now() - REFRESH_AFTER_DAYS * 24 * 60 * 60 * 1000;
  for (const [as, saved] of Object.entries(all)) {
    if (!saved?.enabled) continue;
    // La pilule ne dépend du cycle qu'en mode quotidien (texte par jour du cycle).
    if (REMINDER_KIND[as] === "pill" && (saved.frequency ?? "quotidien") !== "quotidien") continue;
    if (onlyIfStale && saved.scheduledAt && saved.scheduledAt > staleBefore) continue;
    try {
      await cancelReminder(saved);
      const ids = await scheduleReminder(as, saved, cycles);
      updateReminder(as, {
        notificationIds: ids ?? [],
        notificationId: null,
        scheduledAt: Date.now(),
      });
    } catch (error) {
      console.error(`Failed to reschedule reminder ${as}:`, error);
    }
  }
};

// Les notifications sont planifiées sur une fenêtre glissante (60 jours
// pour la pilule, 12 mois pour le cycle) : on la renouvelle à l'ouverture
// de l'app dès que la dernière programmation a plus de 30 jours.
const REFRESH_AFTER_DAYS = 30;
export const refreshRemindersIfStale = (cycles) =>
  rescheduleAllReminders(cycles, { onlyIfStale: true });
