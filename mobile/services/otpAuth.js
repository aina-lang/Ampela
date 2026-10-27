import { apiGet, apiPatch, apiPost, setSession } from "@/services/api";
import { userState } from "@/legendstate/AmpelaStates";
import { syncCycles } from "@/services/sync";

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

/** Convertit le profil local (Legend State) en données pour l'API. */
const profileFromLocal = () => {
  const local = userState.get();
  return {
    username: local.username ?? "",
    // Rôle et spécialité : réservés à l'application des professionnelles
    // de santé (même backend) ; l'app Ampela ne les modifie jamais.
    lastMenstruationDate: local.lastMenstruationDate ?? null,
    durationMenstruation: local.durationMenstruation ?? null,
    cycleDuration: local.cycleDuration ?? null,
    profileImage: local.profileImage ?? null,
  };
};

/**
 * Envoie le profil local dans le cloud puis synchronise les cycles. À
 * appeler après la première connexion depuis un appareil qui possède
 * déjà des données locales, ou à la fin de l'onboarding.
 */
export async function createCloudProfileFromLocal() {
  const profile = await apiPatch("/users/me", profileFromLocal());
  await syncCycles();
  return profile;
}

/** Met à jour le profil cloud (si connectée) après une modification locale. */
export async function pushProfileToCloud() {
  return apiPatch("/users/me", profileFromLocal());
}
