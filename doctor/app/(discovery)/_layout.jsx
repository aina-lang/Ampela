import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { useDiscoveryTheme } from "@/components/discovery";

const Layout = () => {
  const { surface } = useDiscoveryTheme();

  // Pas de padding top ici : les fonds (mesh + bulles) passent sous la
  // barre de statut, chaque écran padde son propre contenu avec les insets.
  return (
    <View style={{ flex: 1, backgroundColor: surface }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          gestureDirection: "horizontal",
          fullScreenGestureEnabled: false,
          contentStyle: { backgroundColor: surface },
        }}
        initialRouteName="index"
      >
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="selectlanguage" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="confidentiality" />
        <Stack.Screen name="login" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="access" />
      </Stack>
    </View>
  );
};

export default Layout;
