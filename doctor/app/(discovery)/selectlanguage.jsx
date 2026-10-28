import { DecorativeBlobs } from "@/components/ui";
import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SIZES, COLORS, images } from "@/constants";
import { useRouter } from "expo-router";
import i18n from "@/constants/i18n";
import { preferenceState, updatePreference } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { Ionicons } from "@expo/vector-icons";
import ModernButton from "@/components/ModernButton";
import { StatusBar } from "expo-status-bar";
import { MeshBackground, DiscoveryHeader, useDiscoveryTheme } from "@/components/discovery";
import { DISCOVERY_RADIUS, DISCOVERY_SPACING } from "@/components/discovery/DiscoveryTheme";

// Sous-composants hoistés hors de l'écran : ils ne sont pas recréés à
// chaque rendu.
const ThemeCard = ({ themeKey, label, desc, image, selected, onSelect }) => {
  const cardAccent = themeKey === "pink" ? "#FF7575" : "#FE8729";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect(themeKey)}
      style={[styles.themeCard, { borderColor: selected ? cardAccent : "transparent" }]}
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
          style={[styles.themeLabel, { color: selected ? cardAccent : "#433C47" }]}
        >
          {label}
        </Text>
        <Text style={styles.themeDesc}>{desc}</Text>
      </View>
    </TouchableOpacity>
  );
};

const SelectLanguage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useSelector(() => preferenceState.get());
  const {
    accentColor,
    accentColorDisabled,
    surface,
  } = useDiscoveryTheme();

  const handleThemeChange = (themeKey) => {
    updatePreference({ theme: themeKey });
  };

  const handleNextBtnPress = useCallback(() => {
    router.push("/(discovery)/confidentiality");
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <StatusBar style="dark" />
      <MeshBackground color={accentColor} surfaceColor={surface} />
      <DecorativeBlobs />

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
        >
        <DiscoveryHeader
          eyebrow={i18n.t("onboardingWelcomeEyebrow")}
          title={i18n.t("onboardingThemeTitle")}
          subtitle={i18n.t("onboardingThemeSubtitle")}
        />

        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>{i18n.t("onboardingChooseTheme")}</Text>
        </View>

        <View style={styles.themeCardsWrapper}>
          <ThemeCard
            themeKey="pink"
            label="Anna’s Rose"
            desc="Rose"
            image={images.pinkTheme}
            selected={theme === "pink"}
            onSelect={handleThemeChange}
          />
          <ThemeCard
            themeKey="orange"
            label="Linda Sunset"
            desc="Orange"
            image={images.orangeTheme}
            selected={theme === "orange"}
            onSelect={handleThemeChange}
          />
        </View>

        </ScrollView>

        {/* Bouton toujours visible, quelle que soit la hauteur d'écran */}
        <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
          <ModernButton
            title={i18n.t("onboardingContinue")}
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
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
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
    color: "#5A525F",
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
    // Bordure couleur du thème sur la carte sélectionnée
    borderWidth: 2.5,
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
    alignItems: "center",
    justifyContent: "center",
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});

export default SelectLanguage;
