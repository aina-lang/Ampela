import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack, useNavigation } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SIZES } from "@/constants";
import { useSelector } from "react-redux";

const _layout = () => {
  const user = useSelector((state) => state.user);
  const navigation = useNavigation();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        // headerBackTitleVisible: false,
        // headerShadowVisible: true,
        // headerBackVisible: false,
        // statusBarHidden: false,
        header: () => (
          <View
            className=" w-full flex-row items-center rounded-b-lg justify-between  shadow-md shadow-black pt-8"
            style={{
              backgroundColor: "#FF7575",
              height: SIZES.height * 0.16,
              paddingHorizontal: 16,
            }}
          >
            <View className="flex flex-row  items-center justify-center ">
              <TouchableOpacity
                className="p-2 pl-0 mr-3"
                onPress={() => navigation.openDrawer()}
              >
                <Ionicons name="menu" color={"white"} size={35} />
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
      }}
      // initialRouteName="discovery"
    >
      <Stack.Screen
        name="index"
        // options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default _layout;
