import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Redirect } from "expo-router";
import { initializeDatabase, isFirstLaunch } from "@/services/database";
import { observer } from "@legendapp/state/react";
import { updatePreference } from "@/legendstate/AmpelaStates";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync();

const index = () => {
  const [loaded, setLoaded] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(null);

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Regular: require("../assets/fonts/WorkSans-Regular.ttf"),
    Bold: require("../assets/fonts/WorkSans-Bold.ttf"),
    Medium: require("../assets/fonts/WorkSans-Medium.ttf"),
    SBold: require("../assets/fonts/WorkSans-SemiBold.ttf"),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const firstLaunch = await isFirstLaunch();
        const isFirstTimeLaunch = firstLaunch?.status ?? 1;
        setIsFirstTime(isFirstTimeLaunch);
        // await loadLocale();
        if (isFirstTimeLaunch) {
          await initializeDatabase();
          const preferenceData = {
            theme: "pink",
            language: "fr",
          };
          updatePreference(preferenceData);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, [isFirstTime]);

  useEffect(() => {
    if (fontsLoaded && loaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loaded]);

  const initialRouteName =
    isFirstTime === null || isFirstTime === 1
      ? "(discovery)/"
      : "(discovery)/";

  if (!fontsLoaded || !loaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={30} />
      </View>
    );
  }

  return <Redirect href={initialRouteName} />;
};

export default observer(index);
