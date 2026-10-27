import { observable, when } from "@legendapp/state";
import {
  configureObservablePersistence,
  persistObservable,
} from "@legendapp/state/persist";
import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Persistance locale (AsyncStorage) de tous les states.
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
  appLockEnabled: false,
});

// Rappels configurés par l'utilisatrice, indexés par nom :
// { [nom]: { hour, minute, frequency, enabled, notificationId } }
const reminderState = observable({});

// Session API : jeton JWT + profil cloud de l'utilisatrice connectée.
// Remplace Firebase Auth ; `user` vaut null quand on n'est pas connectée.
const sessionState = observable({
  token: null,
  user: null,
});

const userState = observable({
  id: null,
  username: "",
  profession: "",
  role: "user",
  lastMenstruationDate: null,
  durationMenstruation: null,
  cycleDuration: null,
  email: "",
  profileImage: null,
});

persistObservable(sessionState, {
  local: "session",
});

persistObservable(cycleMenstruelState, {
  local: "cycleMenstruel",
});

persistObservable(preferenceState, {
  local: "preference",
});

persistObservable(reminderState, {
  local: "reminders",
});

const userPersist = persistObservable(userState, {
  local: "user",
});

// Les anciennes versions persistaient le mot de passe en clair dans
// AsyncStorage : on le purge dès que le state local est chargé.
when(userPersist.state.isLoadedLocal, () => {
  if (userState.password.get() !== undefined) {
    userState.password.delete();
  }
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

export const updateReminder = (name, data) => {
  reminderState[name].set((prev) => ({
    ...(prev || {}),
    ...data,
  }));
};

export {
  cycleMenstruelState,
  preferenceState,
  userState,
  reminderState,
  sessionState,
};
