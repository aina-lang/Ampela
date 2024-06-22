import React, { useEffect } from "react";
import { getAllCycle, getUser, setFirstLaunchFalse } from "@/services/database";
import { Tabs, useNavigation } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MyTabBar from "@/components/MyTabBar";
import { Text, TouchableOpacity, View, SafeAreaView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, SIZES } from "@/constants";
import { useSelector } from "@legendapp/state/react";
import {
  userState,
  cycleMenstruelState,
  updateUser,
  updateCycleMenstruelData,
  preferenceState,
} from "@/legendstate/AmpelaStates";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabLayout = () => {
  const user = useSelector(() => userState.get());
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());

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

  const insets = useSafeAreaInsets();
  return (
    // <SafeAreaView style={{ marginTop: insets.top }} className="bg-red-400">
    <Tabs
      screenOptions={{
        header: () => (
          <View
            className="w-full flex-row items-center pt-8 rounded-b-lg justify-between shadow-md shadow-black absolute "
            style={{
              backgroundColor:
                theme === "orange" ? COLORS.accent800 : COLORS.accent500,
              height: SIZES.height * 0.16,
              paddingHorizontal: 16,
            }}
          >
            <View className="flex flex-row items-center justify-center">
              <TouchableOpacity className="p-2 pl-0 mr-3"   onPress={() => navigation.openDrawer()}>
                <Ionicons
                  name="menu"
                  color={"white"}
                  size={35}
                
                />
              </TouchableOpacity>
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
              >
                {user.username}
              </Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                className="p-2 pl-0"
                onPress={() => navigation.navigate("(message)")}
              >
                <Ionicons name="chatbubble" color={"white"} size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2 pl-0"
                onPress={() => navigation.navigate("(message)")}
              >
                <Ionicons
                  name="notifications-circle"
                  color={"white"}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          </View>
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
    // </SafeAreaView>
  );
};

export default TabLayout;
