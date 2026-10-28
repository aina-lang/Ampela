import { DecorativeBlobs } from "@/components/ui";
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Checkbox } from "expo-checkbox";
import { COLORS, SIZES } from "@/constants";
import { useRouter } from "expo-router";
import i18n from "@/constants/i18n";
import { AntDesign } from "@expo/vector-icons";
import ModernButton from "@/components/ModernButton";
import { StatusBar } from "expo-status-bar";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import {
  MeshBackground,
  DiscoveryHeader,
  DiscoveryBackButton,
  DiscoveryCard,
  useDiscoveryTheme,
} from "@/components/discovery";
import {
  DISCOVERY_SPACING,
  DISCOVERY_RADIUS,
} from "@/components/discovery/DiscoveryTheme";

const Confidentiality = () => {
  const router = useRouter();
  const { theme } = useSelector(() => preferenceState.get());
  const { accentColor, accentColorDisabled, surface, accentSoft } =
    useDiscoveryTheme();
  const insets = useSafeAreaInsets();
  const [accepted, setAccepted] = useState(false);

  const handleNextBtnPress = useCallback(() => {
    router.push("/(discovery)/login");
  }, []);

  const prevHandled = () => {
    router.back();
  };

  // Textes traduits (fr / mg) dans constants/locales/*.json
  const confidentialiteData = [1, 2, 3, 4, 5].map((i) => ({
    title: i18n.t(`onboardingPrivacy${i}Title`),
    description: i18n.t(`onboardingPrivacy${i}Text`),
  }));

  const renderItem = ({ item }) => (
    <DiscoveryCard style={styles.card}>
      <View style={styles.cardIcon}>
        <AntDesign name="lock" size={20} color={accentColor} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
    </DiscoveryCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <StatusBar style="dark" />
      <MeshBackground color={accentColor} surfaceColor={surface} />
      <DecorativeBlobs />

      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <DiscoveryHeader
          eyebrow={i18n.t("onboardingPrivacyEyebrow")}
          title={i18n.t("onboardingPrivacyTitle")}
          subtitle={i18n.t("onboardingPrivacySubtitle")}
        />

        <FlatList
          data={confidentialiteData}
          renderItem={renderItem}
          keyExtractor={(_, i) => String(i)}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View
          style={[styles.bottomArea, { paddingBottom: insets.bottom + 24 }]}
        >
          <Pressable
            onPress={() => setAccepted(!accepted)}
            style={[
              styles.acceptRow,
              accepted && { backgroundColor: accentSoft },
              accepted && styles.acceptRowActive,
            ]}
          >
            <Checkbox
              value={accepted}
              onValueChange={setAccepted}
              color={accepted ? accentColor : undefined}
              style={styles.checkbox}
            />
            <Text style={styles.acceptText}>{i18n.t("onboardingPrivacyAccept")}</Text>
          </Pressable>

          <View style={styles.navRow}>
            <DiscoveryBackButton onPress={prevHandled} label={i18n.t("onboardingBack")} />

            <View style={{ flex: 1 }} />

            <ModernButton
              title={i18n.t("onboardingContinue")}
              onPress={handleNextBtnPress}
              disabled={!accepted}
              accentColor={accentColor}
              accentColorDisabled={accentColorDisabled}
              style={{ marginLeft: 12 }}
            />
          </View>
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
    paddingHorizontal: 24,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    gap: 14,
  },
  cardIcon: {
    marginTop: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#433C47",
    marginBottom: 6,
  },
  cardDescription: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    lineHeight: 20,
    color: "#7A7A7A",
  },
  bottomArea: {
    paddingBottom: 10,
    paddingTop: 20,
  },
  acceptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: DISCOVERY_RADIUS.md,
    padding: DISCOVERY_SPACING.lg,
    marginBottom: 20,
    backgroundColor: COLORS.neutral100,
  },
  checkbox: {
    borderRadius: 6,
    borderWidth: 1.5,
  },
  acceptText: {
    flex: 1,
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#5A525F",
    lineHeight: 20,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Confidentiality;
