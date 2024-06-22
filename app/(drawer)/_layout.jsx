import React from "react";
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

const DrawerComponent = () => {
  const router = useRouter();
  const { theme } = useSelector(() => preferenceState.get());
  const user = useSelector(() => userState.get());
  const insets = useSafeAreaInsets();

  const urlAmpela = "https://ampela.mg";

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `Inviter vos amis a utilser Ampela \n ${urlAmpela}`,
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
                      onPress={() => router.push("settings/account-screen")}
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
                      label="Changer mon mot de passe"
                      onPress={() => router.push("settings/changepassword")}
                      icon={({ color, size }) => (
                        <Ionicons
                          name="color-palette-outline"
                          color={color}
                          size={size}
                        />
                      )}
                    />
                  </View>
                  <Text className="pl-4">Général</Text>
                  <View className="pl-4">
                    <DrawerItem
                      label="Langues"
                      onPress={() =>
                        router.push("settings/change-language-screen")
                      }
                      icon={({ color, size }) => (
                        <Ionicons name="language" color={color} size={size} />
                      )}
                    />
                    <DrawerItem
                      label="Thème"
                      onPress={() => router.push("settings/theme-screen")}
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
                      onPress={() => router.push("settings/faq-screen")}
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
                      onPress={() => router.push("settings/info-screen")}
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
                    <DrawerItem
                      label="Réinitialisation"
                      onPress={() => {}}
                      icon={({ color, size }) => (
                        <Ionicons
                          name="refresh-outline"
                          color={color}
                          size={size}
                        />
                      )}
                    />
                  </View>
                  <Text className="pl-4">Feed-back</Text>
                  <View className="pl-4">
                    {/* <DrawerItem
                      label="Rapport de bug"
                      onPress={() => {}}
                      icon={({ color, size }) => (
                        <AntDesign
                          name="clockcircle"
                          color={color}
                          size={size}
                        />
                      )}
                    /> */}
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
    </SafeAreaView>
  );
};

export default DrawerComponent;
