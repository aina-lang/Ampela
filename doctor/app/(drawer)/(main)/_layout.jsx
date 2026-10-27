import React from "react";
import { Tabs, useNavigation, useRouter } from "expo-router";
import { useSelector } from "@legendapp/state/react";
import MyTabBar from "@/components/MyTabBar";
import { userState } from "@/legendstate/AmpelaStates";
import AppHeader, { tabHeaderIcons } from "@/components/AppHeader";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";

/** Onglets de l'application professionnelle : tableau de bord, forum, articles. */
const TabLayout = () => {
  const user = useSelector(() => userState.get());
  const navigation = useNavigation();
  const router = useRouter();
  const unreadNotifications = useUnreadNotifications();

  return (
    <Tabs
      screenOptions={{
        header: () => (
          <AppHeader
            navigation={navigation}
            title={user.username}
            rightIcons={tabHeaderIcons(router, { unreadNotifications })}
            absolute
          />
        ),
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Accueil", tabBarIcon: "home" }} />
      <Tabs.Screen name="(forum)" options={{ title: "Forum", tabBarIcon: "globe-outline", headerShown: false }} />
      <Tabs.Screen name="(article)" options={{ title: "Article", tabBarIcon: "book", headerShown: false }} />
    </Tabs>
  );
};

export default TabLayout;
