import { initializeApp } from "firebase/app";
import { collection, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";  
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Metro (with react-native condition) will resolve these to
// @firebase/auth/dist/rn/index.js — the correct RN bundle.
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

export const firebaseConfig = {

  apiKey: "AIzaSyDxgP48Xeq0cpstyFRVCMj-HNLt_TzgbKk",

  authDomain: "ampela-bf90b.firebaseapp.com",

  projectId: "ampela-bf90b",

  storageBucket: "ampela-bf90b.firebasestorage.app",

  messagingSenderId: "242239893948",

  appId: "1:242239893948:web:9a3d828cf8e68c5bb5fbb9",

  measurementId: "G-2TXSXFMGSD"

};


// 2. Initialiser l'application principale
const app = initializeApp(firebaseConfig);

export const database = getFirestore(app);

// 4. Initialisation de l'authentification avec la persistance physique
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const usersRef = collection(database, "users");
export const roomsRef = collection(database, "rooms");
export const storage = getStorage(app);
 export const realtimeDatabase = getDatabase(app);
