import { apiGet, apiPost, setSession } from "@/services/api";
import { userState, updateUser, cycleMenstruelState, touchCycles } from "@/legendstate/AmpelaStates";
import { syncAll, scheduleSync } from "@/services/sync";

/** Demande l'envoi d'un code à 6 chiffres à l'adresse donnée. */
export async function requestOtp(email) {
  await apiPost("/auth/request-otp", { email }, { auth: false });
}

/**
 * Vérifie le code et ouvre la session (compte créé au besoin).
 * Renvoie l'utilisatrice `{ id, email, username, ... }`.
 */
export async function verifyOtpAndSignIn(email, code) {
  const { accessToken, user } = await apiPost(
    "/auth/verify-otp",
    { email, code },
    { auth: false }
  );
  setSession(accessToken, user);
  return user;
}

/**
 * Profil cloud de l'utilisatrice connectée, ou null si le compte vient
 * d'être créé et n'a pas encore de prénom (onboarding à faire).
 */
export async function fetchCloudProfile() {
  const profile = await apiGet("/users/me");
  if (!profile || !profile.username) return null;
  return profile;
}

/**
 * Première synchronisation depuis un appareil qui possède déjà des données
 * locales (fin de l'onboarding, ou connexion avec un e-mail sans profil
 * cloud) : les données locales sont datées de maintenant pour qu'elles
 * soient bien envoyées, puis tout est synchronisé.
 */
export async function createCloudProfileFromLocal() {
  if (!userState.profileUpdatedAt.get()) updateUser({}, { touch: true });
  if (!cycleMenstruelState.cyclesUpdatedAt.get()) touchCycles();
  await syncAll();
}

/** Après une modification locale : synchronisation groupée en arrière-plan. */
export const pushProfileToCloud = () => {
  scheduleSync();
  return Promise.resolve();
};
