import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useDiscoveryTheme } from "@/components/discovery/DiscoveryTheme";

// Une bulle pastel qui flotte doucement (translation + léger zoom),
// en boucle infinie avec un déphasage propre à chaque bulle.
const Blob = ({ size, color, opacity, position, delay = 0, drift = 14 }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true
      )
    );
  }, [progress, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, drift]) },
      { translateX: interpolate(progress.value, [0, 1], [0, drift / 2]) },
      { scale: interpolate(progress.value, [0, 1], [1, 1.07]) },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
        },
        position,
        style,
      ]}
    />
  );
};

/**
 * Décor d'arrière-plan : bulles pastel animées aux couleurs du thème.
 * À placer derrière le contenu (position absolue, non interactif).
 */
const DecorativeBlobs = () => {
  const { accentColor, accentContainer } = useDiscoveryTheme();

  return (
    <>
      <Blob
        size={220}
        color={accentColor}
        opacity={0.1}
        position={{ top: -70, right: -60 }}
        drift={18}
      />
      <Blob
        size={90}
        color={accentColor}
        opacity={0.16}
        position={{ top: 90, left: -30 }}
        delay={600}
        drift={12}
      />
      <Blob
        size={38}
        color={accentColor}
        opacity={0.22}
        position={{ top: 170, right: 40 }}
        delay={1100}
        drift={10}
      />
      <Blob
        size={180}
        color={accentContainer}
        opacity={0.9}
        position={{ bottom: -60, left: -50 }}
        delay={300}
        drift={16}
      />
      <Blob
        size={54}
        color={accentColor}
        opacity={0.12}
        position={{ bottom: 120, right: -12 }}
        delay={900}
        drift={12}
      />
    </>
  );
};

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
  },
});

export default DecorativeBlobs;
