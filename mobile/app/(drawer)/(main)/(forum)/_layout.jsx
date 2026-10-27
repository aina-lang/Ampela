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
        header: () => (
          <AppHeader
            navigation={navigation}
            title="Forum"
            absolute
            rightIcons={tabHeaderIcons(router, { unreadNotifications })}
          />
        ),
        headerTransparent: true,
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default Layout;
