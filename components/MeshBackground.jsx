import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";

const MeshBackground = ({ children, style }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useSelector(() => preferenceState.get());
  const accentColor = theme === "pink" ? "#FF7575" : "#FE8729";

  return (
    <View style={[styles.container, style]}>
      <View style={styles.meshContainer}>
        <View
          style={[
            styles.blob,
            styles.blob1,
            { backgroundColor: accentColor },
          ]}
        />
        <View
          style={[
            styles.blob,
            styles.blob2,
            { backgroundColor: accentColor },
          ]}
        />
        <View
          style={[
            styles.blob,
            styles.blob3,
            { backgroundColor: accentColor },
          ]}
        />
      </View>
      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
  },
  meshContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.08,
  },
  blob1: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
  },
  blob2: {
    width: 300,
    height: 300,
    bottom: 100,
    left: -80,
  },
  blob3: {
    width: 250,
    height: 250,
    top: "40%",
    right: -60,
  },
  content: {
    flex: 1,
  },
});

export default MeshBackground;
