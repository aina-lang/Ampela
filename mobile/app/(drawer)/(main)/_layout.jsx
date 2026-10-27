import React, { useEffect } from "react";
import { getAllCycle, getUser, setFirstLaunchFalse } from "@/services/database";
import { Tabs, useNavigation, useRouter } from "expo-router";
import MyTabBar from "@/components/MyTabBar";
import { useSelector } from "@legendapp/state/react";
import {
  userState,
  updateUser,
  updateCycleMenstruelData,
} from "@/legendstate/AmpelaStates";
import AppHeader, { tabHeaderIcons } from "@/components/AppHeader";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import { refreshRemindersIfStale } from "@/services/reminders";

const TabLayout = () => {
  const user = useSelector(() => userState.get());
  const navigation = useNavigation();
  const router = useRouter();
  const unreadNotifications = useUnreadNotifications();

  useEffect(() => {
    async function fetchData() {
      try {
        const userFromSqlite = await getUser();
        await setFirstLaunchFalse();
        updateUser(userFromSqlite);

        const cyclesFromSqlite = await getAllCycle();
        updateCycleMenstruelData(cyclesFromSqlite);
        // Renouvelle les rappels planifiés si leur fenêtre est entamée.
        refreshRemindersIfStale(cyclesFromSqlite).catch((error) =>
          console.error("Reminder refresh failed:", error)
        );
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchData();
  }, []);

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
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: "calendar",
        }}
      />
      <Tabs.Screen
        name="(forum)"
        options={{
          title: "Forum",
          tabBarIcon: "globe-outline",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(article)"
        options={{
          title: "Article",
          tabBarIcon: "book",
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
