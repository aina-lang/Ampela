import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";
import { DISCOVERY_RADIUS, DISCOVERY_SHADOWS, useDiscoveryTheme } from "@/components/discovery/DiscoveryTheme";

const ResponseChip = ({ text, active, onPress, accentColor }) => {
  const { accentColor: themeAccent, accentSoft } = useDiscoveryTheme();
  const color = accentColor || themeAccent;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: active ? color : accentSoft,
        },
        active && DISCOVERY_SHADOWS.button(color),
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.text,
          { color: active ? COLORS.neutral100 : color },
          active && styles.textSelected,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export const ResponseOfQuestion0 = ResponseChip;
export const ResponseOfQuestion1 = ResponseChip;

const styles = StyleSheet.create({
  container: {
    height: 42,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: DISCOVERY_RADIUS.md,
    marginRight: 8,
  },
  text: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  textSelected: {
    fontFamily: "SBold",
  },
});
