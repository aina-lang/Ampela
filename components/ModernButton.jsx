import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";
import { DISCOVERY_RADIUS, DISCOVERY_SHADOWS } from "@/components/discovery/DiscoveryTheme";

const ModernButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  accentColor = "#FF7575",
  accentColorDisabled = "#FFB5B5",
  variant = "filled",
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const backgroundColor = variant === "filled"
    ? (isDisabled ? accentColorDisabled : accentColor)
    : "transparent";

  const textColor = variant === "filled"
    ? (isDisabled ? "rgba(255,255,255,0.7)" : COLORS.neutral100)
    : accentColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor: variant === "outlined" ? accentColor : "transparent",
          borderWidth: variant === "outlined" ? 1.5 : 0,
        },
        !isDisabled && variant === "filled" && DISCOVERY_SHADOWS.button(accentColor),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            { color: textColor },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: DISCOVERY_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  buttonText: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    letterSpacing: 0.3,
  },
});

export default ModernButton;
