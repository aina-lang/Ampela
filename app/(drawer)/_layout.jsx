import { COLORS, SIZES, images } from "@/constants";
import i18n from "@/constants/i18n";
import { ThemeContext } from "@/hooks/theme-context";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Link, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useContext } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function drawer() {
  const router = useRouter();
  const {theme} = useContext(ThemeContext);
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
       
      }}
      drawerContent={(props, state) => {
        return (
          <DrawerContentScrollView
            {...props}
            showsVerticalScrollIndicator={false}
          >
            <View
              className="w-full   -top-10 justify-center items-center space-y-2"
              style={{
                backgroundColor:theme=== 'pink' ? COLORS.neutral200  : COLORS.neutral280,
                height: SIZES.height * 0.35,
              }}
            >
              <TouchableOpacity>
                <Image
                  source={images.doctor01}
                  height={100}
                  width={100}
                  resizeMode="cover"
                  className="rounded-full mb-3"
                />
              </TouchableOpacity>

              <Text className="text-[16px] font-bold">
                RAFANDEFRANA Maminiaina Mercia
              </Text>
              <Text>Sage femme</Text>
            </View>

            <Text className="pl-4">Géneral</Text>
            <View className="pl-4">
              <DrawerItem
                label="Langues"
                onPress={() => router.push("settings/change-language-screen")}
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
                onPress={() => {}}
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
                  <Ionicons name="refresh-outline" color={color} size={size} />
                )}
              />
            </View>
            <Text className="pl-4">Feed-back</Text>
            <View className="pl-4">
              <DrawerItem
                label="Rapport de bug"
                onPress={() => {}}
                icon={({ color, size }) => (
                  <AntDesign name="clockcircle" color={color} size={size} />
                )}
              />
              <DrawerItem
                label="Envoyer des feedbacks"
                onPress={() => {}}
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
        );
      }}
    ></Drawer>
  );
}
