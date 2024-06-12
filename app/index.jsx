import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Redirect } from "expo-router";
import { initializeDatabase, isFirstLaunch } from "@/services/database";
import { observer } from "@legendapp/state/react";
import { updatePreference } from "@/legendstate/AmpelaStates";

SplashScreen.preventAutoHideAsync();

const Index = observer(() => {
  const [loaded, setLoaded] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const firstLaunch = await isFirstLaunch();
        setIsFirstTime(firstLaunch.status);

        if (
          firstLaunch == undefined ||
          firstLaunch.status ||
          firstLaunch.status == null ||
          firstLaunch.status == undefined
        ) {
          initializeDatabase();
          const preferenceData = {
            theme: "pink",
            language: "fr",
          };
          updatePreference(preferenceData);
        }

        setLoaded(true);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        await SplashScreen.hideAsync();
      }
    };
    fetchData();
  }, []);

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Regular: require("../assets/fonts/WorkSans-Regular.ttf"),
    Medium: require("../assets/fonts/WorkSans-Medium.ttf"),
    SBold: require("../assets/fonts/WorkSans-SemiBold.ttf"),
    Bold: require("../assets/fonts/WorkSans-Bold.ttf"),
  });

  if (!fontsLoaded || !loaded) {
    return null;
  }
  const initialRouteName =
    isFirstTime === null || isFirstTime === true
      ? "(discovery)"
      : "(drawer)/(main)";

  return <Redirect href={initialRouteName} />;
});

export default Index;
