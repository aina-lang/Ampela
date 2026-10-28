import { LocaleConfig } from "react-native-calendars";
import { preferenceState } from "@/legendstate/AmpelaStates";

/**
 * Locales du calendrier (react-native-calendars), partagées par l'accueil et
 * l'onboarding. Suit la langue choisie dans les préférences.
 */
LocaleConfig.locales["fr"] = {
  monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
  monthNamesShort: ["Janv.", "Févr.", "Mars", "Avril", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."],
  dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
  dayNamesShort: ["Di.", "Lu.", "Ma.", "Me.", "Je.", "Ve.", "Sa."],
  today: "Aujourd'hui",
};

LocaleConfig.locales["mg"] = {
  monthNames: ["Janoary", "Febroary", "Martsa", "Aprily", "May", "Jona", "Jolay", "Aogositra", "Septambra", "Oktobra", "Novambra", "Desambra"],
  monthNamesShort: ["Jan.", "Febr.", "Mar.", "Apr.", "May", "Jona", "Jolay", "Aogo.", "Sept.", "Okt.", "Nov.", "Des."],
  dayNames: ["Alahady", "Alatsinainy", "Talata", "Alarobia", "Alakamisy", "Zoma", "Sabotsy"],
  dayNamesShort: ["Alh.", "Alt.", "Tal.", "Alr.", "Alk.", "Zo.", "Sa."],
  today: "Androany",
};

const apply = (language) => {
  LocaleConfig.defaultLocale = language === "mg" ? "mg" : "fr";
};
apply(preferenceState.language.get());
preferenceState.language.onChange(({ value }) => apply(value));

/** Noms des mois dans la langue active. */
export const monthNames = () =>
  LocaleConfig.locales[LocaleConfig.defaultLocale]?.monthNames ?? LocaleConfig.locales.fr.monthNames;

export { LocaleConfig };
