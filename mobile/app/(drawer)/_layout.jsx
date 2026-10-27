import React, { useState } from "react";
import { COLORS, SIZES, images } from "@/constants";
import i18n from "@/constants/i18n";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Drawer, DrawerContentScrollView } from "expo-router/drawer";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { describeRole, ROLE_LABEL } from "@/utils/roles";
import {
  Image,
  Share,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Modal,
} from "react-native";
import { observer, useSelector } from "@legendapp/state/react";
import { AuthContextProvider } from "@/hooks/AuthContext";
import {
  preferenceState,
  userState,
  sessionState,
} from "@/legendstate/AmpelaStates";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AuthContent from "@/components/AuthContent";
import { StatusBar } from "expo-status-bar";
import { useDiscoveryTheme } from "@/components/discovery";
import { setVisitedRoute, useVisitedRoute } from "@/hooks/useVisitedRoute";

const MenuIcon = ({ lib, name, size, color }) => {
  if (lib === "Ionicons") {
    return <Ionicons name={name} size={size} color={color} />;
  }
  return <AntDesign name={name} size={size} color={color} />;
};

const DrawerComponent = observer(() => {
  const router = useRouter();
  const user = useSelector(() => userState.get());
  const { theme } = useSelector(() => preferenceState.get());
  const isSignedIn = useSelector(() => !!sessionState.token.get());
  const { accentColor, accentColorDisabled, accentContainer, surface } =
    useDiscoveryTheme();
  const visitedRoute = useVisitedRoute();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAuthModalVisible, setAuthModalVisible] = useState(false);

  const toggleAuthModal = () => {
    setAuthModalVisible((prev) => !prev);
  };


  const urlAmpela = "https://ampela.mg";

  const onShare = async () => {
    try {
      await Share.share({
        message: `Inviter vos amis à utiliser Ampela \n ${urlAmpela}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const insets = useSafeAreaInsets();
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const go = (path) => () => router.push(path);

  // Menu réorganisé : compte, aide, partage.
  const menuSections = [
    {
      title: "Mon compte",
      items: [
        { label: "À propos de moi", icon: "person-outline", lib: "Ionicons", onPress: go("settings/account") },
        { label: "Langue et thème", icon: "color-palette-outline", lib: "Ionicons", onPress: go("settings/language-and-theme") },
        // Déconnexion et suppression du compte vivent dans « À propos de
        // moi » ; le menu ne propose que l'entrée en compte.
        ...(isSignedIn
          ? []
          : [
              {
                label: "Créer un compte / Synchroniser",
                icon: "cloud-upload-outline",
                lib: "Ionicons",
                onPress: toggleAuthModal,
                accent: true,
              },
            ]),
      ],
    },
    {
      title: "Aide et informations",
      items: [
        { label: "FAQ", icon: "help-circle-outline", lib: "Ionicons", onPress: go("settings/faq") },
        { label: i18n.t("infoAmpela"), icon: "information-circle-outline", lib: "Ionicons", onPress: go("settings/aboutampela") },
        { label: "Confidentialité", icon: "shield-checkmark-outline", lib: "Ionicons", onPress: go("settings/privacy") },
        { label: "Envoyer un feedback", icon: "chatbox-ellipses-outline", lib: "Ionicons", onPress: go("settings/feedback") },
      ],
    },
    {
      title: "Partager",
      items: [
        { label: "Partager Ampela", icon: "share-social-outline", lib: "Ionicons", onPress: onShare },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: surface }} edges={["left", "right", "bottom"]}>
      <StatusBar style="dark" />
          <AuthContextProvider>
            <Drawer
              // Les écrans du menu (réglages, forum, messages…) sont des
              // frères dans le Drawer : sans « history », goBack ramenait
              // toujours à l'accueil au lieu de l'écran précédent.
              backBehavior="history"
              screenOptions={{ headerShown: false }}
              drawerContent={(props) => (
                <DrawerContentScrollView
                  {...props}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.drawerContent}
                >
                  {/* Profile Header */}
                  <View style={styles.profileHeader}>
                    <TouchableOpacity
                      onPress={() => router.push("settings/account")}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={
                          user?.profileImage
                            ? { uri: user.profileImage }
                            : images.doctor01
                        }
                        style={[styles.avatar, { borderColor: accentColor }]}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <Text style={[styles.profileName, { color: COLORS.primary }]}>
                      {user?.username || "Utilisateur"}
                    </Text>
                    <Text style={styles.profileEmail} numberOfLines={1}>
                      {describeRole(user) || user?.email || ROLE_LABEL.user}
                    </Text>
                    <View style={[styles.accountChip, { backgroundColor: accentContainer }]}>
                      <Ionicons
                        name={isSignedIn ? "cloud-done-outline" : "cloud-offline-outline"}
                        size={13}
                        color={accentColor}
                      />
                      <Text style={[styles.accountChipText, { color: accentColor }]}>
                        {isSignedIn ? "Compte synchronisé" : "Sans compte"}
                      </Text>
                    </View>
                  </View>

                  {/* Menu Sections */}
                  {menuSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.menuSection}>
                      <Text style={[styles.sectionLabel, { color: COLORS.neutral400 }]}>
                        {section.title}
                      </Text>
                      <View style={styles.section}>
                        {section.items.map((item, itemIndex) => (
                          <TouchableOpacity
                            key={itemIndex}
                            onPress={() => {
                              setVisitedRoute(item.label);
                              item.onPress();
                            }}
                            activeOpacity={0.7}
                            style={[
                              styles.menuItem,
                              item.accent && { backgroundColor: accentColor },
                              visitedRoute === item.label && styles.visitedItem,
                            ]}
                          >
                            <View style={styles.menuItemLeft}>
                              {item.lib === "Ionicons" ? (
                                <Ionicons
                                  name={item.icon}
                                  size={20}
                                  color={item.accent ? "#FFFFFF" : accentColor}
                                />
                              ) : (
                                <AntDesign
                                  name={item.icon}
                                  size={20}
                                  color={item.accent ? "#FFFFFF" : accentColor}
                                />
                              )}
                              <Text
                                style={[
                                  styles.menuItemLabel,
                                  { color: item.accent ? "#FFFFFF" : COLORS.primary },
                                ]}
                              >
                                {item.label}
                              </Text>
                            </View>
                            {visitedRoute === item.label ? (
                              <View style={[styles.visitedDot, { backgroundColor: accentColor }]} />
                            ) : (
                              <AntDesign name="right" size={16} color={item.accent ? "#FFFFFF" : COLORS.neutral400} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}

                  <Text style={styles.version}>Ampela · version {appVersion}</Text>
                  <View style={{ height: 30 }} />
                </DrawerContentScrollView>
              )}
            />
          </AuthContextProvider>

      {/* Auth */}
      <Modal
        visible={isAuthModalVisible}
        transparent
        animationType="none"
        onRequestClose={toggleAuthModal}
      >
        <TouchableWithoutFeedback onPress={toggleAuthModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <AuthContent closeModal={() => setAuthModalVisible(false)} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  drawerContent: {
    paddingTop: 20,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    marginBottom: 16,
  },
  profileName: {
    fontFamily: "SBold",
    fontSize: SIZES.medium + 1,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: COLORS.neutral400,
  },
  accountChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  accountChipText: {
    fontFamily: "SBold",
    fontSize: 11,
  },
  version: {
    fontFamily: "Regular",
    fontSize: 11,
    color: "#A9A4AE",
    textAlign: "center",
    marginTop: 18,
  },
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.xSmall,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  section: {
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuItemLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
  },
  visitedItem: {
    backgroundColor: COLORS.neutral200,
  },
  visitedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "86%",
    maxWidth: 360,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    backgroundColor: COLORS.neutral100,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: "#8A7A85",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 12,
  },
});

export default DrawerComponent;
