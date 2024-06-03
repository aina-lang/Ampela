import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" />
      <Stack.Screen name="username" />
      <Stack.Screen name="lastMenstrualCycleStart" />
      <Stack.Screen name="questionsSeries" />
    </Stack>
  );
};

export default _layout;
