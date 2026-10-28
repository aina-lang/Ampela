import { createContext, useContext, useEffect } from "react";
import { AppState } from "react-native";
import { useSelector } from "@legendapp/state/react";
import { useNetInfo } from "@react-native-community/netinfo";
import { sessionState } from "@/legendstate/AmpelaStates";
import { restoreSession } from "@/services/api";
import { syncAll, scheduleSync, SYNC_INTERVAL_MS } from "@/services/sync";
import { flushOutbox } from "@/services/outbox";

export const AuthContext = createContext();

/**
 * Expose la session API (jeton + profil) aux écrans. `user` et
 * `userProfile` pointent sur le même objet `{ id, email, username, ... }`
 * pour rester compatibles avec les écrans existants.
 */
export const AuthContextProvider = ({ children }) => {
  const user = useSelector(() => sessionState.user.get());
  const token = useSelector(() => sessionState.token.get());
  const { isConnected, isInternetReachable } = useNetInfo();

  // Dès qu'on a du réseau et un jeton stocké, on rafraîchit le profil
  // (et on vide la session si le jeton n'est plus valide), puis on
  // synchronise. Le retour en ligne relance ce même effet : les
  // modifications faites hors ligne partent alors d'elles-mêmes.
  useEffect(() => {
    if (token && isConnected && isInternetReachable) {
      restoreSession()
        .then((user) => (user ? Promise.all([syncAll(), flushOutbox()]) : null))
        .catch(() => {});
    }
  }, [token, isConnected, isInternetReachable]);

  // Synchronisation automatique en arrière-plan : au retour de l'app au
  // premier plan et périodiquement tant qu'elle est ouverte.
  useEffect(() => {
    if (!token) return undefined;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        scheduleSync(500);
        flushOutbox().catch(() => undefined);
      }
    });
    const interval = setInterval(() => scheduleSync(0), SYNC_INTERVAL_MS);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user: token ? user : null,
        userProfile: token ? user : null,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
