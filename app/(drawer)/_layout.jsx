import React, { useState } from "react";
import { COLORS, SIZES, images } from "@/constants";
import i18n from "@/constants/i18n";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Drawer, DrawerContentScrollView, DrawerItem } from "expo-router/drawer";
import { useRouter } from "expo-router";
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
import { preferenceState, userState } from "@/legendstate/AmpelaStates";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ModalProvider } from "@/hooks/ModalProvider";
import { auth } from "@/services/firebaseConfig";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import AuthContent from "@/components/AuthContent";
import { StatusBar } from "expo-status-bar";
import { useDiscoveryTheme } from "@/components/discovery";

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
  const { accentColor, accentColorDisabled, surface } = useDiscoveryTheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAuthModalVisible, setAuthModalVisible] = useState(false);

  const logoutScale = useSharedValue(0);

  const logoutAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(logoutScale.value, { damping: 10, stiffness: 200 }) },
    ],
  }));

  const toggleModal = () => {
    setModalVisible((prev) => {
      logoutScale.value = prev ? 0 : 1;
      return !prev;
    });
  };

  const toggleAuthModal = () => {
    setAuthModalVisible((prev) => !prev);
  };

  const handleAuth = () => {
    if (auth.currentUser) {
      toggleModal();
    } else {
      toggleAuthModal();
    }
  };

  const confirmLogout = () => {
    auth
      .signOut()
      .then(() => {
        toggleModal();
      })
      .catch((error) => {
        console.error("Sign out error", error);
      });
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

  const menuSections = [
    {
      title: "Mon compte",
      items: [
        {
          label: "À propos de moi",
          icon: "user",
          lib: "AntDesign",
          onPress: () => router.push("settings/account"),
        },
        {
          label: auth.currentUser ? "Se déconnecter" : "Synchroniser",
          icon: "cloudupload-o",
          lib: "AntDesign",
          onPress: handleAuth,
          accent: true,
        },
      ],
    },
    {
      title: "Général",
      items: [
        {
          label: "Langue et thème",
          icon: "language",
          onPress: () => router.push("settings/language-and-theme"),
        },
        {
          label: "FAQ",
          icon: "help-circle-outline",
          lib: "Ionicons",
          onPress: () => router.push("settings/faq"),
        },
        {
          label: i18n.t("infoAmpela"),
          icon: "information-circle-outline",
          lib: "Ionicons",
          onPress: () => router.push("settings/aboutampela"),
        },
        {
          label: "Partager",
          icon: "share-social-outline",
          lib: "Ionicons",
          onPress: onShare,
        },
      ],
    },
    {
      title: "Feed-back",
      items: [
        {
          label: "Envoyer des feedbacks",
          icon: "chatbox-ellipses-outline",
          onPress: () => router.push("settings/feedback"),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: surface }} edges={["left", "right", "bottom"]}>
      <StatusBar style="light" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ModalProvider>
          <AuthContextProvider>
            <Drawer
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
                    <Text style={styles.profileEmail}>
                      {user?.email || "Ampela user"}
                    </Text>
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
                            onPress={item.onPress}
                            activeOpacity={0.7}
                            style={[
                              styles.menuItem,
                              item.accent && { backgroundColor: accentColor },
                            ]}
                          >
                            <View style={styles.menuItemLeft}>
                              <AntDesign
                                name={item.icon}
                                size={20}
                                color={item.accent ? "#FFFFFF" : accentColor}
                              />
                              <Text
                                style={[
                                  styles.menuItemLabel,
                                  { color: item.accent ? "#FFFFFF" : COLORS.primary },
                                ]}
                              >
                                {item.label}
                              </Text>
                            </View>
                            <AntDesign name="right" size={16} color={item.accent ? "#FFFFFF" : COLORS.neutral400} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}

                  <View style={{ height: 30 }} />
                </DrawerContentScrollView>
              )}
            />
          </AuthContextProvider>
        </ModalProvider>
      </GestureHandlerRootView>

      {/* Confirmation de déconnexion */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.modalContent, logoutAnimatedStyle]}>
                <Text style={styles.modalTitle}>Confirmer la déconnexion</Text>
                <Text style={styles.modalMessage}>
                  Êtes-vous sûr de vouloir vous déconnecter ?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={toggleModal}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmLogout}
                    style={[styles.confirmButton, { backgroundColor: accentColor }]}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.confirmButtonText}>Déconnecter</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    padding: 28,
    backgroundColor: COLORS.neutral100,
    borderRadius: 24,
  },
  modalTitle: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 1,
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 10,
  },
  modalMessage: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: COLORS.neutral400,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#EFEFEF",
  },
  cancelButtonText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#7A7A7A",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: COLORS.neutral100,
  },
});

export default DrawerComponent;
