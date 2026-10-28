import * as FileSystem from "expo-file-system/legacy";

/**
 * Photo de profil « local d'abord » : l'image choisie est copiée dans le
 * dossier de l'application (le cache du sélecteur peut être purgé), et
 * c'est ce fichier qui est enregistré tout de suite. L'envoi au serveur
 * se fait ensuite, en arrière-plan, par la synchronisation.
 */
export const persistLocalPhoto = async (uri) => {
  if (!uri || !FileSystem.documentDirectory) return uri;
  const ext = (uri.split(".").pop() || "jpg").split("?")[0].toLowerCase();
  const dest = `${FileSystem.documentDirectory}avatar-${Date.now()}.${ext}`;
  try {
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch (error) {
    console.log("Avatar copy failed, keeping picker uri:", error?.message ?? error);
    return uri;
  }
};
