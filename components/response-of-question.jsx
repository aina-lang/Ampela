import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

const ResponseChip = ({ text, active, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: active ? "#FF7575" : "#FAFAFA",
          borderColor: active ? "#FF7575" : "#F0F0F0",
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.text,
          { color: active ? COLORS.neutral100 : "#3A3A3A" },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

// Alias conservés pour ne pas casser les imports existants
// (les deux composants étaient identiques)
export const ResponseOfQuestion0 = ResponseChip;
export const ResponseOfQuestion1 = ResponseChip;

const styles = StyleSheet.create({
  container: {
    height: 40,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
});