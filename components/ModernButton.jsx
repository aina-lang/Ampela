import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from "react-native";
import { COLORS, SIZES, SHADOWS } from "@/constants";

const ModernButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  accentColor = "#FF7575",
  accentColorDisabled = "#FFB5B5",
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor: isDisabled ? accentColorDisabled : accentColor,
          shadowColor: isDisabled ? "transparent" : accentColor,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.neutral100} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            { color: isDisabled ? "#9E9E9E" : COLORS.neutral100 },
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
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 52,
  },
  buttonText: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    letterSpacing: 0.3,
  },
});

export default ModernButton;
