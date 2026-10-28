import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { DecorativeBlobs } from "@/components/ui";
import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { SIZES, COLORS } from "@/constants";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import { PRIVACY_SECTIONS, PRIVACY_UPDATED_AT, PRIVACY_CONTACT_EMAIL } from "@/constants/privacyPolicy";
import i18n from "@/constants/i18n";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { formatDateFr } from "@/services/reminders";

/**
 * Politique de confidentialité consultable depuis les réglages. Même
 * en-tête et même mise en page que les autres écrans du menu ; l'écran
 * d'acceptation de l'onboarding reste indépendant.
 */
const PrivacyScreen = () => {
  const navigation = useNavigation();
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();
  // Re-rendu au changement de langue (textes via i18n).
  useSelector(() => preferenceState.language.get());
  const updatedAt = `${formatDateFr(PRIVACY_UPDATED_AT)} ${PRIVACY_UPDATED_AT.slice(0, 4)}`;

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <AppHeader navigation={navigation} title={i18n.t("profilePrivacy")} showBack absolute />
      <ScrollView
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DiscoveryCard style={styles.introCard}>
          <Text style={styles.introText}>{i18n.t("privacyIntro")}</Text>
          <Text style={styles.updatedAt}>{i18n.t("privacyUpdatedAt", { date: updatedAt })}</Text>
        </DiscoveryCard>

        <DiscoveryCard style={styles.contentCard}>
          {PRIVACY_SECTIONS.map((item, index) => (
            <View key={item.title}>
              <View style={styles.row}>
                <View style={[styles.iconWrapper, { backgroundColor: accentContainer }]}>
                  <Ionicons name={item.icon} size={18} color={accentColor} />
                </View>
                <View style={styles.textWrapper}>
                  <Text style={[styles.subtitle, { color: COLORS.primary }]}>{i18n.t(item.title)}</Text>
                  <Text style={[styles.text, { color: COLORS.neutral400 }]}>{i18n.t(item.body)}</Text>
                </View>
              </View>
              {index < PRIVACY_SECTIONS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </DiscoveryCard>

        <DiscoveryCard style={styles.contactCard}>
          <Text style={[styles.subtitle, { color: COLORS.primary }]}>{i18n.t("privacyContact")}</Text>
          <Text
            style={[styles.text, styles.link, { color: accentColor }]}
            onPress={() => Linking.openURL(`mailto:${PRIVACY_CONTACT_EMAIL}`)}
          >
            {PRIVACY_CONTACT_EMAIL}
          </Text>
        </DiscoveryCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT + 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  introCard: {
    marginTop: 20,
  },
  introText: {
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    lineHeight: 22,
    color: COLORS.neutral400,
  },
  updatedAt: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#A9A4AE",
    marginTop: 12,
  },
  contentCard: {
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  subtitle: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    marginBottom: 4,
  },
  text: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    lineHeight: 20,
  },
  link: {
    marginTop: 4,
    fontFamily: "SBold",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  contactCard: {
    marginTop: 16,
  },
});

export default PrivacyScreen;
