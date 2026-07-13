import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SIZES, COLORS, images } from "@/constants";
import { useRouter } from "expo-router";
import i18n from "@/constants/i18n";
import { preferenceState, updatePreference } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { MeshBackground, DiscoveryHeader, useDiscoveryTheme } from "@/components/discovery";
import { DISCOVERY_RADIUS, DISCOVERY_SPACING } from "@/components/discovery/DiscoveryTheme";

const LanguageAndThemeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, theme } = useSelector(() => preferenceState.get());
  const {
    accentColor,
    accentColorDisabled,
    surface,
  } = useDiscoveryTheme();

  const changeLanguage = async (lang) => {
    try {
      i18n.locale = lang;
      await updatePreference({ language: lang });
    } catch (error) {
      console.error("Failed to save locale to AsyncStorage:", error);
    }
  };

  const handleThemeChange = (themeKey) => {
    updatePreference({ theme: themeKey });
  };

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const LanguageCard = ({ code, label, flag }) => {
    const selected = language === code;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => changeLanguage(code)}
        style={[
          styles.languageCard,
          { backgroundColor: selected ? accentColor : COLORS.neutral100 },
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
              borderColor: selected ? COLORS.neutral100 : "#E0E0E0",
              backgroundColor: selected ? COLORS.neutral100 : "transparent",
            },
          ]}
        >
          {selected && <Ionicons name="checkmark" size={14} color={accentColor} />}
        </View>
      </TouchableOpacity>
    );
  };

  const ThemeCard = ({ themeKey, label, desc, image }) => {
    const selected = theme === themeKey;
    const cardAccent = themeKey === "pink" ? "#FF7575" : "#FE8729";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleThemeChange(themeKey)}
        style={[
          styles.themeCard,
          selected && { borderColor: cardAccent },
        ]}
      >
        <View style={styles.themeImageWrapper}>
          <Image source={image} style={styles.themeImage} resizeMode="cover" />
          {selected && (
            <View style={[styles.themeBadge, { backgroundColor: cardAccent }]}>
              <Ionicons name="checkmark" size={16} color={COLORS.neutral100} />
            </View>
          )}
        </View>
        <View style={styles.themeInfo}>
          <Text
            style={[
              styles.themeLabel,
              { color: selected ? cardAccent : "#1A1A1A" },
            ]}
          >
            {label}
          </Text>
          <Text style={styles.themeDesc}>{desc}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: surface }]}>
      <StatusBar style="dark" />
      <MeshBackground color={accentColor} surfaceColor={surface} />

      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        <DiscoveryHeader
          eyebrow="Paramètres"
          title="Langue et thème"
          subtitle="Choisissez votre langue et le thème qui vous convient."
        />

        <View style={styles.cardsWrapper}>
          <LanguageCard code="fr" label="Français" flag={images.franceImg} />
          <LanguageCard code="mg" label="Malagasy" flag={images.madaImg} />
        </View>

        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Choisissez votre thème</Text>
        </View>

        <View style={styles.themeCardsWrapper}>
          <ThemeCard themeKey="pink" label="Anna's Rose" desc="Rose" image={images.pinkTheme} />
          <ThemeCard
            themeKey="orange"
            label="Linda Sunset"
            desc="Orange"
            image={images.orangeTheme}
          />
        </View>

        <View style={styles.bottomArea}>
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.backButton}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  cardsWrapper: {
    gap: 14,
    marginBottom: 32,
  },
  sectionLabel: {
    marginBottom: 16,
  },
  sectionLabelText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#3A3A3A",
    letterSpacing: 0.5,
  },
  themeCardsWrapper: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  themeCard: {
    flex: 1,
    borderRadius: DISCOVERY_RADIUS.xl,
    backgroundColor: COLORS.neutral100,
    overflow: "hidden",
  },
  themeImageWrapper: {
    position: "relative",
    width: "100%",
    height: 250,
  },
  themeImage: {
    width: "100%",
    height: "100%",
  },
  themeBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.neutral100,
  },
  themeInfo: {
    padding: DISCOVERY_SPACING.lg,
    alignItems: "center",
  },
  themeLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    marginBottom: 2,
  },
  themeDesc: {
    fontFamily: "Regular",
    fontSize: SIZES.xSmall,
    color: "#8A8A8A",
  },
  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: DISCOVERY_RADIUS.xl,
    backgroundColor: COLORS.neutral100,
    paddingVertical: 20,
    paddingHorizontal: 20,
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
  bottomArea: {
    marginTop: "auto",
    paddingBottom: 10,
    paddingTop: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontFamily: "SBold",
    color: "#9E9E9E",
  },
});

export default LanguageAndThemeScreen;
