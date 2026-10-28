import moment from "moment";

/**
 * Règles de calcul (méthode du calendrier, support de formation PF) :
 *  - J1 du cycle = premier jour des règles ;
 *  - ovulation = 14 jours avant les prochaines règles → J1 + (cycle − 14) ;
 *  - période féconde : du J1 + (cycle − 18) (14 j post-ovulatoires + 4 j de
 *    survie des spermatozoïdes) au J1 + (cycle − 11) (14 − 3 j de survie de
 *    l'ovule). Exemple du support : règles le 10/09, cycle de 28 j →
 *    féconde du 20/09 au 27/09, ovulation le 24/09.
 */
export function getOvulationDate(lastMenstruationDate, cycleDurations) {
  // console.log(moment(lastMenstruationDate).format("YYYY-MM-DD"));
  const ovulationDate = moment(lastMenstruationDate).add(
    cycleDurations - 14,
    "days"
  );

  // if (ovulationDate.isLeapYear()) {
  //   ovulationDate.add(1, "days");
  // }

  const formattedDate = ovulationDate.format("YYYY-MM-DD");
  return { ovulationDate: formattedDate };
}

export function getFecundityPeriod(lastMenstruationDate, cycleDurations) {
  const j1 = parseInt(cycleDurations) - 18;
  const j2 = parseInt(cycleDurations) - 11;

  const startFecondityDate = moment(lastMenstruationDate)
    .add(j1, "days")
    .format("YYYY-MM-DD");
  const endFecondityDate = moment(lastMenstruationDate)
    .add(j2, "days")
    .format("YYYY-MM-DD");

  return {
    startFecondityDate: startFecondityDate,
    endFecondityDate: endFecondityDate,
  };
}

export function getMenstruationPeriod(
  lastMenstruationDate,
  cycleDuration,
  menstruationDuration
) {
  const nextMenstruationDate = moment(lastMenstruationDate).add(
    cycleDuration,
    "days"
  );
  const nextMenstruationEndDate = moment(lastMenstruationDate)
    .add(cycleDuration, "days")
    .subtract(1, "days")
    .add(menstruationDuration, "days");
  return {
    nextMenstruationDate: nextMenstruationDate.format("YYYY-MM-DD"),
    nextMenstruationEndDate: nextMenstruationEndDate.format("YYYY-MM-DD"),
  };
}

export function generateCycleMenstrualData(
  startDate,
  cycleDuration,
  menstruationDuration
) {
  // console.log(startDate, cycleDuration, menstruationDuration);
  // Tableau pour stocker les données de chaque mois
  const cyclesData = [];

  let lastMenstruationDate1 = moment(startDate);
  let temp = lastMenstruationDate1;

  for (let i = 0; i < 12; i++) {
    // Calcule les informations pour le cycle menstruel de ce mois

    let currentMonth = moment(temp);
    // console.log(currentMonth);
    const ovulationDate = getOvulationDate(
      currentMonth.format("YYYY-MM-DD"),
      cycleDuration
    );
    const fecundityPeriod = getFecundityPeriod(
      currentMonth.format("YYYY-MM-DD"),
      cycleDuration
    );
    const menstruationPeriod = getMenstruationPeriod(
      currentMonth.format("YYYY-MM-DD"),
      cycleDuration,
      menstruationDuration
    );

    // Ajout des données calculées pour ce mois au tableau des données des cycles
    cyclesData.push({
      month: currentMonth.format("MMMM YYYY"),
      ovulationDate: ovulationDate.ovulationDate,
      fecundityPeriodStart: fecundityPeriod.startFecondityDate,
      fecundityPeriodEnd: fecundityPeriod.endFecondityDate,
      startMenstruationDate: moment(lastMenstruationDate1).format("YYYY-MM-DD"),
      endMenstruationDate: moment(lastMenstruationDate1)
        .add(parseInt(menstruationDuration) - 1, "days")
        .format("YYYY-MM-DD"),
      nextMenstruationDate: menstruationPeriod.nextMenstruationDate,
      nextMenstruationEndDate: menstruationPeriod.nextMenstruationEndDate,
    });

    // console.log(ovulationDate.ovulationDate);
    // Passage au mois suivant

    currentMonth.add(1, "month");
    (lastMenstruationDate1 = menstruationPeriod.nextMenstruationDate),
      (temp = menstruationPeriod.nextMenstruationDate);
  }

  return cyclesData;
}

/**
 * Jeu de cycles cohérent avec les informations actuelles.
 *
 * Un jeu stocké peut mélanger plusieurs générations de prédictions
 * (anciennes versions de la synchronisation, restaurations) : des cycles
 * qui commencent à quelques jours d'écart et se chevauchent. On garde :
 *  - à partir de la dernière date de règles saisie : uniquement la chaîne
 *    J1 + k × durée du cycle (celle que l'onboarding / « Modifier le
 *    cycle » génère), toute autre prédiction est écartée ;
 *  - avant cette date (historique) : un seul cycle par période, deux
 *    débuts à moins de 15 jours d'écart ne pouvant pas être deux cycles
 *    réels (le plus récent l'emporte, car il vient de la saisie la plus
 *    récente).
 * Renvoie { kept, dropped }.
 */
export function normalizeCycles(cycles = [], { lastMenstruationDate, cycleDuration } = {}) {
  const valid = cycles.filter((c) => c?.startMenstruationDate);
  // Doublons exacts : la dernière ligne insérée l'emporte.
  const byStart = new Map();
  for (const cycle of valid) byStart.set(cycle.startMenstruationDate, cycle);
  const sorted = [...byStart.values()].sort((a, b) =>
    a.startMenstruationDate.localeCompare(b.startMenstruationDate)
  );

  const length = Number(cycleDuration) || 0;
  const anchor = lastMenstruationDate ? moment(lastMenstruationDate) : null;
  const inChain = (cycle) => {
    if (!anchor || !length) return true;
    const diff = moment(cycle.startMenstruationDate).diff(anchor, "days");
    return diff >= 0 && diff % length === 0;
  };

  const kept = [];
  const history = sorted.filter((c) => anchor && moment(c.startMenstruationDate).isBefore(anchor));
  const future = sorted.filter((c) => !anchor || !moment(c.startMenstruationDate).isBefore(anchor));

  // Historique : on parcourt du plus récent au plus ancien, en écartant tout
  // début à moins de 15 jours du dernier conservé.
  let lastKeptStart = anchor;
  for (const cycle of [...history].reverse()) {
    const gap = lastKeptStart ? lastKeptStart.diff(moment(cycle.startMenstruationDate), "days") : 99;
    if (gap < 15) continue;
    kept.unshift(cycle);
    lastKeptStart = moment(cycle.startMenstruationDate);
  }
  for (const cycle of future) {
    if (inChain(cycle)) kept.push(cycle);
  }

  const keptIds = new Set(kept.map((c) => c.id ?? c.startMenstruationDate));
  const dropped = cycles.filter((c) => !keptIds.has(c.id ?? c.startMenstruationDate));
  return { kept, dropped };
}
