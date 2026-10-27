import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { SIZES } from "@/constants";

// API globale : utilisable partout (composants, services, callbacks)
// sans hook ni contexte. Le ToastHost monté à la racine écoute.
let pushToast = null;

export const toast = {
  show(type, message) {
    pushToast?.({ type, message });
  },
  success(message) {
    this.show("success", message);
  },
  error(message) {
    this.show("error", message);
  },
  warning(message) {
    this.show("warning", message);
  },
  info(message) {
    this.show("info", message);
  },
};

const PALETTE = {
  success: { bg: "#E6F7EE", fg: "#1F9D62", icon: "checkmark-circle" },
  error: { bg: "#FFECEE", fg: "#E24C6B", icon: "close-circle" },
  warning: { bg: "#FFF3DF", fg: "#C07E1F", icon: "alert-circle" },
  info: { bg: "#ECF1FE", fg: "#4A6FD0", icon: "information-circle" },
};

const HIDDEN_Y = -180;
const AUTO_HIDE_MS = 3200;

/**
 * Hôte des popups de notification — monté une seule fois à la racine
 * de l'app. Entre par le haut avec un rebond ; les erreurs secouent la
 * carte en zigzag horizontal.
 */
export const ToastHost = () => {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState(null);
  const counter = useRef(0);
  const hideTimer = useRef(null);
  const translateY = useSharedValue(HIDDEN_Y);
  const shakeX = useSharedValue(0);

  const hide = useCallback(() => {
    clearTimeout(hideTimer.current);
    // eslint-disable-next-line react-hooks/immutability -- API Reanimated : écrire .value est le contrat
    translateY.value = withTiming(HIDDEN_Y, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(setCurrent)(null);
      }
    });
  }, [translateY]);

  useEffect(() => {
    pushToast = (next) => {
      clearTimeout(hideTimer.current);
      counter.current += 1;
      setCurrent({ ...next, key: counter.current });
    };
    return () => {
      pushToast = null;
    };
  }, []);

  useEffect(() => {
    if (!current) return;

    // Entrée : glisse depuis le haut, sans rebond.
    // eslint-disable-next-line react-hooks/immutability -- API Reanimated : écrire .value est le contrat
    translateY.value = HIDDEN_Y;
    translateY.value = withTiming(0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });

    // Erreur : secousse en zigzag une fois la carte en place.
    shakeX.value = 0;
    if (current.type === "error") {
      shakeX.value = withDelay(
        260,
        withSequence(
          withTiming(-12, { duration: 55 }),
          withTiming(12, { duration: 55 }),
          withTiming(-9, { duration: 50 }),
          withTiming(9, { duration: 50 }),
          withTiming(-5, { duration: 45 }),
          withTiming(5, { duration: 45 }),
          withTiming(0, { duration: 40 })
        )
      );
    }

    hideTimer.current = setTimeout(hide, AUTO_HIDE_MS);
    return () => clearTimeout(hideTimer.current);
  }, [current, translateY, shakeX, hide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: shakeX.value }],
  }));

  if (!current) return null;

  const palette = PALETTE[current.type] ?? PALETTE.info;

  return (
    <Animated.View
      key={current.key}
      pointerEvents="box-none"
      style={[styles.wrapper, { top: insets.top + 10 }, animatedStyle]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hide}
        style={[styles.card, { backgroundColor: palette.bg }]}
      >
        <Ionicons name={palette.icon} size={22} color={palette.fg} />
        <Text style={[styles.message, { color: palette.fg }]} numberOfLines={3}>
          {current.message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 12,
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 22,
    shadowColor: "#5A4A55",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  message: {
    flex: 1,
    fontFamily: "SBold",
    fontSize: SIZES.small,
    lineHeight: 19,
  },
});

export default ToastHost;
