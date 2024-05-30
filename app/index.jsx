import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Redirect } from "expo-router";
import { db, initializeDatabase } from "@/services/database";

SplashScreen.preventAutoHideAsync();

let initialRouteName = "discovery";

initializeDatabase();

export default function Index() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Regular: require("../assets/fonts/WorkSans-Regular.ttf"),
    Medium: require("../assets/fonts/WorkSans-Medium.ttf"),
    SBold: require("../assets/fonts/WorkSans-SemiBold.ttf"),
    Bold: require("../assets/fonts/WorkSans-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <Redirect href={`${initialRouteName ?? "main"}`} />;
}
