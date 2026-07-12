import React from "react";
import { Stack, useNavigation } from "expo-router";
import AppHeader from "@/components/AppHeader";

const _layout = () => {
  const navigation = useNavigation();
  return (
    <Stack
      screenOptions={{
        header: () => (
          <AppHeader
            navigation={navigation}
            title="Posez des questions"
            showBack
          />
        ),

        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="addpost" options={{ tabBarVisibility: "none" }} />
    </Stack>
  );
};

export default _layout;
