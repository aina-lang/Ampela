import React from "react";
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
            title={route.name === "post" ? "Question" : "Poser une question"}
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
