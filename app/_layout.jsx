import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { observer } from "@legendapp/state/react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";

export const RootLayout = observer(() => {
  return (

      <GestureHandlerRootView style={styles.gestureHandler}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="(discovery)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  gestureHandler: {
    flex: 1,
  },
});
