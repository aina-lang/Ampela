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
import AuthContent from "@/components/AuthContentFromSetting";

const DrawerComponent = observer(() => {
  const router = useRouter();
  const user = useSelector(() => userState.get());
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAuthModalVisible, setAuthModalVisible] = useState(false);

  // scales séparées pour ne pas se marcher dessus si les deux modals interagissent
  const logoutScale = useSharedValue(0);
  const authScale = useSharedValue(0);

  const logoutAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(logoutScale.value, { damping: 10, stiffness: 200 }) },
    ],
  }));
  const authAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(authScale.value, { damping: 10, stiffness: 200 }) },
    ],
  }));

  const toggleModal = () => {
    setModalVisible((prev) => {
      logoutScale.value = prev ? 0 : 1;
      return !prev;
    });
  };

  const toggleAuthModal = () => {
    setAuthModalVisible((prev) => {
      authScale.value = prev ? 0 : 1;
      return !prev;
    });
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
  return (
       <SafeAreaView className="flex-1" style={{ marginTop: -(insets.top + 40) }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ModalProvider>
          <AuthContextProvider>
            <Drawer
              screenOptions={{ headerShown: false }}
              drawerContent={(props) => (
                <DrawerContentScrollView
                  {...props}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Profil */}
                  <View style={styles.profileHeader}>
                    <TouchableOpacity
                      onPress={() => router.push("settings/accountscreen")}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={
                          user?.profileImage
                            ? { uri: user.profileImage }
                            : images.doctor01
                        }
                        style={styles.avatar}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <Text style={styles.profileName}>
                      {user?.username || "Utilisateur"}
                    </Text>
                    <Text style={styles.profileEmail}>
                      {user?.email || "Ampela user"}
                    </Text>
                  </View>

                  {/* Mon compte */}
                  <Text style={styles.sectionLabel}>Mon compte</Text>
                  <View style={styles.section}>
                    <DrawerItem
                      label="À propos de moi"
                      labelStyle={styles.itemLabel}
                      onPress={() => router.push("settings/account")}
                      icon={({ size }) => (
                        <AntDesign name="user" color="#FF7575" size={size} />
                      )}
                    />
                    <DrawerItem
                      label={auth.currentUser ? "Se déconnecter" : "Se connecter"}
                      labelStyle={styles.itemLabel}
                      onPress={handleAuth}
                      icon={({ size }) => (
                        <AntDesign name="logout" color="#FF7575" size={size} />
                      )}
                    />
                  </View>

                  {/* Général */}
                  <Text style={styles.sectionLabel}>Général</Text>
                  <View style={styles.section}>
                    <DrawerItem
                      label="Langues"
                      labelStyle={styles.itemLabel}
                      onPress={() => router.push("settings/changelanguage")}
                      icon={({ size }) => (
                        <Ionicons name="language" color="#FF7575" size={size} />
                      )}
                    />
                    <DrawerItem
                      label="Thème"
                      labelStyle={styles.itemLabel}
                      onPress={() => router.push("settings/changetheme")}
                      icon={({ size }) => (
                        <Ionicons
                          name="color-palette-outline"
                          color="#FF7575"
                          size={size}
                        />
                      )}
                    />
                    <DrawerItem
                      label="FAQ"
                      labelStyle={styles.itemLabel}
                      onPress={() => router.push("settings/faq")}
                      icon={({ size }) => (
                        <Ionicons
                          name="help-circle-outline"
                          color="#FF7575"
                          size={size}
                        />
                      )}
                    />
                    <DrawerItem
                      label={i18n.t("infoAmpela")}
                      labelStyle={styles.itemLabel}
                      onPress={() => router.push("settings/aboutampela")}
                      icon={({ size }) => (
                        <Ionicons
                          name="information-circle-outline"
                          color="#FF7575"
                          size={size}
                        />
                      )}
                    />
                    <DrawerItem
                      label="Partager"
                      labelStyle={styles.itemLabel}
                      onPress={onShare}
                      icon={({ size }) => (
                        <Ionicons
                          name="share-social-outline"
                          color="#FF7575"
                          size={size}
                        />
                      )}
                    />
                  </View>

                  {/* Feedback */}
                  <Text style={styles.sectionLabel}>Feed-back</Text>
                  <View style={styles.section}>
                    <DrawerItem
                      label="Envoyer des feedbacks"
                      labelStyle={styles.itemLabel}
                      onPress={() => router.push("settings/feedback")}
                      icon={({ size }) => (
                        <Ionicons
                          name="chatbox-ellipses-outline"
                          color="#FF7575"
                          size={size}
                        />
                      )}
                    />
                  </View>

                  <View style={{ height: 20 }} />
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
                    style={styles.confirmButton}
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
              <Animated.View style={[styles.modalContent, authAnimatedStyle]}>
                <AuthContent closeModal={() => setAuthModalVisible(false)} />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
});

export default DrawerComponent;

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFF5F5",
    marginBottom: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#FF7575",
  },
  profileName: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
  },
  profileEmail: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    color: "#B0B0B0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingLeft: 20,
    marginTop: 16,
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: 8,
  },
  itemLabel: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#3A3A3A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: COLORS.neutral100,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Bold",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  modalMessage: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A7A7A",
    textAlign: "center",
    marginBottom: 20,
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
    backgroundColor: "#FF7575",
    shadowColor: "#FF7575",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmButtonText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: COLORS.neutral100,
  },
});