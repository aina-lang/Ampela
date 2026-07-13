import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { SIZES, COLORS } from "@/constants";
import StepIndicator from "@/components/StepIndicator";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { StatusBar } from "expo-status-bar";
import { useDiscoveryTheme } from "@/components/discovery/DiscoveryTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

const StepScreenWrapper = ({
  children,
  stepNumber,
  eyebrow,
  title,
  subtitle,
  accentColor,
  contentStyle,
}) => {
  const progress = useSharedValue(0);
  const { theme, accentColor: themeAccent, surface } = useDiscoveryTheme();
  const currentAccent = accentColor || themeAccent;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    progress.value = 0;
    progress.value = withSpring(1, { damping: 20, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: withTiming(progress.value ? 0 : 20, { duration: 400 }),
      },
    ],
  }));

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <StatusBar style="dark" />
      <View style={styles.background}>
        <View style={[styles.blob, { backgroundColor: currentAccent }]} />
        <View style={[styles.blob, styles.blob2, { backgroundColor: currentAccent }]} />
      </View>

      <AnimatedView style={[styles.content, animatedStyle, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: currentAccent }]}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <View style={styles.stepIndicatorWrapper}>
            <StepIndicator currentStep={stepNumber} accentColor={currentAccent} />
          </View>
        </View>

        <View style={[styles.body, contentStyle]}>{children}</View>
      </AnimatedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    opacity: 0.08,
    top: -90,
    right: -90,
  },
  blob2: {
    width: 280,
    height: 280,
    bottom: 100,
    left: -80,
    top: undefined,
    right: undefined,
    opacity: 0.06,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  eyebrow: {
    fontFamily: "SBold",
    fontSize: SIZES.small - 1,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.065,
    color: "#1A1A1A",
    marginBottom: 10,
    lineHeight: SIZES.width * 0.078,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#6A6A6A",
    lineHeight: 22,
    marginBottom: 10,
  },
  stepIndicatorWrapper: {
    marginTop: 8,
    marginBottom: 4,
  },
  body: {
    flex: 1,
  },
});

export default StepScreenWrapper;
