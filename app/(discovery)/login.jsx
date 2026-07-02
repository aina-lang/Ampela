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
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const login = () => {
  const navigation = useNavigation();

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
        // navigation vers l'écran principal à ajouter ici
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Bon retour</Text>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>
              Connectez-vous pour poser des questions, échanger sur le forum
              et synchroniser vos données.
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
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

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
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
                  color="#A0A0A0"
                />
              </TouchableOpacity>
            </View>
            {!!loginPasswordError && (
              <Text style={styles.fieldError}>{loginPasswordError}</Text>
            )}

            {!!loginError && (
              <Text style={styles.formError}>{loginError}</Text>
            )}

            {/* Bouton de connexion — juste sous le formulaire */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.85}
              style={[
                styles.loginBtn,
                { backgroundColor: isFormValid ? "#FF7575" : "#EFEFEF" },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={isFormValid ? "#FFFFFF" : "#B0B0B0"}
                />
              ) : (
                <Text
                  style={[
                    styles.loginBtnText,
                    { color: isFormValid ? COLORS.neutral100 : "#B0B0B0" },
                  ]}
                >
                  Se connecter
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Lien inscription — en bas, séparé */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Pas de compte ?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("username")}
              activeOpacity={0.7}
            >
              <Text style={styles.signupLink}> Créer un compte</Text>
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
    backgroundColor: COLORS.neutral100,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingVertical: 40,
  },
  header: {
    marginBottom: 32,
  },
  eyebrow: {
    color: "#FF7575",
    fontFamily: "SBold",
    fontSize: SIZES.small,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.09,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: "Regular",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
  },
  eyeButton: {
    padding: 6,
  },
  fieldError: {
    color: "#E24C4C",
    fontSize: SIZES.small - 1,
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: "Regular",
  },
  formError: {
    color: "#E24C4C",
    fontSize: SIZES.small,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "SBold",
  },
  loginBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#FF7575",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  loginBtnText: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  signupText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
  },
  signupLink: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#FF7575",
  },
});

export default login;