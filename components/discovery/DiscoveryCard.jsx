import React from "react";
import { View, StyleSheet } from "react-native";
import { DISCOVERY_RADIUS, DISCOVERY_SHADOWS } from "./DiscoveryTheme";

const DiscoveryCard = ({ children, style, elevated = true, color = "#FFFFFF" }) => (
  <View style={[styles.card, { backgroundColor: color }, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: DISCOVERY_RADIUS.xl,
    padding: 20,
  },
});

export default DiscoveryCard;
