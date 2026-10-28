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
import { setFirstLaunchFalse } from "@/services/database";
import { syncAll } from "@/services/sync";
import {
  requestOtp,
  verifyOtpAndSignIn,
  fetchCloudProfile,
} from "@/services/otpAuth";
import { useRouter } from "expo-router";
import i18n from "@/constants/i18n";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { Ionicons } from "@expo/vector-icons";
import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  Input,
  OtpInput,
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
  // Suit la langue choisie (re-rendu des textes traduits).
  useSelector(() => preferenceState.language.get());

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
      setEmailError(i18n.t("loginEmailRequired"));
    } else if (!validateEmail(text)) {
      setEmailError(i18n.t("loginEmailInvalid"));
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
      toast.info(i18n.t("loginCodeSent", { email: email.trim() }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (submitted) => {
    const otp = typeof submitted === "string" ? submitted : code;
    if (otp.length !== 6) {
      setCodeError(i18n.t("loginCodeLength"));
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtpAndSignIn(email.trim(), otp);
      const profile = await fetchCloudProfile();

      if (profile) {
        // Compte existant : profil, préférences, cycles et rappels sont
        // restaurés sur cet appareil (le plus récent gagne).
        await syncAll();
        await setFirstLaunchFalse();
        toast.success(i18n.t("loginWelcomeBack"));
        router.replace("/(drawer)/(main)");
      } else {
        // Nouvel e-mail : on crée le profil via l'onboarding, en restant
        // connectée pour que tout se synchronise à la fin.
        toast.info(i18n.t("loginCreateProfile"));
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
                eyebrow={i18n.t("loginEyebrow")}
                title={i18n.t("loginTitle")}
                subtitle={i18n.t("loginSubtitle")}
                accentColor={accentColor}
              />

              <View style={styles.centerZone}>
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>{i18n.t("loginFormTitle")}</Text>

                  <Input
                    icon={<Ionicons name="mail" size={20} color="#A9A4AE" />}
                    placeholder={i18n.t("loginEmailPlaceholder")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={handleEmailChange}
                    error={emailError}
                    editable={!isLoading}
                  />

                  <PrimaryButton
                    title={i18n.t("loginReceiveCode")}
                    onPress={handleSendCode}
                    disabled={!email || !!emailError || isLoading}
                    loading={isLoading}
                    style={{ marginTop: 20 }}
                  />
                </View>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{i18n.t("loginOr")}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <SecondaryButton
                  title={i18n.t("loginNew")}
                  onPress={() => router.push("/(discovery)/username")}
                />
              </View>
            </>
          ) : (
            <>
              <DiscoveryHeader
                eyebrow={i18n.t("loginVerifyEyebrow")}
                title={i18n.t("loginVerifyTitle")}
                subtitle={i18n.t("loginVerifySubtitle", { email: email.trim() })}
                accentColor={accentColor}
              />

              <View style={styles.centerZone}>
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>{i18n.t("loginCodeLabel")}</Text>

                  <OtpInput
                    value={code}
                    onChange={(text) => {
                      setCode(text);
                      setCodeError("");
                    }}
                    error={codeError}
                    editable={!isLoading}
                    onComplete={handleVerify}
                  />

                  <PrimaryButton
                    title={i18n.t("loginValidate")}
                    onPress={handleVerify}
                    disabled={code.length !== 6 || isLoading}
                    loading={isLoading}
                    style={{ marginTop: 20 }}
                  />
                </View>

                <GhostButton
                  title={
                    resendIn > 0
                      ? i18n.t("loginResendIn", { seconds: resendIn })
                      : i18n.t("loginResend")
                  }
                  size="sm"
                  disabled={resendIn > 0 || isLoading}
                  onPress={handleSendCode}
                  style={{ marginTop: 18 }}
                />
                <GhostButton
                  title={i18n.t("loginChangeEmail")}
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
