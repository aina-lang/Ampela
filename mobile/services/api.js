import * as FileSystem from "expo-file-system/legacy";
import { clearCache } from "@/services/localCache";
import i18n from "@/constants/i18n";
import { sessionState } from "@/legendstate/AmpelaStates";

/**
 * Client HTTP de l'API Ampela (NestJS). L'URL se règle avec la variable
 * EXPO_PUBLIC_API_URL (fichier .env à la racine de `mobile/`), sinon on
 * utilise le serveur de production.
 */
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://ampela.178-104-61-143.sslip.io"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const NETWORK_ERROR = () => i18n.t("networkError");

/** Message lisible renvoyé par NestJS (string ou tableau de validation). */
const readMessage = (body, fallback) => {
  const message = body?.message;
  if (Array.isArray(message)) return message.join("\n");
  if (typeof message === "string" && message) return message;
  return fallback;
};

/**
 * Appel générique : JSON par défaut, FormData accepté tel quel, jeton
 * ajouté automatiquement. Une 401 sur une route protégée vide la session.
 */
export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = { Accept: "application/json" };
  const token = sessionState.token.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  } catch (error) {
    throw new ApiError(NETWORK_ERROR(), 0, error);
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = text;
  }

  if (!response.ok) {
    if (response.status === 401 && auth && token) {
      // Jeton expiré ou révoqué : on repasse en mode hors compte.
      clearSession();
    }
    throw new ApiError(
      readMessage(data, `Erreur serveur (${response.status})`),
      response.status,
      data
    );
  }
  return data;
}

export const apiGet = (path, options) => api(path, { ...options, method: "GET" });
export const apiPost = (path, body, options) =>
  api(path, { ...options, method: "POST", body });
export const apiPut = (path, body, options) =>
  api(path, { ...options, method: "PUT", body });
export const apiPatch = (path, body, options) =>
  api(path, { ...options, method: "PATCH", body });
export const apiDelete = (path, options) =>
  api(path, { ...options, method: "DELETE" });

/**
 * Envoi multipart par le module natif d'Expo : `fetch` + FormData échoue
 * sur Android (« Network request failed ») avant même d'atteindre le réseau.
 * Renvoie le JSON de l'API (`{ url, name, size, mime }`).
 */
async function uploadMultipart(path, uri, name, type) {
  const token = sessionState.token.get();
  let result;
  try {
    result = await FileSystem.uploadAsync(`${API_URL}${path}`, uri, {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "file",
      mimeType: type,
      parameters: { name },
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error) {
    throw new ApiError(NETWORK_ERROR(), 0, error);
  }
  let data = null;
  try {
    data = result.body ? JSON.parse(result.body) : null;
  } catch (_) {
    data = result.body;
  }
  if (result.status < 200 || result.status >= 300) {
    if (result.status === 401 && token) clearSession();
    throw new ApiError(
      readMessage(data, `Erreur serveur (${result.status})`),
      result.status,
      data
    );
  }
  return data;
}

/**
 * Envoie un document ou un enregistrement audio local et renvoie
 * `{ url, name, size, mime }`.
 */
export async function uploadFile(uri, name, type) {
  return uploadMultipart(
    "/uploads/file",
    uri,
    name || uri.split("/").pop() || "fichier",
    type || "application/octet-stream"
  );
}

/** Envoie une image locale (uri expo-image-picker) et renvoie son URL. */
export async function uploadImage(uri) {
  const name = uri.split("/").pop() || "image.jpg";
  const ext = (name.split(".").pop() || "jpg").toLowerCase();
  const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const result = await uploadMultipart("/uploads", uri, name, type);
  return result.url;
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/** Utilisatrice connectée (ou null). Remplace `auth.currentUser`. */
export const getCurrentUser = () => sessionState.user.get() ?? null;

export const isSignedIn = () => !!sessionState.token.get();

export const setSession = (token, user) => {
  sessionState.set({ token, user });
};

export const updateSessionUser = (patch) => {
  const current = sessionState.user.get();
  if (current) sessionState.user.set({ ...current, ...patch });
};

export const clearSession = () => {
  // Les données en ligne mises en cache appartiennent à la session.
  clearCache();
  sessionState.set({ token: null, user: null });
};

export const signOut = async () => {
  clearSession();
};

/**
 * Suppression définitive du compte cloud (exigence Google Play). Les
 * données locales du téléphone ne sont pas touchées.
 */
export const deleteAccount = async () => {
  await apiDelete("/users/me");
  clearSession();
};

/**
 * Au lancement : si un jeton est stocké, on rafraîchit le profil. Une 401
 * vide la session ; une erreur réseau laisse la session telle quelle
 * (mode hors ligne).
 */
export async function restoreSession() {
  if (!sessionState.token.get()) return null;
  try {
    const user = await apiGet("/auth/me");
    if (user) sessionState.user.set(user);
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    return sessionState.user.get();
  }
}
