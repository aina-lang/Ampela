import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SIZES, COLORS, images } from "@/constants";
import AppHeader from "@/components/AppHeader";
import { useNavigation } from "expo-router";
import i18n from "@/constants/i18n";
import { preferenceState, updatePreference } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { Ionicons } from "@expo/vector-icons";

const ChangeLanguageScreen = () => {
  const navigation = useNavigation();
  const { theme, language } = useSelector(() => preferenceState.get());
  const changeLanguage = async (lang) => {
    try {
      i18n.locale = lang;
      const preferenceData = {
        language: lang,
      };
      updatePreference(preferenceData);
    } catch (error) {
      console.error("Failed to save locale to AsyncStorage:", error);
    }
  };

  const accentColor = theme === "pink" ? COLORS.accent500 : COLORS.accent800;
  const cardBg = theme === "pink" ? COLORS.neutral100 : COLORS.neutral280;
  const cardBorder = theme === "pink" ? "#F0C8C8" : "#E8D5C4";

  const languages = [
    { key: "fr", label: "Français", flag: images.franceImg },
    { key: "mg", label: "Malagasy", flag: images.madaImg },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme === "pink" ? COLORS.neutral200 : COLORS.neutral100,
        },
      ]}
    >
      <AppHeader navigation={navigation} title="Langues" showBack absolute />
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {languages.map((lang, index) => (
            <View key={lang.key}>
              <TouchableOpacity
                style={styles.langRow}
                onPress={() => changeLanguage(lang.key)}
                activeOpacity={0.7}
              >
                <View style={styles.left}>
                  <View style={styles.iconWrapper}>
                    <Ionicons
                      name="language"
                      size={18}
                      color={accentColor}
                    />
                  </View>
                  <Text style={[styles.langLabel, { color: COLORS.primary }]}>{lang.label}</Text>
                </View>
                <View style={styles.right}>
                  <Image source={lang.flag} style={styles.flag} />
                  {language === lang.key && (
                    <View style={[styles.checkCircle, { backgroundColor: accentColor }]}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={COLORS.neutral100}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              {index < languages.length - 1 && (
                <View style={[styles.divider, { backgroundColor: cardBorder }]} />
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 130,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrapper: {
    width: 32,
    alignItems: "center",
  },
  langLabel: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  flag: {
    width: 30,
    height: 20,
    borderRadius: 5,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
  },
});

export default ChangeLanguageScreen;
