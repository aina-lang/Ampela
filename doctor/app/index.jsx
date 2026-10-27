
import React, { useEffect, useState } from "react";
import { Redirect, useNavigationContainerRef } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { restoreSession, isSignedIn, getCurrentUser } from "@/services/api";
import SplashLoader from "@/components/SplashLoader";

export { ErrorBoundary } from "expo-router";

async function fetchData(setIsFirstTime, setInitialRouteName, setLoaded) {
  try {
    // Session restaurée si possible (hors ligne : on garde le profil connu).
    await restoreSession().catch(() => null);
    const user = getCurrentUser();
    const ready = isSignedIn() && !!user?.username && user?.role === "doctor";
    setIsFirstTime(!ready);
    setInitialRouteName(ready ? "/(drawer)/(main)" : "/(discovery)");
  } catch (error) {
    console.error("Error:", error);
    setInitialRouteName("/(discovery)");
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
    // Attend que le conteneur de navigation soit prêt (vérification
    // asynchrone pour éviter un setState synchrone dans l'effet).
    const timer = setInterval(() => {
      if (navigation?.isReady?.()) {
        setReady(true);
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [navigation]);

  if (!fontsLoaded || !loaded) {
    return <SplashLoader />;
  }

  if (ready && initialRouteName) {
    return <Redirect href={initialRouteName} />;
  }

  return <SplashLoader />;
}
