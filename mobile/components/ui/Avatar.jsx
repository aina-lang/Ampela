import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDiscoveryTheme } from "@/components/discovery/DiscoveryTheme";

/** Initiales (deux lettres au plus) d'un pseudo : « Sarah_M » → « SM ». */
const initialsOf = (name) => {
  const parts = String(name ?? "")
    .split(/[\s_.-]+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[1][0];
  return letters.toUpperCase();
};

/**
 * Avatar : la photo si elle existe, sinon un disque aux couleurs du thème
 * avec les initiales du pseudo (ou une silhouette sans pseudo).
 *
 * Props : uri (URL ou source d'image), name, size, borderWidth,
 * borderColor, fill (occupe tout le conteneur parent), fontSize, style.
 */
const Avatar = ({
  uri,
  name,
  size = 42,
  borderWidth = 0,
  borderColor,
  fill = false,
  fontSize,
  style,
}) => {
  const { accentColor, accentContainer } = useDiscoveryTheme();
  const frame = fill
    ? { width: "100%", height: "100%", borderRadius: 999 }
    : { width: size, height: size, borderRadius: size / 2 };
  const border = borderWidth ? { borderWidth, borderColor: borderColor ?? accentContainer } : null;

  const source = typeof uri === "string" ? (uri ? { uri } : null) : uri || null;
  if (source) {
    return <Image source={source} style={[frame, border, style]} />;
  }

  const initials = initialsOf(name);
  const textSize = fontSize ?? Math.round(size * 0.4);
  return (
    <View style={[styles.placeholder, frame, border, { backgroundColor: accentContainer }, style]}>
      {initials ? (
        <Text style={[styles.initials, { color: accentColor, fontSize: textSize }]}>{initials}</Text>
      ) : (
        <Ionicons name="person" size={Math.round(textSize * 1.3)} color={accentColor} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    fontFamily: "Bold",
    letterSpacing: 0.5,
  },
});

export default Avatar;
