import { apiGet, apiPatch, apiPost, setSession, updateSessionUser } from "@/services/api";
import { updateUser } from "@/legendstate/AmpelaStates";
import { userState } from "@/legendstate/AmpelaStates";

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

/** Profil cloud de la professionnelle connectée (null tant que le profil n'est pas complété). */
export async function fetchCloudProfile() {
  const profile = await apiGet("/users/me");
  if (!profile || !profile.username || profile.role !== "doctor") return null;
  return profile;
}

/**
 * Enregistre le profil professionnel : nom affiché, spécialité, photo.
 * Le rôle « doctor » est posé ici : c'est ce qui distingue les comptes
 * de l'application professionnelle sur le backend commun.
 */
export async function saveDoctorProfile({ username, profession, profileImage }) {
  const profile = await apiPatch("/users/me", {
    username,
    profession: profession || null,
    role: "doctor",
    profileImage: profileImage ?? null,
  });
  updateSessionUser(profile);
  updateUser({
    id: profile.id,
    username: profile.username ?? "",
    profession: profile.profession ?? "",
    role: "doctor",
    email: profile.email ?? "",
    profileImage: profile.profileImage ?? null,
  });
  return profile;
}

/** Met à jour le profil cloud après une modification locale (nom, spécialité, photo). */
export async function pushProfileToCloud() {
  const local = userState.get();
  return saveDoctorProfile({
    username: local.username ?? "",
    profession: local.profession ?? "",
    profileImage: local.profileImage ?? null,
  });
}
