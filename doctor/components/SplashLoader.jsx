import React, { useEffect } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { SIZES } from "@/constants";
import { useDiscoveryTheme } from "@/components/discovery";

const ICON_SIZE = 132;

/**
 * Écran de chargement JS qui prend le relais du splash natif, pixel pour
 * pixel : fond blanc et icône de l'app (le splash natif ne peut pas suivre
 * le thème), puis indicateur et texte aux couleurs du thème courant.
 */
const SplashLoader = ({ label = "Chargement…" }) => {
  const { accentColor } = useDiscoveryTheme();

  useEffect(() => {
    // Dès que cet écran est monté, on retire le splash natif.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Image source={require("../assets/images/splash-icon.png")} style={styles.icon} resizeMode="contain" />
      </View>
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={accentColor} />
        <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: ICON_SIZE * 2,
    height: ICON_SIZE * 2,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 56,
    gap: 12,
  },
  label: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    letterSpacing: 0.4,
  },
});

export default SplashLoader;
