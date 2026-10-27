import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { SIZES } from "@/constants";

// Même couleur que le splash natif (app.json → splash.backgroundColor)
// pour que le passage natif → JS soit invisible.
const SPLASH_BACKGROUND = "#FF7575";
const ICON_SIZE = 132;

/**
 * Écran de chargement JS qui prend le relais du splash natif : icône de
 * l'app au centre, indicateur de chargement en bas. Affiché tant que les
 * polices, la base locale et la navigation ne sont pas prêtes.
 */
const SplashLoader = ({ label = "Chargement…" }) => {
  useEffect(() => {
    // Dès que cet écran est monté, on retire le splash natif : il est
    // remplacé pixel pour pixel par celui-ci.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Image
          source={require("../assets/images/logo/logo-1.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FFFFFF" />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BACKGROUND,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 56,
    gap: 12,
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    fontSize: SIZES.small,
    letterSpacing: 0.4,
  },
});

export default SplashLoader;
