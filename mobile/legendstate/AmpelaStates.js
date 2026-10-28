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
  // Horodatage (ISO) de la dernière modification du jeu de cycles sur cet
  // appareil ; comparé à celui du cloud pour ne jamais écraser plus récent.
  cyclesUpdatedAt: null,
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
//
// Option `touch` : la modification vient de l'utilisatrice sur cet
// appareil → on date la donnée (ISO) pour la synchronisation « le plus
// récent gagne ». Sans `touch` (chargement local, application d'une
// version cloud), l'horodatage n'est pas modifié ; `updatedAt` permet de
// reprendre celui du cloud.
const nowIso = () => new Date().toISOString();

export const updateCycleMenstruelData = (data, { touch = false, updatedAt } = {}) => {
  cycleMenstruelState.set((prevState) => ({
    ...prevState,
    cyclesData: data,
    ...(touch ? { cyclesUpdatedAt: nowIso() } : {}),
    ...(updatedAt !== undefined ? { cyclesUpdatedAt: updatedAt } : {}),
  }));
};

/** Date le jeu de cycles local (après génération ou recalcul). */
export const touchCycles = () => cycleMenstruelState.cyclesUpdatedAt.set(nowIso());

export const updatePreference = (data, { touch = true } = {}) => {
  preferenceState.set((prevState) => ({
    ...prevState,
    ...data,
    ...(touch ? { preferencesUpdatedAt: nowIso() } : {}),
  }));
};

export const updateUser = (data, { touch = false } = {}) => {
  userState.set((prevState) => ({
    ...prevState,
    ...data,
    ...(touch ? { profileUpdatedAt: nowIso() } : {}),
  }));
};

export const updateReminder = (name, data, { touch = false } = {}) => {
  reminderState[name].set((prev) => ({
    ...(prev || {}),
    ...data,
    ...(touch ? { updatedAt: nowIso() } : {}),
  }));
};

export {
  cycleMenstruelState,
  preferenceState,
  userState,
  reminderState,
  sessionState,
};
