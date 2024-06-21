import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Redirect } from "expo-router";
import { initializeDatabase, isFirstLaunch } from "@/services/database";
import { observer } from "@legendapp/state/react";
import { updatePreference } from "@/legendstate/AmpelaStates";

SplashScreen.preventAutoHideAsync();

const index = observer(() => {
  const [loaded, setLoaded] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const firstLaunch = await isFirstLaunch();
        const isFirstTimeLaunch = firstLaunch?.status ?? 1;
        setIsFirstTime(isFirstTimeLaunch);

        if (isFirstTimeLaunch) {
          await initializeDatabase();
          const preferenceData = {
            theme: "pink",
            language: "fr",
          };
          await updatePreference(preferenceData);
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

  // console.log(isFirstTime);
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Regular: require("../assets/fonts/WorkSans-Regular.ttf"),
    Medium: require("../assets/fonts/WorkSans-Medium.ttf"),
    SBold: require("../assets/fonts/WorkSans-SemiBold.ttf"),
    Bold: require("../assets/fonts/WorkSans-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded && loaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loaded]);

  if (!fontsLoaded || !loaded) {
    return null;
  }

  const initialRouteName =
    isFirstTime === null || isFirstTime === 1
      ? "(discovery)/index"
      : "(drawer)/(main)";

  return <Redirect href={initialRouteName} />;
});

export default index;

// import React from "react";
// import { StyleSheet, Text, View, Button } from "react-native";
// import * as BackgroundFetch from "expo-background-fetch";
// import * as TaskManager from "expo-task-manager";

// const BACKGROUND_FETCH_TASK = "background-fetch";

// // Define the background fetch task function
// async function backgroundFetchTask() {
//   try {
//     const now = Date.now();
//     console.log(
//       `Got background fetch call at date: ${new Date(now).toISOString()}`
//     );
//     // Simulate fetching data from a server
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     // Be sure to return the successful result type!
//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   } catch (err) {
//     console.error(err);
//     return BackgroundFetch.BackgroundFetchResult.Failed;
//   }
// }

// // Register the task with TaskManager
// TaskManager.defineTask(BACKGROUND_FETCH_TASK, backgroundFetchTask);

// // Register the task
// async function registerBackgroundFetchAsync() {
//   try {
//     await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
//       minimumInterval: 1, // 1 minute for testing, adjust as needed
//       stopOnTerminate: false, // android only
//       startOnBoot: true, // android only
//     });
//     console.log("Task registered");
//   } catch (err) {
//     console.error("Task registration failed:", err);
//   }
// }

// // Unregister the task
// async function unregisterBackgroundFetchAsync() {
//   try {
//     await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
//     console.log("Task unregistered");
//   } catch (err) {
//     console.error("Task unregistration failed:", err);
//   }
// }

// // Manual trigger for testing
// async function triggerBackgroundFetchTask() {
//   console.log("Manually triggering background fetch task");
//   const result = await backgroundFetchTask();
//   console.log(`Manual trigger result: ${result}`);
// }

// export default function BackgroundFetchScreen() {
//   const [isRegistered, setIsRegistered] = React.useState(false);
//   const [status, setStatus] = React.useState(null);

//   React.useEffect(() => {
//     checkStatusAsync();
//   }, []);

//   const checkStatusAsync = async () => {
//     const status = await BackgroundFetch.getStatusAsync();
//     const isRegistered = await TaskManager.isTaskRegisteredAsync(
//       BACKGROUND_FETCH_TASK
//     );
//     setStatus(status);
//     setIsRegistered(isRegistered);
//   };

//   const toggleFetchTask = async () => {
//     if (isRegistered) {
//       await unregisterBackgroundFetchAsync();
//     } else {
//       await registerBackgroundFetchAsync();
//     }

//     checkStatusAsync();
//   };

//   return (
//     <View style={styles.screen}>
//       <View style={styles.textContainer}>
//         <Text>
//           Background fetch status:{" "}
//           <Text style={styles.boldText}>
//             {status !== null
//               ? BackgroundFetch.BackgroundFetchStatus[status]
//               : "Unknown"}
//           </Text>
//         </Text>
//         <Text>
//           Background fetch task name:{" "}
//           <Text style={styles.boldText}>
//             {isRegistered ? BACKGROUND_FETCH_TASK : "Not registered yet!"}
//           </Text>
//         </Text>
//       </View>
//       <Button
//         title={
//           isRegistered
//             ? "Unregister BackgroundFetch task"
//             : "Register BackgroundFetch task"
//         }
//         onPress={toggleFetchTask}
//       />
//       <Button
//         title="Trigger BackgroundFetch task manually"
//         onPress={triggerBackgroundFetchTask}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   textContainer: {
//     margin: 10,
//   },
//   boldText: {
//     fontWeight: "bold",
//   },
// });
// import React, { useEffect, useCallback } from "react";
// import { View, Text, Button, StyleSheet, Platform } from "react-native";
// import BackgroundJob from "react-native-background-actions";

// const sleep = (time) =>
//   new Promise((resolve) => setTimeout(() => resolve(), time));

// const veryIntensiveTask = async (taskDataArguments) => {
//   const { delay } = taskDataArguments;
//   await new Promise(async (resolve) => {
//     for (let i = 0; BackgroundJob.isRunning(); i++) {
//       console.log(i);
//       await sleep(delay);
//     }
//   });
// };

// const options = {
//   taskName: "Example",
//   taskTitle: "ExampleTask title",
//   taskDesc: "ExampleTask description",
//   taskIcon: {
//     name: "ic_launcher",
//     type: "mipmap",
//   },
//   color: "#ff00ff",

//   parameters: {
//     delay: 1000,
//   },
// };

// BackgroundJob.on("expiration", () => {
//   console.log("IOS : i'm eing closed");
// });
// const taskRandom = async (taskData) => {
//   if (Platform.OS == "ios") {
//     console.warn("thIS TASK WILL NOT");
//   }

//   await new Promise(async (resolve) => {
//     const { delay } = taskData;

//     console.log(BackgroundJob.isRunning(), delay);

//     for (let i = 0; BackgroundJob.isRunning(); i++) {
//       console.log("runned ", i);
//       await BackgroundJob.updateNotification({
//         taskDesc: "Runned" + i,
//         progressBar: 2,
//       });

//       await sleep(delay);
//     }
//   });
// };

// const BackgroundTaskComponent = () => {
//   const startBackgroundJob = useCallback(async () => {
//     console.log(BackgroundJob);
//     try {
//       if (BackgroundJob != null) {
//         await BackgroundJob.start(taskRandom, options);
//       }
//     } catch (err) {
//       console.error("Task start failed:", err);
//     }
//   }, []);

//   //   const stopBackgroundJob = useCallback(async () => {
//   //     try {
//   //       await BackgroundJob.stop();
//   //     } catch (err) {
//   //       console.error("Task stop failed:", err);
//   //     }
//   //   }, []);

//   //   useEffect(() => {
//   //     startBackgroundJob();
//   //     return () => {
//   //       stopBackgroundJob();
//   //     };
//   //   }, [startBackgroundJob, stopBackgroundJob]);

//   return (
//     <View style={styles.container}>
//       <Text>Background Task Component</Text>
//       <Button title="Start Background Task" onPress={startBackgroundJob} />
//       {/*   <Button title="Stop Background Task" onPress={stopBackgroundJob} /> */}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default BackgroundTaskComponent;
