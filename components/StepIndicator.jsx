import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SIZES, COLORS } from "@/constants";

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
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: isCompleted || isCurrent ? accentColor : "#F0F0F0",
                    borderColor: isCompleted || isCurrent ? accentColor : "#E0E0E0",
                    transform: isCurrent ? [{ scale: 1.1 }] : [{ scale: 1 }],
                  },
                ]}
              >
                {isCompleted ? (
                  <View style={styles.checkmark}>
                    <Text style={[styles.checkText, { color: COLORS.neutral100 }]}>
                      ✓
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.number,
                      {
                        color: isCurrent ? COLORS.neutral100 : "#B0B0B0",
                        fontFamily: isCurrent ? "SBold" : "Regular",
                      },
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: stepNumber < currentStep ? accentColor : "#E8E8E8",
                    },
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  checkmark: {
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  number: {
    fontSize: 14,
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
