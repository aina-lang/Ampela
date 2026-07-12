import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInUp,
} from "react-native-reanimated";
import { SIZES, COLORS, SHADOWS } from "@/constants";
import StepIndicator from "@/components/StepIndicator";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { StatusBar } from "expo-status-bar";

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
  const { theme } = useSelector(() => preferenceState.get());
  const currentAccent = accentColor || (theme === "pink" ? "#FF7575" : "#FE8729");

  useEffect(() => {
    progress.value = 0;
    progress.value = withSpring(1, {
      damping: 20,
      stiffness: 100,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        {
          translateY: withTiming(progress.value ? 0 : 20, {
            duration: 400,
          }),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.background}>
        <View style={[styles.blob, { backgroundColor: currentAccent }]} />
        <View
          style={[
            styles.blob,
            styles.blob2,
            { backgroundColor: currentAccent },
          ]}
        />
      </View>

      <AnimatedView style={[styles.content, animatedStyle]}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: currentAccent }]}>
            {eyebrow}
          </Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
          <View style={styles.stepIndicatorWrapper}>
            <StepIndicator
              currentStep={stepNumber}
              accentColor={currentAccent}
            />
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
    backgroundColor: COLORS.neutral100,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.06,
    top: -50,
    right: -80,
  },
  blob2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -60,
    top: undefined,
    right: undefined,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  eyebrow: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.065,
    color: "#1A1A1A",
    marginBottom: 8,
    lineHeight: SIZES.width * 0.075,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    lineHeight: 20,
    marginBottom: 8,
  },
  stepIndicatorWrapper: {
    marginTop: 4,
    marginBottom: 8,
  },
  body: {
    flex: 1,
  },
});

export default StepScreenWrapper;
