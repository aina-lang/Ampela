import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SIZES, COLORS, images } from "@/constants";
import { useNavigation } from "expo-router";
import i18n from "@/constants/i18n";
import { preferenceState, updatePreference } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { Ionicons } from "@expo/vector-icons";
import ModernButton from "@/components/ModernButton";
import { StatusBar } from "expo-status-bar";

const selectlanguage = () => {
  const navigation = useNavigation();
  const { language, theme } = useSelector(() => preferenceState.get());
  const accentColor = theme === "pink" ? "#FF7575" : "#FE8729";
  const accentColorDisabled = theme === "pink" ? "#FFB5B5" : "#FED4A0";

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
    const { theme } = useSelector(() => preferenceState.get());
    const accentColor = theme === "pink" ? "#FF7575" : "#FE8729";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => changeLanguage(code)}
        style={[
          styles.card,
          {
            backgroundColor: selected ? accentColor : "#FFFFFF",
            borderColor: selected ? accentColor : "#F0F0F0",
          },
        ]}
      >
        <View style={styles.cardLeft}>
          <Image source={flag} style={styles.flag} />
          <Text
            style={[
              styles.cardLabel,
              { color: selected ? COLORS.neutral100 : "#1A1A1A" },
            ]}
          >
            {label}
          </Text>
        </View>

        <View
          style={[
            styles.radioOuter,
            {
              borderColor: selected ? COLORS.neutral100 : "#D0D0D0",
              backgroundColor: selected ? COLORS.neutral100 : "transparent",
            },
          ]}
        >
          {selected && (
            <View style={styles.radioInner}>
              <Ionicons name="checkmark" size={14} color={accentColor} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.meshBackground}>
        <View style={[styles.blob, { backgroundColor: COLORS.accent500 }]} />
        <View style={[styles.blob, styles.blob2, { backgroundColor: COLORS.accent400 }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Bienvenue</Text>
          <Text style={styles.title}>Choisissez votre langue</Text>
          <Text style={styles.subtitle}>
            Vous pourrez la modifier plus tard dans les paramètres
          </Text>
        </View>

        <View style={styles.cardsWrapper}>
          <LanguageCard code="fr" label="Français" flag={images.franceImg} />
          <LanguageCard code="mg" label="Malagasy" flag={images.madaImg} />
        </View>

        <View style={styles.bottomArea}>
          <ModernButton
            title="Continuer"
            onPress={handleNextBtnPress}
            accentColor={accentColor}
            accentColorDisabled={accentColorDisabled}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
  },
  meshBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.05,
    top: -100,
    right: -100,
  },
  blob2: {
    width: 300,
    height: 300,
    bottom: 150,
    left: -100,
    top: undefined,
    right: undefined,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  eyebrow: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: COLORS.accent500,
    marginBottom: 10,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.075,
    color: "#1A1A1A",
    lineHeight: SIZES.width * 0.09,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    lineHeight: 20,
  },
  cardsWrapper: {
    gap: 16,
    marginBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  flag: {
    width: 40,
    height: 28,
    borderRadius: 6,
  },
  cardLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  bottomArea: {
    marginTop: "auto",
    paddingBottom: 32,
  },
});

export default selectlanguage;
