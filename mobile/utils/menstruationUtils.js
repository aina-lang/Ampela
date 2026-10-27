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
