import React from "react";
import { Stack, useNavigation } from "expo-router";
import { preferenceState, userState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import AppHeader from "@/components/AppHeader";

const _layout = () => {
  const user = useSelector(() => userState.get());
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  return (
    <Stack
      screenOptions={{
        header: () => (
          <AppHeader
            navigation={navigation}
            title="Message"
            showBack
            absolute
          />
        ),

        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onemessage" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
