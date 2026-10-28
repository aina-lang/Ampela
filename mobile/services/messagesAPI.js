import { io } from "socket.io-client";
import { API_URL, apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import { sessionState } from "@/legendstate/AmpelaStates";

/** Autres membres avec, pour chacune, le dernier message échangé. */
export const listConversations = () => apiGet("/users");

/** Contacts dont le pseudo ou la spécialité ressemble au motif (fautes tolérées). */
export const searchConversations = (q) => apiGet(`/users?q=${encodeURIComponent(q)}`);

/** Messages avec une utilisatrice, du plus récent au plus ancien. */
export const listMessages = (otherUserId, before) =>
  apiGet(
    `/conversations/${otherUserId}/messages${
      before ? `?before=${encodeURIComponent(before)}` : ""
    }`
  );

/**
 * `payload` : une chaîne (texte) ou un objet
 * `{ text?, attachmentType, attachmentUrl, attachmentName?, attachmentSize?, durationMs? }`.
 */
export const sendMessage = (otherUserId, payload) =>
  apiPost(
    `/conversations/${otherUserId}/messages`,
    typeof payload === "string" ? { text: payload } : payload
  );

/** Recherche dans une conversation (texte ou nom de pièce jointe). */
export const searchMessages = (otherUserId, q) =>
  apiGet(`/conversations/${otherUserId}/messages?q=${encodeURIComponent(q)}`);

/** Médias, documents, vocaux ou liens : type = image | file | audio | link. */
export const listMedia = (otherUserId, type) =>
  apiGet(`/conversations/${otherUserId}/media?type=${type}`);

export const editMessage = (otherUserId, messageId, text) =>
  apiPatch(`/conversations/${otherUserId}/messages/${messageId}`, { text });

export const deleteMessage = (otherUserId, messageId) =>
  apiDelete(`/conversations/${otherUserId}/messages/${messageId}`);

/** J'ai lu les messages reçus de cette utilisatrice. */
export const markConversationRead = (otherUserId) =>
  apiPost(`/conversations/${otherUserId}/read`);

/** Supprime la conversation pour moi seulement. */
export const clearConversation = (otherUserId) =>
  apiDelete(`/conversations/${otherUserId}`);

/** Identifiant du salon entre deux utilisatrices (même règle que l'API). */
export const roomIdFor = (a, b) => [a, b].sort().join("_");

// ---------------------------------------------------------------------------
// Temps réel : une seule connexion socket.io partagée, (re)créée quand le
// jeton change. Les abonnés reçoivent chaque message `message:new`.
// ---------------------------------------------------------------------------

const REALTIME_EVENTS = [
  "message:updated",
  "message:read",
  "notification:new",
  "post:new",
  "post:updated",
  "post:deleted",
  "comment:new",
  "comment:updated",
  "comment:deleted",
];

let socket = null;
let socketToken = null;
const listeners = new Set();
const eventListeners = new Set();

const ensureSocket = () => {
  const token = sessionState.token.get();
  if (!token) {
    disconnectSocket();
    return null;
  }
  if (socket && socketToken === token) return socket;
  disconnectSocket();
  socketToken = token;
  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 2000,
  });
  socket.on("message:new", (message) => {
    listeners.forEach((listener) => listener(message));
  });
  // Messagerie (modification, suppression, accusés), notifications et
  // forum (publications, réactions, commentaires) : relayés tels quels.
  for (const event of REALTIME_EVENTS) {
    socket.on(event, (payload) => {
      eventListeners.forEach((listener) => listener(event, payload));
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = null;
  socketToken = null;
};

/**
 * S'abonne aux nouveaux messages ; renvoie la fonction de désabonnement.
 * La connexion est fermée quand plus personne n'écoute.
 */
export const subscribeToMessages = (listener) => {
  listeners.add(listener);
  ensureSocket();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && eventListeners.size === 0) disconnectSocket();
  };
};

/** S'abonne aux événements `message:updated` et `message:read` : listener(event, payload). */
export const subscribeToMessageEvents = (listener) => {
  eventListeners.add(listener);
  ensureSocket();
  return () => {
    eventListeners.delete(listener);
    if (listeners.size === 0 && eventListeners.size === 0) disconnectSocket();
  };
};
