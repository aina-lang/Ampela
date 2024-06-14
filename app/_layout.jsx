import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { observer } from "@legendapp/state/react";
import { StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export const RootLayout = observer(() => {
  // const insets = useSafeAreaInsets();
  return (
    // <SafeAreaView className="flex-1" style={{ marginTop: -insets.top }}>
    <GestureHandlerRootView style={styles.gestureHandler}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="(discovery)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GestureHandlerRootView>
    // </SafeAreaView>
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
