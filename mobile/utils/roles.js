import i18n from "@/constants/i18n";

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
  user: "Ampela",
  // Lu à l'affichage pour suivre la langue courante.
  get doctor() {
    return i18n.t("roleDoctor");
  },
};

/** Professionnelle de santé effective : rôle « doctor » et statut vérifié (invitation). */
export const isDoctor = (person) =>
  person?.role === ROLES.doctor &&
  (person?.verificationStatus === undefined || person?.verificationStatus === "verified");

/** « Professionnelle de santé » (sans la spécialité) ou "" pour une utilisatrice. */
export const describeRole = (person) => (isDoctor(person) ? ROLE_LABEL.doctor : "");
