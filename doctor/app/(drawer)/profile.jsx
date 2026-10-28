import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Share } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import i18n from "@/constants/i18n";
import { COLORS, SIZES, images } from "@/constants";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { useDiscoveryTheme } from "@/components/discovery";
import { DecorativeBlobs } from "@/components/ui";
import { userState, sessionState } from "@/legendstate/AmpelaStates";
import { describeRole, ROLE_LABEL } from "@/utils/roles";

/**
 * Écran Profil : en-tête de profil puis sections de réglages (ancien menu
 * latéral). Ouvert via l'avatar de l'en-tête.
 */
const ProfileScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const user = useSelector(() => userState.get());
  const isSignedIn = useSelector(() => !!sessionState.token.get());
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const go = (path) => () => router.push(path);

  const onShare = async () => {
    try {
      await Share.share({ message: "Inviter vos amies à utiliser Ampela\nhttps://ampela.mg" });
    } catch (error) {
      console.log(error);
    }
  };

  const sections = [
    {
      title: "Mon compte",
      items: [
        { label: "À propos de moi", icon: "person-outline", onPress: go("settings/account") },
        { label: "Langue et thème", icon: "color-palette-outline", onPress: go("settings/language-and-theme") },
      ],
    },
    {
      title: "Aide et informations",
      items: [
        { label: "FAQ", icon: "help-circle-outline", onPress: go("settings/faq") },
        { label: i18n.t("infoAmpela"), icon: "information-circle-outline", onPress: go("settings/aboutampela") },
        { label: "Confidentialité", icon: "shield-checkmark-outline", onPress: go("settings/privacy") },
        { label: "Envoyer un feedback", icon: "chatbox-ellipses-outline", onPress: go("settings/feedback") },
      ],
    },
    {
      title: "Partager",
      items: [{ label: "Partager Ampela Pro", icon: "share-social-outline", onPress: onShare }],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <AppHeader navigation={navigation} title="Profil" showBack absolute />
      <ScrollView
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* En-tête de profil */}
        <TouchableOpacity style={styles.profileCard} onPress={go("settings/account")} activeOpacity={0.85}>
          <Image
            source={user?.profileImage ? { uri: user.profileImage } : images.doctor01}
            style={[styles.avatar, { borderColor: accentContainer }]}
          />
          <View style={styles.profileText}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.username || "Utilisatrice"}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {user?.profession || user?.email || ROLE_LABEL.doctor}
            </Text>
            <View style={[styles.chip, { backgroundColor: accentContainer }]}>
                <Ionicons name="medkit-outline" size={13} color={accentColor} />
                <Text style={[styles.chipText, { color: accentColor }]}>Professionnelle de santé</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#C9C3CC" />
        </TouchableOpacity>

        {sections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                  style={[
                    styles.row,
                    index < section.items.length - 1 && styles.rowDivider,
                    item.accent && { backgroundColor: accentColor, borderRadius: 16, marginVertical: 6 },
                  ]}
                >
                  <View style={[styles.rowIcon, { backgroundColor: item.accent ? "rgba(255,255,255,0.2)" : accentContainer }]}>
                    <Ionicons name={item.icon} size={18} color={item.accent ? "#FFFFFF" : accentColor} />
                  </View>
                  <Text style={[styles.rowLabel, item.accent && { color: "#FFFFFF" }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={item.accent ? "#FFFFFF" : "#C9C3CC"} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>Ampela Pro · version {appVersion}</Text>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: HEADER_HEIGHT + 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 2,
    color: COLORS.primary,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8E8793",
    marginTop: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  chipText: {
    fontFamily: "SBold",
    fontSize: 11,
  },
  sectionLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    color: "#A9A4AE",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 22,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F0F4",
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontFamily: "SBold",
    fontSize: SIZES.small + 1,
    color: COLORS.primary,
  },
  version: {
    fontFamily: "Regular",
    fontSize: 11,
    color: "#A9A4AE",
    textAlign: "center",
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

export default ProfileScreen;
