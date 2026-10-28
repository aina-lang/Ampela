import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthContextProvider } from "@/hooks/AuthContext";
import { useDiscoveryTheme } from "@/components/discovery";

/**
 * Pile principale de l'app : onglets (accueil, forum, articles) + écrans
 * secondaires (profil, réglages, messagerie, notifications, publication).
 * Le menu latéral a été remplacé par l'écran Profil, ouvert via l'avatar
 * de l'en-tête ; le retour est donc naturel (pile), sans rustine.
 */
const MainStack = () => {
  const { surface } = useDiscoveryTheme();
  return (
    <AuthContextProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: surface },
        }}
      >
        <Stack.Screen name="(main)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="(message)" />
        <Stack.Screen name="(forum)" />
      </Stack>
    </AuthContextProvider>
  );
};

export default MainStack;
