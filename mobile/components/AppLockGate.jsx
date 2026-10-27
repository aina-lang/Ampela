import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/ui";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { COLORS, SIZES } from "@/constants";
import { useDiscoveryTheme } from "@/components/discovery";

// Ouvrir la galerie, un sélecteur de fichiers ou une demande de permission
// met l'app en arrière-plan un instant : on ne verrouille qu'après un vrai
// passage en arrière-plan (GRACE_MS) et jamais pendant une suspension
// demandée par l'écran qui lance le sélecteur.
const GRACE_MS = 15 * 1000;
let suspendedUntil = 0;

/** À appeler juste avant d'ouvrir un sélecteur (photo, fichier, micro). */
export const suspendAppLock = (ms = 2 * 60 * 1000) => {
  suspendedUntil = Date.now() + ms;
};
export const resumeAppLock = () => {
  suspendedUntil = 0;
};

/**
 * Verrouille l'app derrière l'authentification de l'appareil
 * (empreinte / visage, avec repli automatique sur le schéma ou le PIN).
 * Actif uniquement si l'utilisatrice a activé l'option dans les réglages.
 */
const AppLockGate = ({ children }) => {
  const { appLockEnabled } = useSelector(() => preferenceState.get());
  const { accentColor, accentContainer } = useDiscoveryTheme();
  const [locked, setLocked] = useState(!!appLockEnabled);
  const authInProgress = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const backgroundedAt = useRef(null);

  const unlock = useCallback(async () => {
    if (authInProgress.current) return;
    authInProgress.current = true;
    try {
      const level = await LocalAuthentication.getEnrolledLevelAsync();
      if (level === LocalAuthentication.SecurityLevel.NONE) {
        // Aucun verrouillage configuré sur l'appareil : on ne bloque pas.
        setLocked(false);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Déverrouillez Ampela",
        cancelLabel: "Annuler",
      });
      if (result.success) {
        setLocked(false);
      }
    } catch (error) {
      console.error("App lock error:", error);
    } finally {
      authInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    if (!appLockEnabled) {
      // Déféré pour ne pas déclencher de setState synchrone dans l'effet.
      const timer = setTimeout(() => setLocked(false), 0);
      return () => clearTimeout(timer);
    }

    const subscription = AppState.addEventListener("change", (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;
      if (prev === "active" && nextState.match(/inactive|background/)) {
        backgroundedAt.current = Date.now();
        return;
      }
      if (nextState === "active" && backgroundedAt.current) {
        const away = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        const suspended = Date.now() < suspendedUntil;
        // Re-verrouille après un vrai passage en arrière-plan uniquement.
        if (!suspended && away >= GRACE_MS) setLocked(true);
      }
    });

    return () => subscription.remove();
  }, [appLockEnabled]);

  useEffect(() => {
    if (!locked || !appLockEnabled) return;
    // Lance l'invite biométrique juste après l'affichage de l'écran
    // verrouillé.
    const timer = setTimeout(unlock, 0);
    return () => clearTimeout(timer);
  }, [locked, appLockEnabled, unlock]);

  if (!locked || !appLockEnabled) {
    return children;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: accentContainer }]}>
        <Ionicons name="lock-closed" size={40} color={accentColor} />
      </View>
      <Text style={styles.title}>Application verrouillée</Text>
      <Text style={styles.subtitle}>
        Utilisez votre empreinte, votre visage ou le schéma de votre téléphone
        pour continuer.
      </Text>
      <PrimaryButton
        title="Déverrouiller"
        onPress={unlock}
        icon={<Ionicons name="finger-print" size={20} color="#FFFFFF" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral100,
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    width: "100%",
    fontFamily: "Bold",
    fontSize: SIZES.large,
    lineHeight: SIZES.large * 1.3,
    color: "#433C47",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    width: "100%",
    fontFamily: "Regular",
    fontSize: SIZES.small,
    lineHeight: 20,
    color: "#7A7A7A",
    textAlign: "center",
    marginBottom: 32,
  },
});

export default AppLockGate;
