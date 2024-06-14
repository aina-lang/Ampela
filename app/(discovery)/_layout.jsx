import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const _layout = () => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView className="flex-1" style={{ marginTop: -(insets.top + 40) }}>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        <Stack.Screen name="index" />
        <Stack.Screen name="username" />
        <Stack.Screen name="lastMenstrualCycleStart" />
        <Stack.Screen name="questionsSeries" />
      </Stack>
    </SafeAreaView>
  );
};

export default _layout;
