import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SIZES, COLORS, images } from "@/constants";
import HeaderWithGoBack from "@/components/header-with-go-back";
import { useNavigation } from "expo-router";
import ProgressBar from "@/components/ProgreessBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/constants/i18n";
import { updatePreference } from "@/redux/preferenceSlice";
import { useDispatch } from "react-redux";
import { ThemeContext } from "@/hooks/theme-context";
import { useContext } from "react";

const ChangeLanguageScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {theme} = useContext(ThemeContext);
  const changeLanguage = async (lang) => {
    try {
      i18n.locale = lang;
      const preferenceData = {
        language: lang,
      };
      dispatch(updatePreference(preferenceData));
      await AsyncStorage.setItem("user-locale", lang);
    } catch (error) {
      console.error("Failed to save locale to AsyncStorage:", error);
    } finally {
    }
  };

  return (
    <>
     
      <View
        style={[
          styles.container,
          {
            backgroundColor:
             theme === "pink" ? COLORS.neutral200 : COLORS.neutral100,
          },
        ]}
      >
        <HeaderWithGoBack title="Langues" navigation={navigation} />
     
        <View style={{ gap: 20, marginTop: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor:
              i18n.locale === "fr" ? "rgba(226,68,92, .8)" : "rgba(226,68,92, .4)",
              borderRadius: 5,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: 10,
            }}
            onPress={() => changeLanguage("fr")}
          >
            <Text style={{ color: COLORS.neutral100, fontFamily: "SBold" }}>
              Français
            </Text>
            <Image
              source={images.franceImg}
              style={{ width: 30, height: 20, borderRadius: 5 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor:
              i18n.locale === "mg" ? "rgba(226,68,92, .8)" : "rgba(226,68,92, .4)",
              borderRadius: 5,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: 10,
            }}
            onPress={() => changeLanguage("mg")}
          >
            <Text style={{ color: COLORS.neutral100, fontFamily: "SBold" }}>
              Malagasy
            </Text>
            <Image
              source={images.madagascarImg}
              style={{ width: 30, height: 20, borderRadius: 5 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  medium: {
    fontFamily: "Medium",
    fontSize: SIZES.medium,
  },
  content: {
    marginTop: 100,
  },
  flex: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
});

export default ChangeLanguageScreen;
