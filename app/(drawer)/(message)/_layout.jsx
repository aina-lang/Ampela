import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack, useNavigation } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { SIZES } from "@/constants";
import { useSelector } from "react-redux";

const _layout = () => {
  const user = useSelector((state) => state.user);
  const navigation = useNavigation();
  return (
    <Stack
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
              <TouchableOpacity
                className="p-2 pl-0 mr-3"
                onPress={() => navigation.goBack()}
              >
                <AntDesign name="left" color={"white"} size={24} />
              </TouchableOpacity>
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
              >
                Message
              </Text>
            </View>
            {/* <TouchableOpacity
              className="p-2 pl-0 "
              onPress={() => navigation.navigate("(message)")}
            >
              <AntDesign name="chatbubble" color={"white"} size={30} />
            </TouchableOpacity> */}
          </View>
        ),

        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onemessage" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
