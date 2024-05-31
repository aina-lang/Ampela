import React, { useEffect } from "react";
import { getAllCycle, getUser, setFirstLaunchFalse } from "@/services/database";
import { Tabs, useNavigation } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/redux/userSlice";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MyTabBar from "@/components/MyTabBar";
import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SIZES } from "@/constants";
import { updateCycleMenstruelData } from "@/redux/cycleSlice";

export default function TabLayout() {
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchData() {
      try {
        const userFromSqlite = await getUser();

        await setFirstLaunchFalse();

        console.log("FROM SQILTE ", userFromSqlite);
        dispatch(updateUser(userFromSqlite));
        console.log(user);
        const cyclesFromSqlite = await getAllCycle();
        console.log("Cycles FROM SQLITE ", cyclesFromSqlite);
        dispatch(updateCycleMenstruelData(cyclesFromSqlite));
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          header: () => (
            <View
              className=" w-full flex-row items-center pt-8  rounded-b-lg justify-between  shadow-md shadow-black"
              style={{
                backgroundColor: "#FF7575",
                height: SIZES.height * 0.16,
                paddingHorizontal: 16,
              }}
            >
              <View className="flex flex-row  items-center justify-center ">
                <TouchableOpacity className="p-2 pl-0 mr-3">
                  <Ionicons
                    name="menu"
                    color={"white"}
                    size={35}
                    onPress={() => navigation.openDrawer()}
                  />
                </TouchableOpacity>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
                >
                  Bonjour {user.username}
                </Text>
              </View>
              <TouchableOpacity
                className="p-2 pl-0 "
                onPress={() => navigation.openDrawer()}
              >
                <Ionicons
                  name="notifications-circle"
                  color={"white"}
                  size={30}
                />
              </TouchableOpacity>
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
          name="(messageandforum)/index"
          options={{
            title: "message",
            tabBarIcon: "chatbubble",
          }}
        />
        <Tabs.Screen
          name="(article)"
          options={{
            title: "article",
            tabBarIcon: "book",
            headerShown: false,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
