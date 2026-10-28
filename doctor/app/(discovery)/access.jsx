import React from "react";
import { View, Text, StyleSheet, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SIZES } from "@/constants";
import { PrimaryButton, GhostButton, DecorativeBlobs } from "@/components/ui";
import { MeshBackground, DiscoveryHeader, useDiscoveryTheme } from "@/components/discovery";
import { signOut, getCurrentUser } from "@/services/api";

const CONTACT_EMAIL = "merciaaina@gmail.com";

/**
 * Compte connecté mais sans invitation professionnelle : l'accès à
 * Ampela Pro est réservé aux professionnelles invitées par l'équipe.
 */
const AccessScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accentColor, accentContainer, surface } = useDiscoveryTheme();
  const email = getCurrentUser()?.email ?? "";

  const requestAccess = () =>
    Linking.openURL(
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Demande d'accès Ampela Pro")}&body=${encodeURIComponent(
        `Bonjour,\n\nJe souhaite rejoindre Ampela Pro en tant que professionnelle de santé.\n\nE-mail de connexion : ${email}\nNom complet :\nSpécialité :\nÉtablissement :\nNuméro d'ordre (si applicable) :\n\nMerci.`
      )}`
    ).catch(() => {});

  const logout = async () => {
    await signOut();
    router.replace("/(discovery)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <MeshBackground color={accentColor} surfaceColor={surface} />
      <DecorativeBlobs />
      <View style={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        <DiscoveryHeader
          eyebrow="Accès réservé"
          title="Sur invitation uniquement"
          subtitle="Pour garantir aux utilisatrices des réponses de vraies professionnelles de santé, l'accès à Ampela Pro est accordé par l'équipe Ampela."
          accentColor={accentColor}
        />
        <View style={styles.centerZone}>
          <View style={styles.card}>
            <View style={[styles.icon, { backgroundColor: accentContainer }]}>
              <Ionicons name="shield-checkmark-outline" size={30} color={accentColor} />
            </View>
            <Text style={styles.title}>Comment obtenir un accès</Text>
            <Text style={styles.text}>
              {"1. Envoyez-nous votre nom, votre spécialité et votre établissement.\n2. Nous vérifions votre statut professionnel.\n3. Vous recevez un code d'invitation à saisir dans l'app."}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              Connectée avec {email}
            </Text>
            <PrimaryButton title="Demander un accès" onPress={requestAccess} style={{ marginTop: 18 }} />
            <GhostButton
              title="J'ai déjà un code"
              size="sm"
              onPress={() => router.replace("/(discovery)/profile")}
              style={{ marginTop: 10 }}
            />
          </View>
          <GhostButton title="Changer de compte" size="sm" onPress={logout} style={{ marginTop: 16 }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centerZone: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 1,
    color: "#2B2530",
    marginBottom: 10,
  },
  text: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    lineHeight: 21,
    color: "#5C5661",
    alignSelf: "stretch",
  },
  email: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#8E8793",
    marginTop: 14,
  },
});

export default AccessScreen;
