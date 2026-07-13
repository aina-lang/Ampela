import { useMemo } from "react";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { COLORS, SIZES } from "@/constants";

export const DISCOVERY_RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 999,
};

export const DISCOVERY_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const DISCOVERY_SHADOWS = {
  float: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  raised: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
  button: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  }),
};

export const DISCOVERY_TEXT = {
  eyebrow: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.065,
    color: "#1A1A1A",
    lineHeight: SIZES.width * 0.078,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#6A6A6A",
    lineHeight: 22,
  },
  label: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#3A3A3A",
  },
  body: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A7A7A",
    lineHeight: 20,
  },
};

export const useDiscoveryTheme = () => {
  const { theme } = useSelector(() => preferenceState.get());

  return useMemo(() => {
    const isPink = theme === "pink";
    const accentColor = isPink ? "#FF7575" : "#FE8729";
    const accentColorDisabled = isPink ? "#FFB5B5" : "#FED4A0";
    const accentSoft = isPink ? "#FFF0F0" : "#FFF5EB";
    const accentSurface = isPink ? "#FFF5F5" : "#FFFAF5";
    const accentContainer = isPink ? "#FFEBEB" : "#FFEFDF";
    const onAccentContainer = isPink ? "#7A2929" : "#7A3D0C";

    return {
      theme,
      isPink,
      accentColor,
      accentColorDisabled,
      accentSoft,
      accentSurface,
      accentContainer,
      onAccentContainer,
      neutral100: COLORS.neutral100,
      surface: accentSurface,
      surfaceContainer: COLORS.neutral100,
      surfaceVariant: "#F7F7F7",
      textPrimary: "#1A1A1A",
      textSecondary: "#6A6A6A",
      textTertiary: "#9E9E9E",
      divider: "#F0F0F0",
      radius: DISCOVERY_RADIUS,
      spacing: DISCOVERY_SPACING,
      shadows: DISCOVERY_SHADOWS,
      text: DISCOVERY_TEXT,
    };
  }, [theme]);
};
