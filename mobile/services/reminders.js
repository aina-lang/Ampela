import * as Notifications from "expo-notifications";
import moment from "moment";
import { reminderState, updateReminder, preferenceState } from "@/legendstate/AmpelaStates";
import { ensureNotificationPermission } from "@/utils/notifications";
import i18n from "@/constants/i18n";
import { accentFor } from "@/components/discovery/DiscoveryTheme";

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
 * La périodicité est prise au pied de la lettre, pour tous les rappels :
 *  - quotidien : chaque jour ; chaque deux / trois jours : tous les 2 ou
 *    3 jours ; hebdomadaire : tous les 7 jours — toujours à l'heure choisie,
 *    à partir d'aujourd'hui, sur les 60 prochains jours, avec un texte qui
 *    suit le cycle (« Règles dans 5 jours », « Pilule · jour 12 »…) ;
 *  - le jour même : uniquement le jour de l'événement (règles, ovulation) ;
 *    pour la pilule, une seule fois à la prochaine heure choisie.
 */
const stepDaysFor = (frequency) => {
  switch (frequency) {
    case "hebdomadaire":
      return 7;
    case "chaquedeuxjours":
      return 2;
    case "chaquetroisjours":
      return 3;
    case "quotidien":
    default:
      return 1;
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
/** Couleur du logo dans la notification : suit le thème choisi (Android). */
const notifColor = () => accentFor(preferenceState.theme.get());

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

const dayWord = (n) => (n === 7 ? i18n.t("notifOneWeek") : i18n.t("notifDays", { count: n }));

const buildContent = (kind, event, daysBefore) => {
  const dateFr = formatDateFr(event.date);
  if (kind === "period") {
    if (daysBefore > 0) {
      return {
        title: i18n.t("notifPeriodIn", { when: dayWord(daysBefore) }),
        body: i18n.t("notifPeriodInBody", { date: dateFr }),
      };
    }
    return {
      title: i18n.t("notifPeriodToday"),
      body: i18n.t("notifPeriodTodayBody", { date: dateFr }),
    };
  }
  // ovulation
  const { fecundityPeriodStart, fecundityPeriodEnd } = event.cycle;
  const window =
    fecundityPeriodStart && fecundityPeriodEnd
      ? ` ${i18n.t("notifFertileWindow", { from: shortDateFr(fecundityPeriodStart), to: shortDateFr(fecundityPeriodEnd) })}`
      : "";
  if (daysBefore > 0) {
    return {
      title: i18n.t("notifOvulationIn", { when: dayWord(daysBefore) }),
      body: `${i18n.t("notifOvulationInBody", { date: dateFr })}${window}`,
    };
  }
  return {
    title: i18n.t("jourDovulation"),
    body: `${i18n.t("notifOvulationTodayBody", { date: dateFr })}${window}`,
  };
};

const atTime = (dateKey, hour, minute) => {
  const d = moment(dateKey).toDate();
  d.setHours(hour, minute, 0, 0);
  return d;
};

// Rappel de cycle quotidien : une notification par jour sur les 60
// prochains jours, chacune adaptée à la position dans le cycle.
const EVENT_DAYS_AHEAD = 60;

const eventDailyContent = (kind, dateKey, cycles) => {
  const events = [...cycles]
    .map((cycle) => ({ date: kind === "period" ? cycle.startMenstruationDate : cycle.ovulationDate, cycle }))
    .filter((e) => e.date)
    .sort((a, b) => a.date.localeCompare(b.date));
  const next = events.find((e) => e.date >= dateKey);
  const current = cycleAt(dateKey, cycles);

  if (kind === "period") {
    // Règles en cours : entre le début et la fin des règles du cycle courant.
    if (current?.endMenstruationDate && dateKey > current.startMenstruationDate && dateKey <= current.endMenstruationDate) {
      const day = moment(dateKey).diff(moment(current.startMenstruationDate), "days") + 1;
      return {
        title: i18n.t("notifPeriodOngoing", { day }),
        body: i18n.t("notifPeriodOngoingBody", { date: formatDateFr(current.endMenstruationDate) }),
      };
    }
  } else if (
    current?.fecundityPeriodStart &&
    current?.fecundityPeriodEnd &&
    dateKey >= current.fecundityPeriodStart &&
    dateKey <= current.fecundityPeriodEnd &&
    next &&
    next.date !== dateKey
  ) {
    const daysToOvulation = moment(next.date).diff(moment(dateKey), "days");
    return {
      title: i18n.t("notifFertileOngoing"),
      body:
        daysToOvulation > 0
          ? i18n.t("notifFertileOngoingBody", { when: dayWord(daysToOvulation), date: formatDateFr(next.date) })
          : i18n.t("notifFertileUntil", { date: shortDateFr(current.fecundityPeriodEnd) }),
    };
  }
  if (!next) return null;
  const daysBefore = moment(next.date).diff(moment(dateKey), "days");
  return buildContent(kind, next, daysBefore);
};

/**
 * Une notification tous les `stepDays` jours à l'heure choisie, sur les 60
 * prochains jours, à partir d'aujourd'hui (ou de demain si l'heure est
 * passée). `contentFor(dateKey)` donne le texte du jour, ou null pour
 * sauter ce jour.
 */
const scheduleEvery = async (as, stepDays, hour, minute, contentFor) => {
  const now = new Date();
  const ids = [];
  const firstToday = atTime(moment().format("YYYY-MM-DD"), hour, minute) > now;
  for (let i = firstToday ? 0 : 1; i < EVENT_DAYS_AHEAD; i += stepDays) {
    const dateKey = moment().add(i, "days").format("YYYY-MM-DD");
    const content = contentFor(dateKey);
    if (!content) continue;
    const id = await Notifications.scheduleNotificationAsync({
      content: { ...content, sound: true, color: notifColor(), data: { kind: "reminder", as } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: atTime(dateKey, hour, minute) },
    });
    ids.push(id);
  }
  return ids;
};

// Rappel pilule : chaque notification est adaptée au cycle (jour du cycle,
// période de fécondité, début d'un nouveau cycle = nouvelle plaquette).

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
      title: i18n.t("priseDePilule"),
      body: i18n.t("notifPillBody", { time }),
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
      title: i18n.t("notifPillDay", { day: 1 }),
      body: i18n.t("notifPillDay1Body", { time }),
    };
  }
  if (inFertileWindow) {
    return {
      title: i18n.t("notifPillDay", { day: dayOfCycle }),
      body: i18n.t("notifPillFertileBody", { time }),
    };
  }
  return {
    title: i18n.t("notifPillDay", { day: dayOfCycle }),
    body: i18n.t("notifPillDayBody", { time }),
  };
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
    if (frequency === "lejourmeme") {
      // Une seule fois, à la prochaine heure choisie.
      const next = new Date();
      next.setHours(hour, minute, 0, 0);
      if (next <= new Date()) next.setDate(next.getDate() + 1);
      const dateKey = moment(next).format("YYYY-MM-DD");
      const id = await Notifications.scheduleNotificationAsync({
        content: { ...pillContent(dateKey, hour, minute, cycles), sound: true, color: notifColor(), data: { kind: "reminder", as } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: next },
      });
      return [id];
    }
    return scheduleEvery(as, stepDaysFor(frequency), hour, minute, (dateKey) =>
      pillContent(dateKey, hour, minute, cycles)
    );
  }

  if (frequency === "lejourmeme") {
    // Uniquement les jours d'événement (prochaines règles / ovulations).
    const now = new Date();
    const ids = [];
    for (const event of upcomingEvents(kind, cycles)) {
      const fireAt = atTime(event.date, hour, minute);
      if (fireAt <= now) continue;
      const id = await Notifications.scheduleNotificationAsync({
        content: { ...buildContent(kind, event, 0), sound: true, color: notifColor(), data: { kind: "reminder", as } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
      });
      ids.push(id);
    }
    return ids;
  }

  // Tous les N jours, avec un texte qui suit le cycle.
  return scheduleEvery(as, stepDaysFor(frequency), hour, minute, (dateKey) =>
    eventDailyContent(kind, dateKey, cycles)
  );
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
    // Pilule « le jour même » : notification unique, pas à renouveler.
    if (REMINDER_KIND[as] === "pill" && saved.frequency === "lejourmeme") continue;
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
