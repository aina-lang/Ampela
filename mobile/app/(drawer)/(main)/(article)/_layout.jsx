import React from "react";
import { Stack, useNavigation, useRouter } from "expo-router";
import AppHeader, { tabHeaderIcons } from "@/components/AppHeader";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";

const Layout = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const unreadNotifications = useUnreadNotifications();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: () => (
          <AppHeader
            navigation={navigation}
            title="Article"
            absolute
            rightIcons={tabHeaderIcons(router, { unreadNotifications })}
          />
        ),
        headerTransparent: true,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default Layout;
