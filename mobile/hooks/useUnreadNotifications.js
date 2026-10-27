import { useEffect, useState } from "react";
import { useSelector } from "@legendapp/state/react";
import { sessionState } from "@/legendstate/AmpelaStates";
import { unreadNotificationsCount } from "@/services/notificationsAPI";
import { subscribeToMessageEvents } from "@/services/messagesAPI";

// Compteur partagé entre les en-têtes des onglets.
let unread = 0;
let subscribers = [];
const setUnread = (value) => {
  unread = value;
  subscribers.forEach((fn) => fn(value));
};

/** Décrémente / remet à zéro après lecture dans l'écran Notifications. */
export const setUnreadNotifications = setUnread;

/**
 * Nombre de notifications non lues : rafraîchi à la connexion, puis
 * incrémenté en direct à chaque `notification:new` reçu par le socket.
 */
export const useUnreadNotifications = () => {
  const signedIn = useSelector(() => !!sessionState.token.get());
  const [value, setValue] = useState(unread);

  useEffect(() => {
    subscribers.push(setValue);
    return () => {
      subscribers = subscribers.filter((fn) => fn !== setValue);
    };
  }, []);

  useEffect(() => {
    if (!signedIn) {
      setUnread(0);
      return;
    }
    unreadNotificationsCount()
      .then(({ count }) => setUnread(count))
      .catch(() => {});
    return subscribeToMessageEvents((event) => {
      if (event === "notification:new") setUnread(unread + 1);
    });
  }, [signedIn]);

  return value;
};
