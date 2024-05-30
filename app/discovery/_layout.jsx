import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName="lastMenstrualCycleStartAge"
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="personalHealthTestScreen" />
      <Stack.Screen name="usernameAndPasswordScreen" />
      <Stack.Screen name="lastMenstrualCycleStartAge" />
    </Stack>
  );
};

export default _layout;
