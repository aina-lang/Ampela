import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SIZES, COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";

const AppHeader = ({
  navigation,
  title,
  showBack,
  onBackPress,
  rightIcons,
  absolute,
  bgColor: customBg,
  noRound,
  noShadow,
}) => {
  const { theme } = useSelector(() => preferenceState.get());
  const bgColor = customBg || (theme === "pink" ? COLORS.accent500 : COLORS.accent800);

  const containerStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: bgColor,
    height: SIZES.height * 0.16,
    paddingHorizontal: 16,
    paddingTop: 70,
    width: SIZES.width,
    borderBottomLeftRadius: noRound ? 0 : 16,
    borderBottomRightRadius: noRound ? 0 : 16,
    shadowColor: noShadow ? "transparent" : "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: noShadow ? 0 : 0.15,
    shadowRadius: noShadow ? 0 : 6,
    elevation: noShadow ? 0 : 4,
  };

  if (absolute) {
    containerStyle.position = "absolute";
    containerStyle.top = 0;
    containerStyle.zIndex = 50;
  }

  return (
    <View style={containerStyle}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBackPress || (() => navigation.goBack())}
            style={{ padding: 6 }}
          >
            <Ionicons name="arrow-back" color="white" size={24} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ padding: 6 }}
            onPress={() => navigation.openDrawer()}
          >
            <View style={{ width: 22, gap: 5 }}>
              <View style={{ height: 4, backgroundColor: "white", borderRadius: 2 }} />
              <View style={{ height: 4, backgroundColor: "white", borderRadius: 2, width: 26 }} />
              <View style={{ height: 4, backgroundColor: "white", borderRadius: 2 }} />
            </View>
          </TouchableOpacity>
        )}

        {title !== "" && (
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
            }}
          >
            {title}
          </Text>
        )}
      </View>

      {rightIcons && (
        <View style={{ flexDirection: "row", gap: 4 }}>
          {rightIcons.map((icon, index) => (
            <TouchableOpacity
              key={index}
              style={{ padding: 4 }}
              onPress={icon.onPress}
            >
              <Ionicons name={icon.name} color="white" size={26} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default AppHeader;
