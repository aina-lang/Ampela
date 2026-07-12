import React from "react";
import { Stack, useNavigation } from "expo-router";
import { COLORS } from "@/constants";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import AppHeader from "@/components/AppHeader";

const _layout = () => {
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const bgColor = theme === "pink" ? COLORS.accent400 : COLORS.neutral280;
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: () => (
          <AppHeader
            navigation={navigation}
            title=""
            showBack
            bgColor={bgColor}
            noRound
            noShadow
          />
        ),
      }}
    ></Stack>
  );
};

export default _layout;
