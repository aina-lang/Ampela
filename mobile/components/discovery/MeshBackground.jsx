import React from "react";
import { View, StyleSheet } from "react-native";

const MeshBackground = ({ color, surfaceColor = "#FFFFFF" }) => (
  <View style={[styles.meshBackground, { backgroundColor: surfaceColor }]}>
    <View style={[styles.blob, { backgroundColor: color }]} />
    <View style={[styles.blob, styles.blob2, { backgroundColor: color }]} />
  </View>
);

const styles = StyleSheet.create({
  meshBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 460,
    height: 460,
    borderRadius: 230,
    opacity: 0.08,
    top: -140,
    right: -140,
  },
  blob2: {
    width: 340,
    height: 340,
    bottom: 140,
    left: -140,
    top: undefined,
    right: undefined,
    opacity: 0.06,
  },
});

export default MeshBackground;
