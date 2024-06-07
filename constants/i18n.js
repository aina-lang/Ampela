import { I18n } from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import mgTranslation from "./locales/mg.json";
import frTranslation from "./locales/fr.json";
import { updatePreference } from "@/redux/preferenceSlice";
import { useDispatch } from "react-redux";

const i18n = new I18n();

i18n.translations = {
  mg: mgTranslation,
  fr: frTranslation,
};

i18n.enableFallback = true;
i18n.defaultLocale = "fr";

export const loadLocale = async () => {
  const dispatch = useDispatch();
  try {
    const storedLocale = await AsyncStorage.getItem("user-locale");
    if (storedLocale) {
      i18n.locale = storedLocale;
    } else {
      i18n.locale = i18n.defaultLocale;
    }
    const preferenceData = {
      language: i18n.locale,
    };
    dispatch(updatePreference(preferenceData));
  } catch (error) {
    console.error("Failed to load locale from AsyncStorage:", error);
    i18n.locale = i18n.defaultLocale;
  }
};


export default i18n;
