import { I18n } from "i18n-js";
import mgTranslation from "./locales/mg.json";
import frTranslation from "./locales/fr.json";
import { preferenceState } from "@/legendstate/AmpelaStates";

const i18n = new I18n();

i18n.translations = {
  mg: mgTranslation,
  fr: frTranslation,
};

i18n.defaultLocale = "fr";
i18n.locale = "fr";
i18n.enableFallback = true;

// Suit la préférence de langue en dehors de React (pas de hook ici).
const applyLanguage = (language) => {
  i18n.locale = language || i18n.defaultLocale;
};

applyLanguage(preferenceState.language.get());
preferenceState.language.onChange(({ value }) => applyLanguage(value));

export default i18n;
