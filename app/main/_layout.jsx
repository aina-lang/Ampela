import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { getUser, setFirstLaunchFalse } from "@/services/database";
import { SIZES } from "@/constants";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/redux/userSlice";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      try {
        const userFromSqlite = await getUser();

        await setFirstLaunchFalse();

        console.log("FROM SQILTE ", userFromSqlite);
        dispatch(updateUser(userFromSqlite));
        console.log(user);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF7575",
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          // position: "absolute",
          // bottom: 10,
          marginHorizontal: "auto",
          width: SIZES.width,
          borderRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
