import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { observer } from "@legendapp/state/react";
import { StyleSheet } from "react-native";
import { ModalProvider } from "@/hooks/ModalProvider";
import AppLockGate from "@/components/AppLockGate";
import { ToastHost } from "@/components/ui";

// Le splash natif reste affiché jusqu'à ce que <SplashLoader /> (app/index.jsx)
// soit monté et le remplace sans à-coup.
SplashScreen.preventAutoHideAsync().catch(() => {});

const RootLayout = observer(() => {
  const router = useRouter();

  // Toucher une notification de rappel ouvre le calendrier de l'accueil.
  useEffect(() => {
    const open = (response) => {
      const data = response?.notification?.request?.content?.data;
      if (data?.kind === "reminder") router.push("/(drawer)/(main)");
    };
    Notifications.getLastNotificationResponseAsync?.()
      .then((r) => r && open(r))
      .catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, [router]);

  return (
    <GestureHandlerRootView style={styles.gestureHandler}>
      {/* Gestion du clavier (bord à bord Android) : champs de saisie au-dessus du clavier */}
      <KeyboardProvider>
        <AppLockGate>
          <ModalProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(discovery)"
                options={{ headerShown: false }}
              />
              {/* Hors du Drawer : push natif depuis la liste, nécessaire à la
                transition partagée de l'image (sharedTransitionTag). */}
              <Stack.Screen name="article" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ModalProvider>
          {/* Popups info/succès/warning/erreur, visibles partout dans l'app */}
          <ToastHost />
        </AppLockGate>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
});

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  gestureHandler: {
    flex: 1,
  },
});
