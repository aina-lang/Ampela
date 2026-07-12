import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "@/constants";
import { auth, database } from "@/services/firebaseConfig";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ModernButton from "@/components/ModernButton";

const login = () => {
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const accentColor = theme === "pink" ? "#FF7575" : "#FE8729";
  const accentColorDisabled = theme === "pink" ? "#FFB5B5" : "#FED4A0";

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

      if (userDoc.exists()) {
      } else {
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.meshBackground}>
            <View style={[styles.blob, { backgroundColor: accentColor }]} />
            <View style={[styles.blob, styles.blob2, { backgroundColor: accentColor }]} />
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.eyebrow, { color: accentColor }]}>Bon retour</Text>
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>
                Connectez-vous pour poser des questions, échanger sur le forum
                et synchroniser vos données.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail" size={20} color="#9E9E9E" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={loginEmail}
                  onChangeText={handleLoginEmailChange}
                />
              </View>
              {!!loginEmailError && (
                <Text style={styles.fieldError}>{loginEmailError}</Text>
              )}

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed" size={20} color="#9E9E9E" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={!showPassword}
                  value={loginPassword}
                  onChangeText={handleLoginPasswordChange}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9E9E9E"
                  />
                </TouchableOpacity>
              </View>
              {!!loginPasswordError && (
                <Text style={styles.fieldError}>{loginPasswordError}</Text>
              )}

              {!!loginError && (
                <Text style={styles.formError}>{loginError}</Text>
              )}

              <ModernButton
                title="Se connecter"
                onPress={handleLogin}
                disabled={!isFormValid || isLoading}
                loading={isLoading}
                accentColor={accentColor}
                accentColorDisabled={accentColorDisabled}
              />
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Pas de compte ?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("username")}
                activeOpacity={0.7}
              >
                <Text style={[styles.signupLink, { color: accentColor }]}> Créer un compte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
  },
  meshBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.05,
    top: -100,
    right: -100,
  },
  blob2: {
    width: 300,
    height: 300,
    bottom: 150,
    left: -100,
    top: undefined,
    right: undefined,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 36,
  },
  eyebrow: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: COLORS.accent500,
    marginBottom: 10,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.09,
    color: "#1A1A1A",
    marginBottom: 12,
    lineHeight: SIZES.width * 0.11,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    lineHeight: 20,
  },
  form: {
    width: "100%",
    gap: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
  },
  eyeButton: {
    padding: 4,
  },
  fieldError: {
    color: "#E24C4C",
    fontSize: SIZES.small - 1,
    marginBottom: 4,
    marginLeft: 4,
    fontFamily: "Regular",
  },
  formError: {
    color: "#E24C4C",
    fontSize: SIZES.small,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "SBold",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  signupText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
  },
  signupLink: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
  },
});

export default login;
