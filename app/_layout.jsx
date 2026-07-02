import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { observer } from "@legendapp/state/react";
import { StyleSheet } from "react-native";
import { ModalProvider } from "@/hooks/ModalProvider";

// CORRECTION : Utilisation de "export default" pour qu'Expo Router puisse charger le composant
const RootLayout = observer(() => {
  return (
    <GestureHandlerRootView style={styles.gestureHandler}>
      <ModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="(discovery)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ModalProvider>
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
