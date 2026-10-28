import { observable } from "@legendapp/state";
import { persistObservable } from "@legendapp/state/persist";
import { useSelector } from "@legendapp/state/react";

/**
 * Cache local « local d'abord » des données en ligne (forum, messages,
 * notifications) : chaque écran affiche d'abord la dernière version
 * connue, puis la rafraîchit en arrière-plan quand le réseau le permet.
 * Persisté dans AsyncStorage avec le reste des états.
 */
const cacheState = observable({});
persistObservable(cacheState, { local: "localCache" });

export const readCache = (key) => cacheState[key].get()?.value ?? null;

export const writeCache = (key, value) => {
  cacheState[key].set({ value, at: Date.now() });
};

export const clearCache = (prefix) => {
  const all = cacheState.get() || {};
  for (const key of Object.keys(all)) {
    if (!prefix || key.startsWith(prefix)) cacheState[key].delete();
  }
};

/** Valeur en cache, réactive (se remplit dès que le stockage est chargé). */
export const useCache = (key) => useSelector(() => cacheState[key].get()?.value ?? null);
