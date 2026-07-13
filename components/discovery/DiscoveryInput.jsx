import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SIZES } from "@/constants";
import { DISCOVERY_RADIUS, DISCOVERY_SHADOWS } from "./DiscoveryTheme";

const DiscoveryInput = ({
  icon,
  rightIcon,
  onRightIconPress,
  error,
  containerStyle,
  inputStyle,
  backgroundColor = "#FFFFFF",
  borderColor = "#F0F0F0",
  ...textInputProps
}) => (
  <View style={containerStyle}>
    <View
      style={[
        styles.wrapper,
        { backgroundColor, borderColor: error ? "#E24C4C" : borderColor },
        error && styles.wrapperError,
      ]}
    >
      {icon && <View style={styles.iconLeft}>{icon}</View>}
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor="#A0A0A0"
        {...textInputProps}
      />
      {rightIcon && (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.iconRight}
          activeOpacity={0.7}
        >
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
    {!!error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: DISCOVERY_RADIUS.md,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
  },
  wrapperError: {
    borderWidth: 1.5,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
    padding: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
  },
  error: {
    color: "#E24C4C",
    fontSize: SIZES.small - 1,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: "Regular",
  },
});

export default DiscoveryInput;
