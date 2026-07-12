import React from "react";
import { Stack, useNavigation } from "expo-router";
import AppHeader from "@/components/AppHeader";

const _layout = () => {
  const navigation = useNavigation();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: () => (
          <AppHeader
            navigation={navigation}
            title="Article"
            rightIcons={[
              { name: "chatbubble", onPress: () => navigation.navigate("(message)") },
              { name: "notifications-circle", onPress: () => navigation.navigate("(message)") },
            ]}
          />
        ),
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default _layout;
