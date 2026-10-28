/**
 * Deux acteurs dans Ampela : l'utilisatrice et la professionnelle de santé
 * (« docteur »). La profession ne sert qu'à préciser la spécialité des
 * professionnelles (sage-femme, gynécologue…).
 */
export const ROLES = {
  user: "user",
  doctor: "doctor",
};

export const ROLE_LABEL = {
  user: "Utilisatrice",
  doctor: "Professionnelle de santé",
};

/** Professionnelle de santé effective : rôle « doctor » et statut vérifié (invitation). */
export const isDoctor = (person) =>
  person?.role === ROLES.doctor &&
  (person?.verificationStatus === undefined || person?.verificationStatus === "verified");

/** « Sage-femme · Professionnelle de santé », « Professionnelle de santé » ou "" pour une utilisatrice. */
export const describeRole = (person) => {
  if (!isDoctor(person)) return "";
  return [person.profession, ROLE_LABEL.doctor].filter(Boolean).join(" · ");
};
