import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const _layout = () => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      className="flex-1"
      style={{ marginTop: -(insets.top + 40), paddingTop: 20 }}
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
        <Stack.Screen name="username" />
        <Stack.Screen name="lastMenstrualCycleStart" />
        <Stack.Screen name="questionsSeries" />
      </Stack>
    </SafeAreaView>
  );
};

export default _layout;
