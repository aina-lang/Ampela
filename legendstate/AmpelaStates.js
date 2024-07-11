// import { observable } from "@legendapp/state";
// import {
//   configureObservablePersistence,
//   persistObservable,
// } from "@legendapp/state/persist";
// import { ObservablePersistFirebase } from "@legendapp/state/persist-plugins/firebase";
// import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { auth, firebaseConfig } from "@/services/firebaseConfig";
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref } from "firebase/database";
// import { onAuthStateChanged } from "firebase/auth";

// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);

// configureObservablePersistence({
//   pluginLocal: ObservablePersistAsyncStorage,
//   localOptions: {
//     asyncStorage: {
//       AsyncStorage,
//     },
//   },
//   pluginRemote: ObservablePersistFirebase,
// });

// const cycleMenstruelState = observable({
//   id: null,
//   lastMenstruationDate: null,
//   cycleDuration: null,
//   menstruationDuration: null,
//   cyclesData: [],
// });

// const preferenceState = observable({
//   theme: "",
//   language: "",
// });

// const userState = observable({
//   id: null,
//   username: "",
//   password: "",
//   profession: "",
//   lastMenstruationDate: null,
//   durationMenstruation: null,
//   cycleDuration: null,
//   email: "",
//   profileImage: null,
// });

// const loadUserData = async (userId) => {
//   const userRef = ref(database, `users/${userId}/`);
//   onValue(
//     userRef,
//     (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         userState.set({
//           ...data.user,
//         });
//       }
//     },
//     {
//       onlyOnce: true,
//     }
//   );
// };

// let stopPersistence;

// const startPersistence = (userId) => {
//   const configurePersist = (state, localKey, refPath) => {
//     return persistObservable(state, {
//       local: localKey,
//       pluginRemote: ObservablePersistFirebase,
//       remote: {
//         onSetError: (err) => console.error(err),
//         firebase: {
//           refPath: () => refPath,
//           mode: "realtime",
//         },
//       },
//     });
//   };

//   stopPersistence = [
//     configurePersist(
//       cycleMenstruelState,
//       "cycleMenstruel",
//       `users/${userId}/cycleMenstruel`
//     ),
//     configurePersist(
//       preferenceState,
//       "preference",
//       `users/${userId}/preference`
//     ),
//     configurePersist(userState, "user", `users/${userId}/user`),
//   ];
// };

// const stopAllPersistence = () => {
//   if (stopPersistence) {
//     stopPersistence.forEach((stop) => stop());
//     stopPersistence = null;
//   }
// };

// // Listen for authentication state changes
// onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     const uid = user.uid;
//     clearAsyncStorage();
//     await syncLocalToRemote(uid); // Sync local to remote first
//     startPersistence(uid); // Start persistence
//     loadUserData(uid); // Load user data
//   } else {
//     stopAllPersistence(); // Stop persistence when user is logged out
//   }
// });
// export const updateCycleMenstruelData = (data) => {
//   cycleMenstruelState.set((prevState) => ({
//     cyclesData: data,
//   }));
// };

// export const updatePreference = (data) => {
//   preferenceState.set((prevState) => ({
//     ...prevState,
//     ...data,
//   }));
// };

// export const updateUser = (data) => {
//   userState.set((prevState) => ({
//     ...prevState,
//     ...data,
//   }));
// };

// export const clearAsyncStorage = async () => {
//   try {
//     await AsyncStorage.clear();
//     console.log("AsyncStorage cleared");
//   } catch (error) {
//     console.error("Failed to clear AsyncStorage:", error);
//   }
// };

// export { cycleMenstruelState, preferenceState, userState };

// // import { observable, destroyObservable } from "@legendapp/state";
// // import {
// //   configureObservablePersistence,
// //   persistObservable,
// // } from "@legendapp/state/persist";
// // import { ObservablePersistFirebase } from "@legendapp/state/persist-plugins/firebase";
// // import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { firebaseConfig } from "@/services/firebaseConfig";
// // import { initializeApp } from "firebase/app";
// // import { getDatabase, ref, onValue, set } from "firebase/database";
// // import { getAuth, onAuthStateChanged } from "firebase/auth";

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // const database = getDatabase(app);
// // const auth = getAuth(app);

// // // Configure persistence plugins
// // configureObservablePersistence({
// //   pluginLocal: ObservablePersistAsyncStorage,
// //   localOptions: {
// //     asyncStorage: {
// //       AsyncStorage,
// //     },
// //   },
// //   pluginRemote: ObservablePersistFirebase,
// // });

// // const cycleMenstruelState = observable({
// //   id: null,
// //   lastMenstruationDate: null,
// //   cycleDuration: null,
// //   menstruationDuration: null,
// //   cyclesData: [],
// // });

// // const preferenceState = observable({
// //   theme: "",
// //   language: "",
// // });

// // const userState = observable({
// //   id: null,
// //   username: "",
// //   lastMenstruationDate: null,
// //   durationMenstruation: null,
// //   cycleDuration: null,
// //   email: "",
// //   profileImage: null,
// // });

// // // Function to load user data from Firebase Realtime Database
// // const loadUserData = async (userId) => {
// //   const userRef = ref(database, `users/${userId}/`);
// //   onValue(
// //     userRef,
// //     (snapshot) => {
// //       const data = snapshot.val();
// //       if (data) {
// //         userState.set({
// //           ...data.user,
// //         });
// //       }
// //     },
// //     {
// //       onlyOnce: true,
// //     }
// //   );
// // };

// // // Function to clear AsyncStorage
// // export const clearAsyncStorage = async () => {
// //   try {
// //     await AsyncStorage.clear();
// //     console.log("AsyncStorage cleared");
// //   } catch (error) {
// //     console.error("Failed to clear AsyncStorage:", error);
// //   }
// // };

// // let stopPersistence;

// // const startPersistence = (userId) => {
// //   const configurePersist = (state, localKey, refPath) => {
// //     return persistObservable(state, {
// //       local: localKey,
// //       pluginRemote: ObservablePersistFirebase,
// //       remote: {
// //         onSetError: (err) => console.error(err),
// //         firebase: {
// //           refPath: () => refPath,
// //           mode: "realtime",
// //         },
// //       },
// //     });
// //   };

// //   stopPersistence = [
// //     configurePersist(cycleMenstruelState, "cycleMenstruel", `users/${userId}/cycleMenstruel`),
// //     configurePersist(preferenceState, "preference", `users/${userId}/preference`),
// //     configurePersist(userState, "user", `users/${userId}/user`),
// //   ];
// // };

// // const stopAllPersistence = () => {
// //   if (stopPersistence) {
// //     stopPersistence.forEach(stop => stop());
// //     stopPersistence = null;
// //   }
// // };

// // // Listen for authentication state changes
// // onAuthStateChanged(auth, async (user) => {
// //   if (user) {
// //     const uid = user.uid;
// //     clearAsyncStorage();
// //     await syncLocalToRemote(uid); // Sync local to remote first
// //     startPersistence(uid); // Start persistence
// //     loadUserData(uid); // Load user data
// //   } else {
// //     stopAllPersistence(); // Stop persistence when user is logged out
// //   }
// // });

// // // Function to sync local data to remote
// // const syncLocalToRemote = async (userId) => {
// //   const cycleMenstruelData = await AsyncStorage.getItem("cycleMenstruel");
// //   if (cycleMenstruelData) {
// //     const cycleMenstruelJson = JSON.parse(cycleMenstruelData);
// //     await set(ref(database, `users/${userId}/cycleMenstruel`), cycleMenstruelJson);
// //   }

// //   const preferenceData = await AsyncStorage.getItem("preference");
// //   if (preferenceData) {
// //     const preferenceJson = JSON.parse(preferenceData);
// //     await set(ref(database, `users/${userId}/preference`), preferenceJson);
// //   }

// //   const userData = await AsyncStorage.getItem("user");
// //   if (userData) {
// //     const userJson = JSON.parse(userData);
// //     await set(ref(database, `users/${userId}/user`), userJson);
// //   }
// // };

// // // Functions to update the states
// // export const updateCycleMenstruelData = (data) => {
// //   cycleMenstruelState.set((prevState) => ({
// //     ...prevState,
// //     cyclesData: data,
// //   }));
// // };

// // export const updatePreference = (data) => {
// //   preferenceState.set((prevState) => ({
// //     ...prevState,
// //     ...data,
// //   }));
// // };

// // export const updateUser = (data) => {
// //   userState.set((prevState) => ({
// //     ...prevState,
// //     ...data,
// //   }));
// // };

// // // Export states
// // export { cycleMenstruelState, preferenceState, userState };

// // import { observable, destroyObservable } from "@legendapp/state";
// // import {
// //   configureObservablePersistence,
// //   persistObservable,
// // } from "@legendapp/state/persist";
// // import { ObservablePersistFirebase } from "@legendapp/state/persist-plugins/firebase";
// // import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { firebaseConfig } from "@/services/firebaseConfig";
// // import { initializeApp } from "firebase/app";
// // import { getDatabase, ref, onValue, set } from "firebase/database";
// // import { getAuth, onAuthStateChanged } from "firebase/auth";

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // const database = getDatabase(app);
// // const auth = getAuth(app);

// // // Configure persistence plugins
// // configureObservablePersistence({
// //   pluginLocal: ObservablePersistAsyncStorage,
// //   localOptions: {
// //     asyncStorage: {
// //       AsyncStorage,
// //     },
// //   },
// //   pluginRemote: ObservablePersistFirebase,
// // });

// // const cycleMenstruelState = observable({
// //   id: null,
// //   lastMenstruationDate: null,
// //   cycleDuration: null,
// //   menstruationDuration: null,
// //   cyclesData: [],
// // });

// // const preferenceState = observable({
// //   theme: "",
// //   language: "",
// // });

// // const userState = observable({
// //   id: null,
// //   username: "",
// //   lastMenstruationDate: null,
// //   durationMenstruation: null,
// //   cycleDuration: null,
// //   email: "",
// //   profileImage: null,
// // });

// // // Function to load user data from Firebase Realtime Database
// // const loadUserData = async (userId) => {
// //   const userRef = ref(database, `users/${userId}/`);

// //   onValue(
// //     userRef,
// //     (snapshot) => {
// //       const data = snapshot.val();
// //       console.log(data);
// //       if (data) {
// //         userState.set({
// //           ...data.user,
// //         });
// //         // preferenceState.set({ ...data.preference });
// //         // cycleMenstruelState.set({ ...data.cycleMenstruel });
// //       }
// //     },
// //     {
// //       onlyOnce: true,
// //     }
// //   );
// // };

// // // Function to clear AsyncStorage
// // export const clearAsyncStorage = async () => {
// //   try {
// //     await AsyncStorage.clear();
// //     console.log("AsyncStorage cleared");
// //   } catch (error) {
// //     console.error("Failed to clear AsyncStorage:", error);
// //   }
// // };

// // // Function to sync local data to remote
// // const syncLocalToRemote = async (userId) => {
// //   const cycleMenstruelData = await AsyncStorage.getItem("cycleMenstruel");
// //   if (cycleMenstruelData) {
// //     const cycleMenstruelJson = JSON.parse(cycleMenstruelData);
// //     await set(
// //       ref(database, `users/${userId}/cycleMenstruel`),
// //       cycleMenstruelJson
// //     );
// //   }

// //   const preferenceData = await AsyncStorage.getItem("preference");
// //   if (preferenceData) {
// //     const preferenceJson = JSON.parse(preferenceData);
// //     await set(ref(database, `users/${userId}/preference`), preferenceJson);
// //   }

// //   const userData = await AsyncStorage.getItem("user");
// //   if (userData) {
// //     const userJson = JSON.parse(userData);
// //     await set(ref(database, `users/${userId}/user`), userJson);
// //   }
// // };

// // let persistedObservables = [];

// // // Function to start persistence for a specific user
// // const startPersistence = (userId) => {
// //   const configurePersist = (state, localKey, refPath) => {
// //     const observableConfig = persistObservable(state, {
// //       local: localKey,
// //       pluginRemote: ObservablePersistFirebase,
// //       remote: {
// //         onSetError: (err) => console.error(err),
// //         firebase: {
// //           refPath: () => refPath,
// //           mode: "realtime",
// //         },
// //       },
// //     });

// //     // Fetch data from remote to sync with local
// //     const dbRef = ref(database, refPath);
// //     onValue(
// //       dbRef,
// //       (snapshot) => {
// //         const remoteData = snapshot.val();
// //         if (remoteData) {
// //           state.set((prevState) => ({
// //             ...prevState,
// //             ...remoteData,
// //           }));
// //         }
// //       },
// //       { onlyOnce: true }
// //     );

// //     return observableConfig;
// //   };

// //   persistedObservables = [
// //     configurePersist(
// //       cycleMenstruelState,
// //       "cycleMenstruel",
// //       `users/${userId}/cycleMenstruel`
// //     ),
// //     configurePersist(
// //       preferenceState,
// //       "preference",
// //       `users/${userId}/preference`
// //     ),
// //     configurePersist(userState, "user", `users/${userId}/user`),
// //   ];
// // };

// // // Function to stop all persistence
// // const stopAllPersistence = () => {
// //   persistedObservables.forEach((obs) => destroyObservable(obs));
// //   persistedObservables = [];
// // };

// // // Listen for authentication state changes
// // onAuthStateChanged(auth, async (user) => {
// //   if (user) {
// //     const uid = user.uid;
// //     clearAsyncStorage();
// //     await syncLocalToRemote(uid); // Sync local to remote first
// //     startPersistence(uid); // Start persistence
// //     loadUserData(uid); // Load user data
// //   } else {
// //     stopAllPersistence(); // Stop persistence when user is logged out
// //   }
// // });

// // // Functions to update the states
// // export const updateCycleMenstruelData = (data) => {
// //   cycleMenstruelState.set((prevState) => ({
// //     ...prevState,
// //     cyclesData: data,
// //   }));
// // };

// // export const updatePreference = (data) => {
// //   preferenceState.set((prevState) => ({
// //     ...prevState,
// //     ...data,
// //   }));
// // };

// // export const updateUser = (data) => {
// //   userState.set((prevState) => ({
// //     ...prevState,
// //     ...data,
// //   }));
// // };

// // // Export states
// // export { cycleMenstruelState, preferenceState, userState };

import { observable } from "@legendapp/state";
import {
  configureObservablePersistence,
  persistObservable,
} from "@legendapp/state/persist";
import { ObservablePersistFirebase } from "@legendapp/state/persist-plugins/firebase";
import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseConfig } from "@/services/firebaseConfig";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Configure persistence plugins
configureObservablePersistence({
  pluginLocal: ObservablePersistAsyncStorage,
  localOptions: {
    asyncStorage: {
      AsyncStorage,
    },
  },
  pluginRemote: ObservablePersistFirebase,
});

const cycleMenstruelState = observable({
  id: null,
  lastMenstruationDate: null,
  cycleDuration: null,
  menstruationDuration: null,
  cyclesData: [],
});

const preferenceState = observable({
  theme: "",
  language: "",
});

const userState = observable({
  id: null,
  username: "",
  lastMenstruationDate: null,
  durationMenstruation: null,
  cycleDuration: null,
  email: "",
  profileImage: null,
});

const doctorsState = observable([]);


const configurePersistenceForUser = (userId) => {
  const configurePersist = (state, localKey, refPath) => {
    persistObservable(state, {
      local: localKey,
      pluginRemote: ObservablePersistFirebase,
      remote: userId
        ? {
            onSetError: (err) => console.error(err),
            firebase: {
              refPath: () => refPath,
              mode: "realtime",
            },
          }
        : null,
    });
  };

  configurePersist(
    cycleMenstruelState,
    "cycleMenstruel",
    `users/${userId}/cycleMenstruel`
  );
  configurePersist(preferenceState, "preference", `users/${userId}/preference`);
  configurePersist(userState, "user", `users/${userId}/user`);
};

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  configurePersistenceForUser(user?.uid);
});
configurePersistenceForUser(null);
// Functions to update the states
export const updateCycleMenstruelData = (data) => {
  cycleMenstruelState.set((prevState) => ({
    ...prevState,
    ...data,
  }));
};

export const updatePreference = (data) => {
  preferenceState.set((prevState) => ({
    ...prevState,
    ...data,
  }));
};

export const updateUser = (data) => {
  userState.set((prevState) => ({
    ...prevState,
    ...data,
  }));
};

// Function to clear AsyncStorage
export const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage cleared");
  } catch (error) {
    console.error("Failed to clear AsyncStorage:", error);
  }
};

export const fetchUserData = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      userState.set(snapshot.val());
    } else {
      console.log("No user data available");
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
  }
};

export const fetchDoctorsData = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, "doctors"));
    const doctors = querySnapshot.docs.map((doc) => doc.data());
    doctorsState.set(doctors);
  } catch (error) {
    console.error("Error fetching doctors data: ", error);
  }
};
// Export states
export { cycleMenstruelState, preferenceState, userState, doctorsState };
