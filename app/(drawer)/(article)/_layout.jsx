import { View, Text, TouchableOpacity } from "react-native";
import React, { useContext } from "react";
import { Stack, useNavigation } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, SIZES } from "@/constants";

import { AntDesign } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";

const _layout = () => {
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: () => (
          <View
            className=" w-full flex-row items-center  justify-between  pt-8"
            style={{
              backgroundColor:
                theme === "pink" ? COLORS.accent400 : COLORS.neutral280,
              height: SIZES.height * 0.16,
              paddingHorizontal: 16,
            }}
          >
            <View className="flex flex-row  items-center justify-center ">
              <TouchableOpacity
                className="p-2 pl-0 mr-3"
                onPress={() => navigation.goBack()}
              >
                <AntDesign
                  name="left"
                  color={theme === "pink" ? "white" : COLORS.accent800}
                  size={35}
                />
              </TouchableOpacity>
              {/* <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: theme === "pink" ? "white" : COLORS.accent800,
                }}
              >
                {user.username}
              </Text> */}
            </View>
            <View className="flex-row">
              {/* <TouchableOpacity
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
              </TouchableOpacity> */}
            </View>
          </View>
        ),
      }}
 
    ></Stack>
  );
};

export default _layout;
