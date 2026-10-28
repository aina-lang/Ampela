import React from "react";
import i18n from "@/constants/i18n";
import { Stack, useNavigation } from "expo-router";
import AppHeader from "@/components/AppHeader";

const Layout = () => {
  const navigation = useNavigation();
  return (
    <Stack
      screenOptions={{
        header: ({ route }) => (
          <AppHeader
            navigation={navigation}
            title={route.name === "post" ? i18n.t("forumQuestion") : i18n.t("forumAskQuestion")}
            showBack
            absolute
          />
        ),
      }}
    >
      <Stack.Screen name="addpost" />
      <Stack.Screen name="post" />
    </Stack>
  );
};

export default Layout;
