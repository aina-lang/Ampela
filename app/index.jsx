
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Redirect, useNavigationContainerRef } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { isFirstLaunch, initializeDatabase } from "@/services/database";
import { updatePreference } from "@/legendstate/AmpelaStates";

export { ErrorBoundary } from "expo-router";

async function fetchData(setIsFirstTime, setInitialRouteName, setLoaded) {
  try {
    const firstLaunch = await isFirstLaunch();
    const isFirstTimeLaunch = firstLaunch?.status ?? 1;
    setIsFirstTime(isFirstTimeLaunch);

    if (isFirstTimeLaunch) {
      await initializeDatabase();
      const preferenceData = { theme: "pink", language: "fr" };
      await updatePreference(preferenceData);
    }

    setInitialRouteName(isFirstTimeLaunch ? "(discovery)" : "(drawer)");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoaded(true);
  }
}

export default function Index() {
  const navigation = useNavigationContainerRef();
  const [ready, setReady] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(null);
  const [initialRouteName, setInitialRouteName] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [fontsLoaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Regular: require("../assets/fonts/WorkSans-Regular.ttf"),
    Bold: require("../assets/fonts/WorkSans-Bold.ttf"),
    Medium: require("../assets/fonts/WorkSans-Medium.ttf"),
    SBold: require("../assets/fonts/WorkSans-SemiBold.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    fetchData(setIsFirstTime, setInitialRouteName, setLoaded);
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (navigation?.isReady) {
      setReady(true);
    }
  }, [navigation?.isReady]);

  if (!fontsLoaded || !loaded) {
    return (
      <View>
        <Text>CHARGEMENT ... </Text>
      </View>
    );
  }

  if (ready && initialRouteName) {
    return <Redirect href={initialRouteName} />;
  }

  return (
    <View>
      <Text>CHARGEMENT ... </Text>
    </View>
  );
}
