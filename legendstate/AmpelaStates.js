// Firebase MUST be initialized before anything else.
// This side-effect import guarantees initializeApp() runs first.
import "@/services/firebaseConfig";

import { observable } from "@legendapp/state";
import {
  configureObservablePersistence,
  persistObservable,
} from "@legendapp/state/persist";
import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure global persistence — LOCAL ONLY (AsyncStorage).
// Do NOT add pluginRemote here: ObservablePersistFirebase calls getAuth()
// which calls getApp() immediately, before any user is authenticated.
configureObservablePersistence({
  pluginLocal: ObservablePersistAsyncStorage,
  localOptions: {
    asyncStorage: {
      AsyncStorage,
    },
  },
});

// Define observables
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
  password: "",
  profession: "",
  lastMenstruationDate: null,
  durationMenstruation: null,
  cycleDuration: null,
  email: "",
  profileImage: null,
});

// Persistence — LOCAL ONLY at startup.
// To add Firebase remote sync after login, call persistObservable again
// with a pluginRemote config once you have a confirmed auth user.
persistObservable(cycleMenstruelState, {
  local: "cycleMenstruel",
});

persistObservable(preferenceState, {
  local: "preference",
});

persistObservable(userState, {
  local: "user",
});

// Update functions
export const updateCycleMenstruelData = (data) => {
  cycleMenstruelState.set((prevState) => ({
    ...prevState,
    cyclesData: data,
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

export { cycleMenstruelState, preferenceState, userState };
