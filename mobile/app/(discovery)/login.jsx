import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SIZES } from "@/constants";
import { updateUser } from "@/legendstate/AmpelaStates";
import { addUser, getUser, setFirstLaunchFalse } from "@/services/database";
import { downloadCycles } from "@/services/sync";
import {
  requestOtp,
  verifyOtpAndSignIn,
  fetchCloudProfile,
} from "@/services/otpAuth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  Input,
  DecorativeBlobs,
  toast,
} from "@/components/ui";
import {
  MeshBackground,
  DiscoveryHeader,
  useDiscoveryTheme,
} from "@/components/discovery";

/**
 * Connexion sans mot de passe au premier lancement : e-mail → code à 6
 * chiffres → restauration des données du compte. Si l'e-mail n'a encore
 * aucune donnée, on enchaîne sur l'onboarding en restant connectée.
 */
const Login = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accentColor, surface } = useDiscoveryTheme();

  const [step, setStep] = useState("email"); // "email" | "code"
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (!text) {
      setEmailError("Veuillez saisir votre adresse e-mail");
    } else if (!validateEmail(text)) {
      setEmailError("Veuillez saisir une adresse e-mail valide");
    } else {
      setEmailError("");
    }
  };

  const handleSendCode = async () => {
    if (!email || emailError) return;
    setIsLoading(true);
    try {
      await requestOtp(email.trim());
      setStep("code");
      setCode("");
      setCodeError("");
      setResendIn(60);
      toast.info(`Code envoyé à ${email.trim()}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const restoreProfileLocally = async (profile) => {
    const localUser = await getUser();
    if (!localUser) {
      await addUser(
        profile.username ?? "",
        profile.profession ?? null,
        profile.lastMenstruationDate ?? null,
        profile.durationMenstruation ?? null,
        profile.cycleDuration ?? null,
        profile.email ?? email.trim(),
        profile.profileImage ?? null
      );
    }
    updateUser({
      id: 1,
      username: profile.username ?? "",
      profession: profile.profession ?? "",
      lastMenstruationDate: profile.lastMenstruationDate ?? null,
      durationMenstruation: profile.durationMenstruation ?? null,
      cycleDuration: profile.cycleDuration ?? null,
      email: profile.email ?? email.trim(),
      profileImage: profile.profileImage ?? null,
    });
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setCodeError("Le code contient 6 chiffres");
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtpAndSignIn(email.trim(), code);
      const profile = await fetchCloudProfile();

      if (profile) {
        // Compte existant : on restaure tout sur cet appareil.
        await restoreProfileLocally(profile);
        try {
          await downloadCycles();
        } catch (syncError) {
          console.error("Cycle download failed:", syncError);
        }
        await setFirstLaunchFalse();
        toast.success("Bon retour ! Vos données ont été restaurées.");
        router.replace("/(drawer)/(main)");
      } else {
        // Nouvel e-mail : on crée le profil via l'onboarding, en restant
        // connectée pour que tout se synchronise à la fin.
        toast.info("Bienvenue ! Créons votre profil.");
        router.replace("/(discovery)/username");
      }
    } catch (error) {
      setCodeError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <MeshBackground color={accentColor} surfaceColor={surface} />
      <DecorativeBlobs />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === "email" ? (
            <>
              <DiscoveryHeader
                eyebrow="Bienvenue"
                title="Synchroniser ou commencer"
                subtitle="Pas de mot de passe : votre e-mail suffit. Un code à 6 chiffres vous connecte et retrouve vos données sur n'importe quel téléphone."
                accentColor={accentColor}
              />

              <View style={styles.centerZone}>
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Déjà un compte ?</Text>

                  <Input
                    icon={<Ionicons name="mail" size={20} color="#A9A4AE" />}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={handleEmailChange}
                    error={emailError}
                    editable={!isLoading}
                  />

                  <PrimaryButton
                    title="Recevoir un code"
                    onPress={handleSendCode}
                    disabled={!email || !!emailError || isLoading}
                    loading={isLoading}
                    style={{ marginTop: 20 }}
                  />
                </View>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                <SecondaryButton
                  title="Je suis nouvelle"
                  onPress={() => router.push("/(discovery)/username")}
                />
              </View>
            </>
          ) : (
            <>
              <DiscoveryHeader
                eyebrow="Vérification"
                title="Entrez votre code"
                subtitle={`Un code à 6 chiffres a été envoyé à ${email.trim()}. Il expire dans 10 minutes.`}
                accentColor={accentColor}
              />

              <View style={styles.centerZone}>
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Code de connexion</Text>

                  <Input
                    icon={
                      <Ionicons name="key-outline" size={20} color="#A9A4AE" />
                    }
                    placeholder="••••••"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={(text) => {
                      setCode(text.replace(/\D/g, ""));
                      setCodeError("");
                    }}
                    error={codeError}
                    editable={!isLoading}
                    inputStyle={styles.codeInput}
                  />

                  <PrimaryButton
                    title="Valider"
                    onPress={handleVerify}
                    disabled={code.length !== 6 || isLoading}
                    loading={isLoading}
                    style={{ marginTop: 20 }}
                  />
                </View>

                <GhostButton
                  title={
                    resendIn > 0
                      ? `Renvoyer le code (${resendIn}s)`
                      : "Renvoyer le code"
                  }
                  size="sm"
                  disabled={resendIn > 0 || isLoading}
                  onPress={handleSendCode}
                  style={{ marginTop: 18 }}
                />
                <GhostButton
                  title="Changer d'e-mail"
                  size="sm"
                  onPress={() => setStep("email")}
                  disabled={isLoading}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  centerZone: {
    flex: 1,
    justifyContent: "center",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    paddingTop: 26,
  },
  formTitle: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#433C47",
    marginBottom: 18,
    textAlign: "center",
  },
  codeInput: {
    fontFamily: "Bold",
    fontSize: SIZES.large,
    letterSpacing: 10,
    textAlign: "center",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
    paddingHorizontal: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  dividerText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
  },
});

export default Login;
