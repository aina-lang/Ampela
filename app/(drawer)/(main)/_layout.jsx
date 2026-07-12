import React, { useEffect } from "react";
import { getAllCycle, getUser, setFirstLaunchFalse } from "@/services/database";
import { Tabs, useNavigation } from "expo-router";
import MyTabBar from "@/components/MyTabBar";
import { useSelector } from "@legendapp/state/react";
import {
  userState,
  updateUser,
  updateCycleMenstruelData,
} from "@/legendstate/AmpelaStates";
import AppHeader from "@/components/AppHeader";

const TabLayout = () => {
  const user = useSelector(() => userState.get());
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchData() {
      try {
        const userFromSqlite = await getUser();
        await setFirstLaunchFalse();
        updateUser(userFromSqlite);

        const cyclesFromSqlite = await getAllCycle();
        updateCycleMenstruelData(cyclesFromSqlite);
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
            rightIcons={[
              { name: "chatbubble", onPress: () => navigation.navigate("(message)") },
              { name: "notifications-circle", onPress: () => navigation.navigate("(message)") },
            ]}
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
