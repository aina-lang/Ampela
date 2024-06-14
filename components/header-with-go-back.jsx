import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SIZES, icons, COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";

const HeaderWithGoBack = ({ navigation, title, iconLeft, onIconLeftPress }) => {
  const { theme } = useSelector(() => preferenceState.get());
  return (
    <View
      className=" flex-row items-center  z-50 justify-between  pt-8 self-center shadow-md shadow-black rounded-b-lg"
      style={{
        backgroundColor:
          theme === "pink" ? COLORS.accent400 : COLORS.neutral280,
        height: SIZES.height * 0.16,
        paddingHorizontal: 16,
        width: SIZES.width,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
          navigation.openDrawer();
        }}
        style={{ padding: 10 }}
      >
        <Ionicons
          name="arrow-back"
          color={theme === "pink" ? "white" : "black"}
          size={24}
        />
      </TouchableOpacity>
      <Text
        style={[
          styles.medium,
          { color: theme === "pink" ? "white" : "black"},
        ]}
      >
        {title}
      </Text>
      {iconLeft ? (
        <TouchableOpacity className="p-2 pl-0 mr-3" onPress={onIconLeftPress}>
          <Ionicons name="arrow-back" color={"white"} size={35} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  medium: {
    fontFamily: "Medium",
    fontSize: 20,
    marginRight:8
  },
});

export default HeaderWithGoBack;
