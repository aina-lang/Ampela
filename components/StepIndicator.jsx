import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SIZES, COLORS } from "@/constants";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(View);

const StepIndicator = ({ currentStep, accentColor = "#FF7575" }) => {
  const steps = [
    { label: "Profil", key: "profile" },
    { label: "Cycle", key: "cycle" },
    { label: "Durées", key: "durations" },
  ];

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <View key={step.key} style={styles.stepWrapper}>
            <View style={styles.stepContent}>
              <AnimatedCircle
                style={[
                  styles.circle,
                  {
                    backgroundColor: isCompleted || isCurrent ? accentColor : "#F4F4F4",
                    transform: [{ scale: isCurrent ? 1.12 : 1 }],
                  },
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkText}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.number,
                      { color: isCurrent ? COLORS.neutral100 : "#B0B0B0" },
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </AnimatedCircle>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: stepNumber < currentStep ? accentColor : "#EFEFEF" },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isCompleted || isCurrent ? "#1A1A1A" : "#B0B0B0",
                  fontFamily: isCurrent ? "SBold" : "Regular",
                },
              ]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  stepWrapper: {
    alignItems: "center",
    flex: 1,
  },
  stepContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  checkText: {
    fontSize: 16,
    fontFamily: "Bold",
    color: COLORS.neutral100,
  },
  number: {
    fontSize: 14,
    fontFamily: "SBold",
  },
  line: {
    flex: 1,
    height: 3,
    marginHorizontal: 6,
    borderRadius: 2,
  },
  label: {
    marginTop: 10,
    fontSize: SIZES.xSmall,
    textAlign: "center",
  },
});

export default StepIndicator;
