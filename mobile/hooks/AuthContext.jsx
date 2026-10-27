import { createContext, useContext, useEffect } from "react";
import { useSelector } from "@legendapp/state/react";
import { useNetInfo } from "@react-native-community/netinfo";
import { sessionState } from "@/legendstate/AmpelaStates";
import { restoreSession } from "@/services/api";

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
  // (et on vide la session si le jeton n'est plus valide).
  useEffect(() => {
    if (token && isConnected && isInternetReachable) {
      restoreSession().catch(() => {});
    }
  }, [token, isConnected, isInternetReachable]);

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
