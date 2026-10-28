import React from "react";
import i18n from "@/constants/i18n";
import { Stack, useNavigation } from "expo-router";
import { preferenceState, userState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import AppHeader from "@/components/AppHeader";

const Layout = () => {
  const user = useSelector(() => userState.get());
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  return (
    <Stack
      screenOptions={{
        header: ({ route }) => (
          <AppHeader
            navigation={navigation}
            title={route.name === "media" ? i18n.t("msgMediaTitle") : i18n.t("msgTitle")}
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
      <Stack.Screen name="media" />
    </Stack>
  );
};

export default Layout;
