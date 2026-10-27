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
import {
  requestOtp,
  verifyOtpAndSignIn,
  fetchCloudProfile,
} from "@/services/otpAuth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  PrimaryButton,
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
 * Connexion sans mot de passe : e-mail → code à 6 chiffres. Un compte sans
 * profil professionnel enchaîne sur l'écran de profil.
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
        toast.success(`Bon retour, ${profile.username} !`);
        router.replace("/(drawer)/(main)");
      } else {
        // Nouveau compte (ou compte sans profil professionnel) : on le complète.
        toast.info("Bienvenue ! Complétons votre profil professionnel.");
        router.replace("/(discovery)/profile");
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
                eyebrow="Espace professionnel"
                title="Connectez-vous"
                subtitle="Pas de mot de passe : votre e-mail professionnel suffit. Un code à 6 chiffres vous connecte sur n'importe quel téléphone."
                accentColor={accentColor}
              />

              <View style={styles.centerZone}>
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Votre e-mail</Text>

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
});

export default Login;
