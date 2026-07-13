import React from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack } from "expo-router";

const _layout = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: insets.top }}
      edges={["left", "right", "bottom"]}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          gestureDirection: "horizontal",
          fullScreenGestureEnabled: false,
        }}
        initialRouteName="index"
      >
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="selectlanguage" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="confidentiality" />
        <Stack.Screen name="login" />
        <Stack.Screen name="username" />
        <Stack.Screen name="questionsSeries" options={{ animation: "fade" }} />
      </Stack>
    </SafeAreaView>
  );
};

export default _layout;
