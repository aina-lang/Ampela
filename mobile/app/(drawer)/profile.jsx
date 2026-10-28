import React, { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from "react-native";
import { Modal } from "react-native";
import AuthContent from "@/components/AuthContent";
import { useNavigation, useRouter } from "expo-router";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import i18n from "@/constants/i18n";
import { COLORS, SIZES } from "@/constants";
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { useDiscoveryTheme } from "@/components/discovery";
import { DecorativeBlobs, toast } from "@/components/ui";
import ConfirmSheet from "@/components/ConfirmSheet";
import { userState, sessionState, preferenceState } from "@/legendstate/AmpelaStates";
import { signOut } from "@/services/api";
import { describeRole, ROLE_LABEL } from "@/utils/roles";

// Rouge sémantique de la déconnexion (même teinte que « Supprimer mon compte »).
const DANGER = "#E24C6B";

/**
 * Écran Profil : en-tête de profil puis sections de réglages (ancien menu
 * latéral). Ouvert via l'avatar de l'en-tête.
 */
const ProfileScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const user = useSelector(() => userState.get());
  const isSignedIn = useSelector(() => !!sessionState.token.get());
  useSelector(() => preferenceState.language.get());
  const { surface, accentColor, accentContainer } = useDiscoveryTheme();
  const [isAuthModalVisible, setAuthModalVisible] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setConfirmLogout(false);
    toast.info(i18n.t("profileLoggedOut"));
  };
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const go = (path) => () => router.push(path);

  const onShare = async () => {
    try {
      await Share.share({ message: `${i18n.t("profileShareMessage")}\nhttps://ampela.mg` });
    } catch (error) {
      console.log(error);
    }
  };

  const sections = [
    {
      title: i18n.t("profileMyAccount"),
      items: [
        { label: i18n.t("accountAboutMe"), icon: "person-outline", onPress: go("settings/account") },
        { label: i18n.t("profileLanguageTheme"), icon: "color-palette-outline", onPress: go("settings/language-and-theme") },
        ...(isSignedIn
          ? []
          : [
              {
                label: i18n.t("profileCreateAccount"),
                icon: "cloud-upload-outline",
                onPress: () => setAuthModalVisible(true),
                accent: true,
              },
            ]),
      ],
    },
    {
      title: i18n.t("profileHelpInfo"),
      items: [
        { label: i18n.t("faq"), icon: "help-circle-outline", onPress: go("settings/faq") },
        { label: i18n.t("infoAmpela"), icon: "information-circle-outline", onPress: go("settings/aboutampela") },
        { label: i18n.t("profilePrivacy"), icon: "shield-checkmark-outline", onPress: go("settings/privacy") },
        { label: i18n.t("profileSendFeedback"), icon: "chatbox-ellipses-outline", onPress: go("settings/feedback") },
      ],
    },
    {
      title: i18n.t("partager"),
      items: [{ label: i18n.t("profileShareAmpela"), icon: "share-social-outline", onPress: onShare }],
    },
    ...(isSignedIn
      ? [
          {
            title: i18n.t("profileSession"),
            items: [
              {
                label: i18n.t("profileLogout"),
                icon: "log-out-outline",
                onPress: () => setConfirmLogout(true),
                danger: true,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <AppHeader navigation={navigation} title={i18n.t("profileTitle")} showBack absolute />
      <ScrollView
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* En-tête de profil */}
        <TouchableOpacity style={styles.profileCard} onPress={go("settings/account")} activeOpacity={0.85}>
          <Avatar
            uri={user?.profileImage}
            name={user?.username}
            size={64}
            borderWidth={3}
            borderColor={accentContainer}
          />
          <View style={styles.profileText}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.username || "Ampela"}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {describeRole(user) || user?.email || ROLE_LABEL.user}
            </Text>
            <View style={[styles.chip, { backgroundColor: accentContainer }]}>
                <Ionicons
                  name={isSignedIn ? "cloud-done-outline" : "cloud-offline-outline"}
                  size={13}
                  color={accentColor}
                />
                <Text style={[styles.chipText, { color: accentColor }]}>
                  {isSignedIn ? i18n.t("profileSynced") : i18n.t("profileNoAccount")}
                </Text>
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
                  <View
                    style={[
                      styles.rowIcon,
                      { backgroundColor: item.accent ? "rgba(255,255,255,0.2)" : item.danger ? "#FDE8EC" : accentContainer },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={item.accent ? "#FFFFFF" : item.danger ? DANGER : accentColor}
                    />
                  </View>
                  <Text style={[styles.rowLabel, item.accent && { color: "#FFFFFF" }, item.danger && { color: DANGER }]}>
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={item.accent ? "#FFFFFF" : item.danger ? DANGER : "#C9C3CC"} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>Ampela · {i18n.t("profileVersion")} {appVersion}</Text>
      </ScrollView>

      <ConfirmSheet
        visible={confirmLogout}
        icon="log-out-outline"
        title={i18n.t("profileLogoutTitle")}
        message={i18n.t("profileLogoutMessage")}
        confirmLabel={i18n.t("profileLogout")}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />

      {/* Connexion / création de compte (code e-mail) */}
      <Modal
        visible={isAuthModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <AuthContent closeModal={() => setAuthModalVisible(false)} />
        </View>
      </Modal>
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
