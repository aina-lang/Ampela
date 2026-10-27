import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SIZES } from "@/constants";
import { useDiscoveryTheme } from "@/components/discovery/DiscoveryTheme";

/**
 * Système de boutons unifié — design doux et féminin :
 * forme pilule, aucune bordure, ombre légère teintée par l'accent
 * uniquement sur le bouton primaire.
 *
 * Variants :
 *  - primary   : fond accent, texte blanc (action principale)
 *  - secondary : fond teinté pastel (accentContainer), texte accent
 *  - ghost     : transparent, texte accent (action discrète)
 *  - danger    : fond rosé doux, texte rouge (action destructive)
 *  - neutral   : fond gris très clair, texte sombre (annuler…)
 */
const Button = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  size = "md",
  icon,
  accentColor: accentOverride,
  accentColorDisabled: accentDisabledOverride,
  style,
  textStyle,
}) => {
  const theme = useDiscoveryTheme();
  const accent = accentOverride || theme.accentColor;
  const accentDisabled = accentDisabledOverride || theme.accentColorDisabled;
  const accentSoft = theme.accentContainer;

  const isDisabled = disabled || loading;

  const palette = {
    primary: {
      bg: isDisabled ? accentDisabled : accent,
      text: isDisabled ? "rgba(255,255,255,0.75)" : "#FFFFFF",
      shadow: !isDisabled,
    },
    secondary: {
      bg: accentSoft,
      text: isDisabled ? accentDisabled : accent,
      shadow: false,
    },
    ghost: {
      bg: "transparent",
      text: isDisabled ? accentDisabled : accent,
      shadow: false,
    },
    danger: {
      bg: "#FFECEE",
      text: "#E24C6B",
      shadow: false,
    },
    neutral: {
      bg: "#F4F3F6",
      text: "#6E6A73",
      shadow: false,
    },
  }[variant] ?? {
    bg: accent,
    text: "#FFFFFF",
    shadow: !isDisabled,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        size === "sm" ? styles.sm : styles.md,
        { backgroundColor: palette.bg },
        palette.shadow && {
          shadowColor: accent,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.22,
          shadowRadius: 12,
          elevation: 3,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.text} />
      ) : (
        <View style={styles.row}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              size === "sm" && styles.textSm,
              { color: palette.text },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  md: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    minHeight: 54,
  },
  sm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 42,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    marginRight: 2,
  },
  text: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: SIZES.small,
  },
});

export const PrimaryButton = (props) => <Button {...props} variant="primary" />;
export const SecondaryButton = (props) => (
  <Button {...props} variant="secondary" />
);
export const GhostButton = (props) => <Button {...props} variant="ghost" />;
export const DangerButton = (props) => <Button {...props} variant="danger" />;
export const NeutralButton = (props) => <Button {...props} variant="neutral" />;

export default Button;
