import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

/**
 * Route inconnue (par exemple l'URL interne du client de développement
 * « expo-development-client/… » prise pour un chemin) : on renvoie à
 * l'entrée de l'app dès le montage, avec un bouton de secours.
 */
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/"), 50);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirection…</Text>
      <TouchableOpacity onPress={() => router.replace("/")} style={styles.button}>
        <Text style={styles.buttonText}>Ouvrir l’application</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", gap: 16 },
  text: { fontSize: 15, color: "#8E8793" },
  button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, backgroundColor: "#FF7575" },
  buttonText: { color: "#FFFFFF", fontWeight: "600" },
});
