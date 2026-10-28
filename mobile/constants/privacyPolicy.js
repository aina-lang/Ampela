/**
 * Politique de confidentialité affichée dans l'application (Profil →
 * Confidentialité). Reflète ce que fait réellement l'app : données de
 * cycle stockées sur le téléphone, compte en ligne optionnel, aucune
 * revente de données. Les textes sont dans les locales (privacy*).
 */
export const PRIVACY_UPDATED_AT = "2026-10-27";

/** Adresse de contact affichée dans la politique (même que « Envoyer un feedback »). */
export const PRIVACY_CONTACT_EMAIL = "contact@ampela.com";

/** Sections : icône + clés i18n du titre et du corps. */
export const PRIVACY_SECTIONS = [
  { icon: "phone-portrait-outline", title: "privacy1Title", body: "privacy1Text" },
  { icon: "cloud-outline", title: "privacy2Title", body: "privacy2Text" },
  { icon: "mail-outline", title: "privacy3Title", body: "privacy3Text" },
  { icon: "chatbubbles-outline", title: "privacy4Title", body: "privacy4Text" },
  { icon: "shield-checkmark-outline", title: "privacy5Title", body: "privacy5Text" },
  { icon: "time-outline", title: "privacy6Title", body: "privacy6Text" },
  { icon: "trash-outline", title: "privacy7Title", body: "privacy7Text" },
  { icon: "person-outline", title: "privacy8Title", body: "privacy8Text" },
];
