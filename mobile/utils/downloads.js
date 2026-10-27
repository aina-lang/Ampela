import { Platform, Linking } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { preferenceState, updatePreference } from "@/legendstate/AmpelaStates";
import { toast } from "@/components/ui";

const { StorageAccessFramework } = FileSystem;

/** Nom de fichier sûr (sans chemin ni caractères interdits). */
const safeName = (name, fallback) =>
  (name || fallback).replace(/[\\/:*?"<>|]+/g, "_").slice(0, 120);

/**
 * Dossier de téléchargement choisi une fois par l'utilisatrice (SAF Android),
 * mémorisé dans les préférences ; redemandé si l'accès a été perdu.
 */
const getDownloadDir = async (forceAsk = false) => {
  const saved = preferenceState.get().downloadDirUri;
  if (saved && !forceAsk) return saved;
  const perm = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!perm.granted) return null;
  updatePreference({ downloadDirUri: perm.directoryUri });
  return perm.directoryUri;
};

/**
 * Télécharge une pièce jointe (image, document, vocal) sur l'appareil.
 * Android : copie dans le dossier choisi (ex. Téléchargements).
 * iOS : ouverture dans Safari, qui propose l'enregistrement.
 * Renvoie true si le fichier a été enregistré.
 */
export const downloadToDevice = async (url, name, mime = "application/octet-stream") => {
  const fileName = safeName(name, url.split("/").pop() || "fichier");
  if (Platform.OS !== "android") {
    await Linking.openURL(url);
    return false;
  }
  toast.info("Téléchargement…");
  const tmp = `${FileSystem.cacheDirectory}dl-${Date.now()}-${fileName}`;
  const { uri, status } = await FileSystem.downloadAsync(url, tmp);
  if (status && (status < 200 || status >= 300)) {
    throw new Error("Fichier introuvable sur le serveur.");
  }
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

  const write = async (dirUri) => {
    const target = await StorageAccessFramework.createFileAsync(dirUri, fileName, mime);
    await FileSystem.writeAsStringAsync(target, base64, { encoding: FileSystem.EncodingType.Base64 });
  };

  let dirUri = await getDownloadDir();
  if (!dirUri) {
    toast.warning("Choisissez un dossier pour enregistrer le fichier.");
    return false;
  }
  try {
    await write(dirUri);
  } catch (_error) {
    // Dossier supprimé ou accès révoqué : on redemande une fois.
    dirUri = await getDownloadDir(true);
    if (!dirUri) return false;
    await write(dirUri);
  }
  FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
  toast.success(`« ${fileName} » enregistré.`);
  return true;
};
