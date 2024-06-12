import { observable } from "@legendapp/state";
import {
  configureObservablePersistence,
  persistObservable,
} from "@legendapp/state/persist";
import { ObservablePersistFirebase } from "@legendapp/state/persist-plugins/firebase";
import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/services/firebaseConfig";
import { getDatabase } from "firebase/database";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

configureObservablePersistence({
  pluginLocal: ObservablePersistAsyncStorage,
  localOptions: {
    asyncStorage: {
      AsyncStorage,
    },
  },
  pluginRemote: ObservablePersistFirebase,
  // remoteOptions: {
   
  // },
});

const cycleMenstruelState = observable({
  id: null,
  lastMenstruationDate: null,
  cycleDuration: null,
  menstruationDuration: null,
  cyclesData: [],
});

persistObservable(cycleMenstruelState, {
  local: "cycleMenstruel",
  pluginRemote: ObservablePersistFirebase,
  remote: {
    onSetError: (err: unknown) => console.error(err),
    firebase: {
      refPath: () => `cycleMenstruel`,
      mode: "realtime",
    },
  },
});

export const updateCycleMenstruelData = (data: any) => {
  cycleMenstruelState.set((prevState) => ({
    ...prevState,
    cyclesData: data,
  }));
};

const preferenceState = observable({
  theme: "",
  language: "",
});

persistObservable(preferenceState, {
  local: "preference",
  pluginRemote: ObservablePersistFirebase,
  remote: {
    onSetError: (err: unknown) => console.error(err),
    firebase: {
      refPath: () => `preference`,
      mode: "realtime",
    },
  },
});

export const updatePreference = (data: { theme: string; language: string }) => {
  preferenceState.set((prevState) => ({
    ...prevState,
    ...data,
  }));
};

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

persistObservable(userState, {
  local: "user",
  pluginRemote: ObservablePersistFirebase,
  remote: {
    onSetError: (err: unknown) => console.error(err),
    firebase: {
      refPath: () => `user`,
      mode: "realtime",
    },
  },
});

export const updateUser = (data: {
  id: null;
  username: string;
  password: string;
  profession: string;
  lastMenstruationDate: null;
  durationMenstruation: null;
  cycleDuration: null;
  email: string;
  profileImage: null;
}) => {
  userState.set((prevState) => ({
    ...prevState,
    ...data,
  }));
};

export { cycleMenstruelState, preferenceState, userState };
