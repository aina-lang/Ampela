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
import {
  generateCycleMenstrualData,
  getOvulationDate,
} from "@/utils/menstruationUtils";
import moment from "moment";

export default function TabLayout() {
  const user = useSelector((state) => state.user);

  // console.log(getOvulationDate(user.lastMenstruationDate,28));
  generateCycleMenstrualData(
    "2024-06-02",
    25,
    5
  );

  // console.log(user.cycleDuration);
  // console.log(getOvulationDate(user.lastMenstruationDate, 28));
  // console.log(moment(user.lastMenstruationDate).format("YYYY-MM-DD"));

  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchData() {
      try {
        const userFromSqlite = await getUser();

        await setFirstLaunchFalse();

        // console.log("FROM SQILTE ", userFromSqlite);
        dispatch(updateUser(userFromSqlite));
        // console.log(user);
        const cyclesFromSqlite = await getAllCycle();
        // console.log("Cycles FROM SQLITE ", cyclesFromSqlite);
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
                  {user.username}
                </Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  className="p-2 pl-0 "
                  onPress={() => navigation.navigate("(message)")}
                >
                  <Ionicons name="chatbubble" color={"white"} size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-2 pl-0 "
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
            title: "message",
            tabBarIcon: "chatbubble",
            headerShown: false,
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
