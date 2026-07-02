import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SIZES, COLORS, images } from "@/constants";
import { useNavigation } from "expo-router";
import i18n from "@/constants/i18n";
import { preferenceState, updatePreference } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";

const selectlanguage = () => {
  const navigation = useNavigation();
  const { language } = useSelector(() => preferenceState.get());

  const changeLanguage = async (lang) => {
    try {
      i18n.locale = lang;
      await updatePreference({ language: lang });
    } catch (error) {
      console.error("Failed to save locale to AsyncStorage:", error);
    }
  };

  const handleNextBtnPress = useCallback(() => {
    navigation.navigate("confidentiality");
  }, []);

  const LanguageCard = ({ code, label, flag }) => {
    const selected = language === code;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => changeLanguage(code)}
        style={[
          styles.card,
          {
            backgroundColor: selected ? "#FF7575" : "rgba(255,117,117,.08)",
            borderColor: selected ? "#FF7575" : "rgba(255,117,117,.25)",
          },
        ]}
      >
        <View style={styles.cardLeft}>
          <Image source={flag} style={styles.flag} />
          <Text
            style={[
              styles.cardLabel,
              { color: selected ? COLORS.neutral100 : "#FF7575" },
            ]}
          >
            {label}
          </Text>
        </View>

        <View
          style={[
            styles.radioOuter,
            { borderColor: selected ? COLORS.neutral100 : "#FF7575" },
          ]}
        >
          {selected && (
            <View style={[styles.radioInner, { backgroundColor: COLORS.neutral100 }]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Bienvenue</Text>
        <Text style={styles.title}>Choisissez votre langue</Text>
        <Text style={styles.subtitle}>
          Vous pourrez la modifier plus tard dans les paramètres
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.cardsWrapper}>
        <LanguageCard code="fr" label="Français" flag={images.franceImg} />
        <LanguageCard code="mg" label="Malagasy" flag={images.madaImg} />
      </View>

      {/* Bottom button */}
      <View style={styles.btnBox}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNextBtnPress}
          activeOpacity={0.9}
        >
          <Text style={styles.nextBtnText}>Suivant</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.neutral100} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  header: {
    marginBottom: SIZES.height * 0.05,
  },
  eyebrow: {
    color: "#FF7575",
    fontFamily: "SBold",
    fontSize: SIZES.small,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.075,
    color: "#1A1A1A",
    lineHeight: SIZES.width * 0.09,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    marginTop: 8,
  },
  cardsWrapper: {
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  flag: {
    width: 36,
    height: 24,
    borderRadius: 4,
  },
  cardLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  btnBox: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
  },
  nextBtn: {
    backgroundColor: "#FF7575",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#FF7575",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextBtnText: {
    color: COLORS.neutral100,
    fontFamily: "SBold",
    fontSize: SIZES.medium,
  },
});

export default selectlanguage;