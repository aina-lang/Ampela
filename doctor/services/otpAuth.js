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

/** Profil cloud de la professionnelle connectée (null tant qu'elle n'est pas vérifiée avec un profil). */
export async function fetchCloudProfile() {
  const profile = await apiGet("/users/me");
  if (!profile || !profile.username) return null;
  if (profile.role !== "doctor" || profile.verificationStatus !== "verified") return null;
  return profile;
}

/** Statut d'accès : `{ isDoctor, invited, hasProfile, role, verificationStatus }`. */
export const fetchDoctorStatus = () => apiGet("/doctors/status");

const mirrorProfile = (profile) => {
  updateSessionUser(profile);
  updateUser({
    id: profile.id,
    username: profile.username ?? "",
    profession: profile.profession ?? "",
    role: profile.role ?? "user",
    verificationStatus: profile.verificationStatus ?? "none",
    email: profile.email ?? "",
    profileImage: profile.profileImage ?? null,
  });
  return profile;
};

/**
 * Inscription avec code d'invitation : le serveur accorde le rôle
 * « doctor » vérifié et enregistre nom, spécialité, établissement…
 */
export async function registerDoctor({ code, username, profession, fullName, institution, licenseNumber, profileImage }) {
  const profile = await apiPost("/doctors/register", {
    code,
    username,
    profession,
    fullName: fullName || null,
    institution: institution || null,
    licenseNumber: licenseNumber || null,
    profileImage: profileImage ?? null,
  });
  return mirrorProfile(profile);
}

/** Met à jour le profil (nom affiché, spécialité, photo). Le rôle reste géré par le serveur. */
export async function saveDoctorProfile({ username, profession, profileImage }) {
  const profile = await apiPatch("/users/me", {
    username,
    profession: profession || null,
    profileImage: profileImage ?? null,
  });
  return mirrorProfile(profile);
}

/** Alias conservé pour les écrans existants. */
export async function pushProfileToCloud() {
  const local = userState.get();
  return saveDoctorProfile({
    username: local.username ?? "",
    profession: local.profession ?? "",
    profileImage: local.profileImage ?? null,
  });
}
