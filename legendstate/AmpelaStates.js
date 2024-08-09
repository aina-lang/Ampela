// import { observable } from "@legendapp/state";
// import {
//   configureObservablePersistence,
//   persistObservable,
// } from "@legendapp/state/persist";
// import { ObservablePersistFirebase } from "@legendapp/state/persist-plugins/firebase";
// import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { firebaseConfig } from "@/services/firebaseConfig";
// import { initializeApp } from "firebase/app";
// import { getDatabase } from "firebase/database";
// import { getAuth, onAuthStateChanged } from "firebase/auth";

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);
// const auth = getAuth(app);

// // Configure persistence plugins
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
//   lastMenstruationDate: null,
//   durationMenstruation: null,
//   cycleDuration: null,
//   email: "",
//   profileImage: null,
//   onlineImage:null
// });

// const doctorsState = observable([]);

// const configurePersistenceForUser = (userId) => {
//   const configurePersist = (state, localKey, refPath) => {
//     persistObservable(state, {
//       local: localKey,
//       pluginRemote: ObservablePersistFirebase,
//       remote: userId
//         ? {
//             onSetError: (err) => console.error(err),
//             firebase: {
//               refPath: () => refPath,
//               mode: "realtime",
//             },
//           }
//         : null,
//     });
//   };

//   configurePersist(
//     cycleMenstruelState,
//     "cycleMenstruel",
//     `users/${userId}/cycleMenstruel`
//   );
//   configurePersist(preferenceState, "preference", `users/${userId}/preference`);
//   configurePersist(userState, "user", `users/${userId}/user`);
// };

// // Listen for authentication state changes
// onAuthStateChanged(auth, (user) => {
//   configurePersistenceForUser(user?.uid);
// });
// configurePersistenceForUser(null);
// // Functions to update the states
// export const updateCycleMenstruelData = (data) => {
//   cycleMenstruelState.set((prevState) => ({
//     ...prevState,
//     ...data,
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

// // Function to clear AsyncStorage
// export const clearAsyncStorage = async () => {
//   try {
//     await AsyncStorage.clear();
//     console.log("AsyncStorage cleared");
//   } catch (error) {
//     console.error("Failed to clear AsyncStorage:", error);
//   }
// };

// export const fetchUserData = async (userId) => {
//   try {
//     const userRef = ref(database, `users/${userId}`);
//     const snapshot = await get(userRef);
//     if (snapshot.exists()) {
//       userState.set(snapshot.val());
//     } else {
//       console.log("No user data available");
//     }
//   } catch (error) {
//     console.error("Error fetching user data: ", error);
//   }
// };

// export const fetchDoctorsData = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(firestore, "doctors"));
//     const doctors = querySnapshot.docs.map((doc) => doc.data());
//     doctorsState.set(doctors);
//   } catch (error) {
//     console.error("Error fetching doctors data: ", error);
//   }
// };
// // Export states
// export { cycleMenstruelState, preferenceState, userState, doctorsState };

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
import { getDatabase, ref, set, get, remove } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

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
  onlineImage: null,
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

export const updateUser = async (data) => {
  userState.set((prevState) => ({
    ...prevState,
    ...data,
  }));

  console.log(data);
  // Handle profile image update
  if ((data.profileImage && userState.get().profileImage&& auth.currentUser)) {
    console.log(data);
    const oldImageUrl = userState.get().onlineImage;

    // Upload new image to Firebase Storage
    const storagePath = `Avatar/${auth.currentUser.uid}/${Date.now()}`;
    const imageRef = storageRef(storage, storagePath);
    const response = await fetch(data.profileImage);
    const blob = await response.blob();
    await uploadBytes(imageRef, blob);
    const newImageUrl = await getDownloadURL(imageRef);

    console.log(newImageUrl);
    // Delete old image from Firebase Storage
    // if (oldImageUrl) {
    //   const oldImageRef = storageRef(storage, oldImageUrl);
    //   await deleteObject(oldImageRef);
    // }

    // Update user state with the new image URL
    userState.set((prevState) => ({
      ...prevState,
      profileImage: data.profileImage,
      onlineImage: newImageUrl,
    }));

    // Update user data in Firebase Realtime Database
    const userRef = ref(database, `users/${auth.currentUser.uid}/user`);
    await set(userRef, { ...userState.get(), onlineImage: newImageUrl });
  }
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
    if (userId) {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        userState.set(snapshot.val());
      } else {
        console.log("No user data available");
      }
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
