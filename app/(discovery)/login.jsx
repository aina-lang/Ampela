import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES } from "@/constants";
import { auth, database } from "@/services/firebaseConfig";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ModernButton from "@/components/ModernButton";
import {
  MeshBackground,
  DiscoveryHeader,
  DiscoveryInput,
  useDiscoveryTheme,
  DISCOVERY_RADIUS,
} from "@/components/discovery";

const Login = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useSelector(() => preferenceState.get());
  const {
    accentColor,
    accentColorDisabled,
    surface,
  } = useDiscoveryTheme();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLoginEmailChange = (text) => {
    setLoginEmail(text);
    if (!text) {
      setLoginEmailError("Veuillez saisir votre adresse e-mail");
    } else if (!validateEmail(text)) {
      setLoginEmailError("Veuillez saisir une adresse e-mail valide");
    } else {
      setLoginEmailError("");
    }
  };

  const handleLoginPasswordChange = (text) => {
    setLoginPassword(text);
    if (!text) {
      setLoginPasswordError("Veuillez saisir votre mot de passe");
    } else {
      setLoginPasswordError("");
    }
  };

  const isFormValid =
    loginEmail.length > 0 &&
    loginPassword.length > 0 &&
    !loginEmailError &&
    !loginPasswordError;

  const handleLogin = async () => {
    if (!isFormValid) return;
    setLoginError("");
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      const userDocRef = doc(database, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setLoginError("Compte introuvable. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error.message);
      setLoginError("Email ou mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: surface }]}>
      <MeshBackground color={accentColor} surfaceColor={surface} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DiscoveryHeader
            eyebrow="Bienvenue"
            title="Synchroniser ou commencer"
            subtitle="Avec un compte, vos données sont synchronisées. Sans compte, elles restent sur votre appareil."
            accentColor={accentColor}
          />

          <View style={styles.formWrapper}>
            <DiscoveryInput
              icon={<Ionicons name="mail" size={20} color="#9E9E9E" />}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={loginEmail}
              onChangeText={handleLoginEmailChange}
              error={loginEmailError}
              containerStyle={styles.inputSpacing}
              backgroundColor={COLORS.neutral100}
              borderColor={accentColor}
            />

            <DiscoveryInput
              icon={<Ionicons name="lock-closed" size={20} color="#9E9E9E" />}
              placeholder="Mot de passe"
              secureTextEntry={!showPassword}
              value={loginPassword}
              onChangeText={handleLoginPasswordChange}
              error={loginPasswordError}
              rightIcon={
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#9E9E9E"
                />
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
              backgroundColor={COLORS.neutral100}
              borderColor={accentColor}
            />

            {!!loginError && <Text style={styles.formError}>{loginError}</Text>}

            <ModernButton
              title="Récupérer mes données"
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
              loading={isLoading}
              accentColor={accentColor}
              accentColorDisabled={accentColorDisabled}
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity
              style={[
                styles.newUserButton,
                { borderColor: accentColor },
              ]}
              onPress={() => router.push("/(discovery)/username")}
              activeOpacity={0.7}
            >
              <Text style={[styles.newUserButtonText, { color: accentColor }]}>
                Je suis nouvelle
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 10,
    paddingTop: 20,
  },
  formWrapper: {
    gap: 16,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  formError: {
    color: "#E24C4C",
    fontSize: SIZES.small,
    textAlign: "center",
    marginVertical: 8,
    fontFamily: "SBold",
  },
  signupRow: {
    alignItems: "center",
    marginTop: 24,
  },
  signupText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    marginBottom: 8,
  },
  signupLink: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
  },
  newUserButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DISCOVERY_RADIUS.md,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  newUserButtonText: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    letterSpacing: 0.3,
  },
});

export default Login;
