import moment from "moment";

export function getOvulationDate(lastMenstruationDate, cycleDurations) {
  const ovulationDate = moment(lastMenstruationDate).add(
    cycleDurations - 14,
    "days"
  );

  if (ovulationDate.isLeapYear()) {
    ovulationDate.add(1, "days");
  }

  const formattedDate = ovulationDate.format("YYYY-MM-DD");
  return { ovulationDate: formattedDate };
}

export function getFecundityPeriod(lastMenstruationDate, cycleDurations) {
  const j1 = cycleDurations - 18;
  const j2 = cycleDurations - 11;

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
  // Tableau pour stocker les données de chaque mois
  const cyclesData = [];

  let lastMenstruationDate1 = moment(startDate);

  for (let i = 0; i < 12; i++) {
    // Calcule les informations pour le cycle menstruel de ce mois

    let currentMonth = moment(lastMenstruationDate1);

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
      nextMenstruationDate: menstruationPeriod.nextMenstruationDate,
      nextMenstruationEndDate: menstruationPeriod.nextMenstruationEndDate,
    });

    // Passage au mois suivant
    currentMonth.add(1, "month");
    lastMenstruationDate1 = menstruationPeriod.nextMenstruationDate;
  }

  return cyclesData;
}
