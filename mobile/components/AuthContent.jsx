import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useModal } from "@/hooks/ModalProvider";
import {
  PrimaryButton,
  GhostButton,
  Input,
  OtpInput,
  DecorativeBlobs,
  toast,
} from "@/components/ui";
import { useDiscoveryTheme, DiscoveryHeader } from "@/components/discovery";
import {
  requestOtp,
  verifyOtpAndSignIn,
  fetchCloudProfile,
  createCloudProfileFromLocal,
} from "@/services/otpAuth";
import { syncCycles } from "@/services/sync";

/**
 * Connexion sans mot de passe : e-mail → code à 6 chiffres reçu par
 * mail → connectée. Le compte est créé automatiquement au premier code
 * validé ; l'e-mail EST l'identité.
 */
const AuthContent = ({ closeModal: closeModalProp }) => {
  const insets = useSafeAreaInsets();
  const { accentColor, surface } = useDiscoveryTheme();
  const { closeModal: closeModalFromContext } = useModal();
  // Utilisable dans le modal global (ModalProvider) comme dans un
  // <Modal> local via la prop closeModal.
  const closeModal = closeModalProp || closeModalFromContext;

  const [step, setStep] = useState("email"); // "email" | "code"
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Compte à rebours avant de pouvoir renvoyer un code.
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
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleVerify = async (submitted) => {
    const otp = typeof submitted === "string" ? submitted : code;
    if (otp.length !== 6) {
      setCodeError("Le code contient 6 chiffres");
      return;
    }
    setLoading(true);
    try {
      await verifyOtpAndSignIn(email.trim(), otp);

      // Profil cloud existant → synchronise ; sinon crée-le depuis les
      // données locales de cet appareil.
      const profile = await fetchCloudProfile();
      try {
        if (profile) {
          await syncCycles();
        } else {
          await createCloudProfileFromLocal();
        }
      } catch (syncError) {
        console.error("Sync failed after sign-in:", syncError);
      }

      toast.success("Connexion réussie, vos données sont synchronisées !");
      closeModal();
    } catch (error) {
      setCodeError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === "email" ? (
            <>
              <DiscoveryHeader
                eyebrow="Votre compte"
                title="Juste votre e-mail"
                subtitle="Pas de mot de passe : nous vous envoyons un code à 6 chiffres pour vous connecter et synchroniser vos données."
                accentColor={accentColor}
              />

              <View style={styles.centerZone}>
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Recevoir mon code</Text>

                  <Input
                    icon={<Ionicons name="mail" size={20} color="#A9A4AE" />}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={handleEmailChange}
                    error={emailError}
                    editable={!loading}
                  />

                  <PrimaryButton
                    title="Recevoir un code"
                    onPress={handleSendCode}
                    disabled={!email || !!emailError || loading}
                    loading={loading}
                    style={{ marginTop: 20 }}
                  />
                </View>

                <Text style={styles.hint}>
                  Le même e-mail sur un autre téléphone retrouve vos données.
                </Text>
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

                  <OtpInput
                    value={code}
                    onChange={(text) => {
                      setCode(text);
                      setCodeError("");
                    }}
                    error={codeError}
                    editable={!loading}
                    onComplete={handleVerify}
                  />

                  <PrimaryButton
                    title="Valider"
                    onPress={handleVerify}
                    disabled={code.length !== 6 || loading}
                    loading={loading}
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
                  disabled={resendIn > 0 || loading}
                  onPress={handleSendCode}
                  style={{ marginTop: 18 }}
                />
                <GhostButton
                  title="Changer d'e-mail"
                  size="sm"
                  onPress={() => setStep("email")}
                  disabled={loading}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity
        onPress={closeModal}
        activeOpacity={0.7}
        style={[styles.skipButton, { top: insets.top + 12 }]}
      >
        <Text style={styles.skipText}>Ignorer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SIZES.width,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
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
  hint: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    textAlign: "center",
    marginTop: 18,
    paddingHorizontal: 12,
    lineHeight: 20,
  },
  // Même style que le bouton « Ignorer » de l'onboarding.
  // (pas d'elevation : sur Android elle dessinerait une ombre portée)
  skipButton: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  skipText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "SBold",
  },
});

export default AuthContent;
