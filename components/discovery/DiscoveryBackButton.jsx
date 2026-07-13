import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const DiscoveryBackButton = ({ onPress, label = "Retour", color = "#9E9E9E" }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.button}>
    <Text style={[styles.text, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 15,
    fontFamily: "SBold",
  },
});

export default DiscoveryBackButton;
