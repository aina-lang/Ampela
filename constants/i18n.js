import { I18n } from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import mgTranslation from "./locales/mg.json";
import frTranslation from "./locales/fr.json";
import { preferenceState, updatePreference } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";

const i18n = new I18n();

i18n.translations = {
  mg: mgTranslation,
  fr: frTranslation,
};

i18n.enableFallback = true;
i18n.defaultLocale = "fr";

const loadLocale = async () => {
  try {
    const { language } = useSelector(() => preferenceState.get());
    if (language) {
      i18n.locale = language;
    } else {
      i18n.locale = i18n.defaultLocale;
    }
    const preferenceData = {
      language: i18n.locale,
    };
    updatePreference(preferenceData);
  } catch (error) {
    console.error("Failed to load locale from AsyncStorage:", error);
    i18n.locale = i18n.defaultLocale;
  }
};



export default i18n;
