import React, { useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";

/**
 * Bloc de squelette de chargement : rectangle gris clair qui « respire »
 * (opacité en boucle). Aucune dépendance native. Props : width, height,
 * radius, style.
 */
const Skeleton = ({ width = "100%", height = 14, radius = 8, style }) => {
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.block, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: "#ECE8EE",
  },
});

export default Skeleton;
