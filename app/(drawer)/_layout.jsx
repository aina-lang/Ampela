import React, { useState } from "react";
import { COLORS, SIZES, images } from "@/constants";
import i18n from "@/constants/i18n";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Image, Share, Text, TouchableOpacity, View } from "react-native";
import { observer, useSelector } from "@legendapp/state/react";
import { AuthContextProvider } from "@/hooks/AuthContext";
import { preferenceState, userState } from "@/legendstate/AmpelaStates";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ModalProvider } from "@/hooks/ModalProvider";
import { auth } from "@/services/firebaseConfig";
import { Modal } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import AuthContent from "@/components/AuthContentFromSetting";

const DrawerComponent = observer(() => {
  const router = useRouter();
  const { theme } = useSelector(() => preferenceState.get());
  const user = useSelector(() => userState.get());
  const insets = useSafeAreaInsets();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAuthModalVisible, setAuthModalVisible] = useState(false);
  const scale = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(scale.value, { damping: 10, stiffness: 200 }) },
      ],
    };
  });

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    scale.value = isModalVisible ? 0 : 1;
  };

  const toggleAuthModal = () => {
    setAuthModalVisible(!isAuthModalVisible);
    scale.value = isAuthModalVisible ? 0 : 1;
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
        toggleAuthModal();
        console.log("User signed out!");
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

  return (
    <SafeAreaView className="flex-1" style={{ marginTop: -(insets.top + 40) }}>
      <GestureHandlerRootView>
        <ModalProvider>
          <AuthContextProvider>
            <Drawer
              screenOptions={{
                headerShown: false,
              }}
              drawerContent={(props) => (
                <DrawerContentScrollView
                  {...props}
                  showsVerticalScrollIndicator={false}
                >
                  <View
                    className="w-full -top-8 justify-center items-center space-y-2"
                    style={{
                      backgroundColor:
                        theme === "pink"
                          ? COLORS.neutral200
                          : COLORS.neutral280,
                      height: SIZES.height * 0.45,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => router.push("settings/accountscreen")}
                    >
                      <Image
                        source={
                          user.profileImage
                            ? { uri: user.profileImage }
                            : images.doctor01
                        }
                        height={150}
                        width={150}
                        resizeMode="cover"
                        className="rounded-full mb-3"
                      />
                    </TouchableOpacity>

                    <Text className="text-[16px] font-bold">
                      {user.username || "Utilisateur"}
                    </Text>
                    <Text>{user.email || "Ampela user"}</Text>
                  </View>
                  <Text className="pl-4">Mon compte</Text>
                  <View className="pl-4">
                    <DrawerItem
                      label="Apropos de moi"
                      onPress={() => router.push("settings/account")}
                      icon={({ color, size }) => (
                        <AntDesign name="user" color={color} size={size} />
                      )}
                    />
                    <DrawerItem
                      label={
                        auth.currentUser ? "Se déconnecter" : "Se connecter"
                      }
                      onPress={handleAuth}
                      icon={({ color, size }) => (
                        <AntDesign name="logout" color={color} size={size} />
                      )}
                    />
                  </View>
                  <Text className="pl-4">Général</Text>
                  <View className="pl-4">
                    <DrawerItem
                      label="Langues"
                      onPress={() => router.push("settings/changelanguage")}
                      icon={({ color, size }) => (
                        <Ionicons name="language" color={color} size={size} />
                      )}
                    />
                    <DrawerItem
                      label="Thème"
                      onPress={() => router.push("settings/changetheme")}
                      icon={({ color, size }) => (
                        <Ionicons
                          name="color-palette-outline"
                          color={color}
                          size={size}
                        />
                      )}
                    />
                    <DrawerItem
                      label="FAQ"
                      onPress={() => router.push("settings/faq")}
                      icon={({ color, size }) => (
                        <Ionicons
                          name="help-circle-outline"
                          color={color}
                          size={size}
                        />
                      )}
                    />
                    <DrawerItem
                      label={i18n.t("infoAmpela")}
                      onPress={() => router.push("settings/aboutampela")}
                      icon={({ color, size }) => (
                        <Ionicons
                          name="information-circle-outline"
                          color={color}
                          size={size}
                        />
                      )}
                    />
                    <DrawerItem
                      label="Partager"
                      onPress={onShare}
                      icon={({ color, size }) => (
                        <Ionicons
                          name="share-social-outline"
                          color={color}
                          size={size}
                        />
                      )}
                    />
                  </View>
                  <Text className="pl-4">Feed-back</Text>
                  <View className="pl-4">
                    <DrawerItem
                      label="Envoyer des feedbacks"
                      onPress={() => router.push("settings/feedback")}
                      icon={({ color, size }) => (
                        <Ionicons
                          name="chatbox-ellipses-outline"
                          color={color}
                          size={size}
                        />
                      )}
                    />
                  </View>

                  <View className="h-5" />
                </DrawerContentScrollView>
              )}
            />
          </AuthContextProvider>
        </ModalProvider>
      </GestureHandlerRootView>

      <Modal visible={isModalVisible} onBackdropPress={toggleModal} transparent>
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            height: SIZES.height,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10,
          }}
        >
          <Animated.View
            style={[styles.modalContent, animatedStyle, { padding: 20 }]}
          >
            <Text style={styles.modalTitle}>Confirmer la déconnexion</Text>
            <Text style={styles.modalMessage}>
              Êtes-vous sûr de vouloir vous déconnecter?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={toggleModal} style={styles.button}>
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmLogout} style={styles.button}>
                <Text style={styles.buttonText}>Déconnecter</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        visible={isAuthModalVisible}
        onBackdropPress={toggleAuthModal}
        transparent
      >
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            height: SIZES.height,
            alignItems: "center",
            justifyContent: "center",
            // paddingHorizontal: 10,
          }}
        >
          <Animated.View style={[styles.modalContent, animatedStyle]}>
            <AuthContent
              closeModal={() => {
                setAuthModalVisible(false);
              }}
            />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
});

const styles = {
  modalContent: {
    backgroundColor: "white",

    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalMessage: {
    fontSize: 16,
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
  },
  button: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
};

export default DrawerComponent;
