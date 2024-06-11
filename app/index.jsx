import React, { useEffect, useRef, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Redirect } from "expo-router";
import { initializeDatabase, isFirstLaunch } from "@/services/database";
import {
  registerForPushNotificationsAsync,
  scheduleCycleNotifications,
  scheduleNotification,
  schedulePushNotification,
} from "@/utils/notifications";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { updatePreference } from "@/redux/preferenceSlice";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [loaded, setLoaded] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const firstLaunch = await isFirstLaunch();
        setIsFirstTime(firstLaunch.status);

        if (firstLaunch.status) {
          initializeDatabase();
          await AsyncStorage.setItem("user-theme", "pink");
          await AsyncStorage.setItem("user-locale", "fr");
          const preferenceData = {
            theme: "pink",
            language: "fr",
          };
          dispatch(updatePreference(preferenceData));
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

  // scheduleNotification();

  const initialRouteName =
    isFirstTime === null || isFirstTime === true ? "(discovery)" : "(drawer)/(message)";

  return <Redirect href={initialRouteName} />;
}
