import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { SIZES, COLORS, images } from "@/constants";
import { useNavigation } from "expo-router";
import i18n from "@/constants/i18n";
import { preferenceState, updatePreference } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { MeshBackground, useDiscoveryTheme } from "@/components/discovery";
import { DISCOVERY_RADIUS, DISCOVERY_SPACING } from "@/components/discovery/DiscoveryTheme";

// Sous-composants hoistés hors de l'écran : ils ne sont pas recréés à
// chaque rendu.
const LanguageCard = ({ code, label, flag, selected, accentColor, onSelect }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => onSelect(code)}
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
          { color: selected ? COLORS.neutral100 : "#433C47" },
        ]}
      >
        {label}
      </Text>
    </View>

    <View
      style={[
        styles.radioOuter,
        { backgroundColor: selected ? COLORS.neutral100 : "#EFECF2" },
      ]}
    >
      {selected && <Ionicons name="checkmark" size={14} color={accentColor} />}
    </View>
  </TouchableOpacity>
);

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

const LanguageAndThemeScreen = () => {
  const navigation = useNavigation();
  const { language, theme } = useSelector(() => preferenceState.get());
  const {
    accentColor,
    accentColorDisabled,
    surface,
  } = useDiscoveryTheme();

  const changeLanguage = (lang) => {
    // i18n suit automatiquement preferenceState.language (constants/i18n.js).
    updatePreference({ language: lang });
  };

  const handleThemeChange = (themeKey) => {
    updatePreference({ theme: themeKey });
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <StatusBar style="dark" />
      <MeshBackground color={accentColor} surfaceColor={surface} />

      <AppHeader
        navigation={navigation}
        title="Langue et thème"
        showBack
        absolute
      />

      <ScrollView
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>Choisissez votre langue</Text>
          </View>
          <View style={styles.cardsWrapper}>
            <LanguageCard
              code="fr"
              label="Français"
              flag={images.franceImg}
              selected={language === "fr"}
              accentColor={accentColor}
              onSelect={changeLanguage}
            />
            <LanguageCard
              code="mg"
              label="Malagasy"
              flag={images.madaImg}
              selected={language === "mg"}
              accentColor={accentColor}
              onSelect={changeLanguage}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>Choisissez votre thème</Text>
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

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: HEADER_HEIGHT + 16,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
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
    position: "relative",
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
});

export default LanguageAndThemeScreen;
