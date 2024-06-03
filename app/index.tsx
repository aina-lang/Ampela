// import React, { useEffect, useState } from "react";
// import * as SplashScreen from "expo-splash-screen";
// import { useFonts } from "expo-font";
// import { Redirect } from "expo-router";
// import { initializeDatabase, isFirstLaunch } from "@/services/database";

// SplashScreen.preventAutoHideAsync();

// initializeDatabase();

// export default function Index() {
//   const [loaded, setLoaded] = useState(false);
//   const [isFirstTime, setIsFirstTime] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const firstLaunch = await isFirstLaunch();
//         setIsFirstTime(firstLaunch.status);
//         setLoaded(true);
//         SplashScreen.hideAsync();
//       } catch (error) {
//         console.error("Error:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const [fontsLoaded] = useFonts({
//     SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
//     Regular: require("../assets/fonts/WorkSans-Regular.ttf"),
//     Medium: require("../assets/fonts/WorkSans-Medium.ttf"),
//     SBold: require("../assets/fonts/WorkSans-SemiBold.ttf"),
//     Bold: require("../assets/fonts/WorkSans-Bold.ttf"),
//   });

//   if (!fontsLoaded || !loaded) {
//     return null;
//   }

//   const initialRouteName =
//     isFirstTime === null || isFirstTime === 1
//       ? "(discovery)"
//       : "(drawer)/(message)/";

//   return <Redirect href={initialRouteName} />;
// }

import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Redirect } from "expo-router";
import { initializeDatabase, isFirstLaunch } from "@/services/database";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [loaded, setLoaded] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const firstLaunch = await isFirstLaunch();
        setIsFirstTime(firstLaunch.status);

        if (firstLaunch.status) {
          initializeDatabase();
        }

        setLoaded(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("Error:", error);
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
    isFirstTime === null || isFirstTime === true ? "(discovery)" : "(drawer)/";

  return <Redirect href={initialRouteName} />;
}
