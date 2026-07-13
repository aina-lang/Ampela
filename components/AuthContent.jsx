import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { auth, database, storage } from "@/services/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useSelector } from "@legendapp/state/react";
import { userState, preferenceState } from "@/legendstate/AmpelaStates";
import { useModal } from "@/hooks/ModalProvider";
import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import ModernButton from "@/components/ModernButton";
import DiscoveryInput from "@/components/discovery/DiscoveryInput";
import { useDiscoveryTheme } from "@/components/discovery";

const AuthContent = () => {
  const user = useSelector(() => userState.get());
  const { theme } = useSelector(() => preferenceState.get());
  const { accentColor, accentColorDisabled, surface } = useDiscoveryTheme();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [signupEmailError, setSignupEmailError] = useState("");
  const [signupPasswordError, setSignupPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loginErrorPresent, setLoginErrorPresent] = useState(false);
  const [signupErrorPresent, setSignupErrorPresent] = useState(false);
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const scale = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(scale.value, { damping: 10, stiffness: 200 }) },
      ],
    };
  });

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

  const handleSignupEmailChange = (text) => {
    setSignupEmail(text);
    if (!text) {
      setSignupEmailError("Veuillez saisir votre adresse e-mail");
    } else if (!validateEmail(text)) {
      setSignupEmailError("Veuillez saisir une adresse e-mail valide");
    } else {
      setSignupEmailError("");
    }
  };

  const handleSignupPasswordChange = (text) => {
    setSignupPassword(text);
    if (!text) {
      setSignupPasswordError("Veuillez saisir votre mot de passe");
    } else if (!validatePassword(text)) {
      setSignupPasswordError(
        "Le mot de passe doit contenir au moins 8 caractères, inclure au moins une majuscule, une minuscule et un chiffre"
      );
    } else {
      setSignupPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (!text) {
      setConfirmPasswordError("Veuillez confirmer votre mot de passe");
    } else if (text !== signupPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );
      const userFromFirestoreUid = userCredential?.user?.uid;

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", user.profileImage, true);
        xhr.send(null);
      });

      const storageRef = ref(storage, `Avatar/${user.username}_avatar`);
      await uploadBytes(storageRef, blob);

      const profilePhotoUrl = await getDownloadURL(storageRef);

      const userDocRef = collection(database, "users");
      await addDoc(userDocRef, {
        userId: userFromFirestoreUid,
        username: user.username,
        profession: user.profession,
        lastMenstruationDate: user.lastMenstruationDate,
        durationMenstruation: user.durationMenstruation,
        cycleDuration: user.cycleDuration,
        email: signupEmail,
        profileImage: profilePhotoUrl,
      });

      await uploadCyclesToFirestore(userFromFirestoreUid);

      setSignupEmail("");
      setSignupPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );

      const userDocRef = doc(database, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data:", userData);
      } else {
        console.error("No such user document!");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error.message);
    } finally {
      closeModal();
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const flatListRef = useRef(null);

  const handleScrollToIndex = (index) => {
    flatListRef.current.scrollToIndex({ index });
  };

  const isFormValid =
    loginEmail.length > 0 &&
    loginPassword.length > 0 &&
    !loginEmailError &&
    !loginPasswordError;

  useEffect(() => {
    setLoginErrorPresent(!isFormValid);

    if (
      !signupEmail ||
      !signupPassword ||
      !confirmPassword ||
      signupPasswordError ||
      confirmPasswordError
    ) {
      setSignupErrorPresent(true);
    } else {
      setSignupErrorPresent(false);
    }
  }, [
    loginEmail,
    loginPassword,
    loginEmailError,
    loginPasswordError,
    signupEmail,
    signupPassword,
    confirmPassword,
    signupPasswordError,
    confirmPasswordError,
  ]);

  const pages = [
    {
      key: "1",
      title: "Connexion",
      content: (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={[styles.eyebrow, { color: accentColor }]}>Bon retour</Text>
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>
                Connectez-vous pour poser des questions, échanger sur le forum
                et synchroniser vos données.
              </Text>
            </View>

            <View style={styles.form}>
              <DiscoveryInput
                placeholder="Email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={loginEmail}
                onChangeText={handleLoginEmailChange}
                editable={!loading}
                backgroundColor={COLORS.neutral100}
                borderColor={accentColor}
                containerStyle={styles.inputSpacing}
              />
              {!!loginEmailError && (
                <Text style={styles.fieldError}>{loginEmailError}</Text>
              )}

              <DiscoveryInput
                placeholder="Mot de passe"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={!showPassword}
                value={loginPassword}
                onChangeText={handleLoginPasswordChange}
                editable={!loading}
                backgroundColor={COLORS.neutral100}
                borderColor={accentColor}
                containerStyle={styles.inputSpacing}
                rightIcon={
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
                }
              />
              {!!loginPasswordError && (
                <Text style={styles.fieldError}>{loginPasswordError}</Text>
              )}

              {!!loginError && (
                <Text style={styles.formError}>{loginError}</Text>
              )}

              <ModernButton
                title="Se connecter"
                onPress={handleLogin}
                disabled={!isFormValid || loading}
                loading={loading}
                accentColor={accentColor}
                accentColorDisabled={accentColorDisabled}
                style={{ marginTop: 16 }}
              />
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Pas de compte ?</Text>
              <TouchableOpacity
                onPress={() => handleScrollToIndex(1)}
                activeOpacity={0.7}
              >
                <Text style={[styles.signupLink, { color: accentColor }]}> Créer un compte</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ),
    },
    {
      key: "2",
      title: "Inscription",
      content: (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={[styles.eyebrow, { color: accentColor }]}>Inscription</Text>
              <Text style={styles.title}>Créer un compte</Text>
              <Text style={styles.subtitle}>
                Créez un compte pour sauvegarder vos données et échanger sur le forum.
              </Text>
            </View>

            <View style={styles.form}>
              <DiscoveryInput
                placeholder="Email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={signupEmail}
                onChangeText={handleSignupEmailChange}
                editable={!loading}
                backgroundColor={COLORS.neutral100}
                borderColor={accentColor}
                containerStyle={styles.inputSpacing}
              />
              {!!signupEmailError && (
                <Text style={styles.fieldError}>{signupEmailError}</Text>
              )}

              <DiscoveryInput
                placeholder="Mot de passe"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={signupPassword}
                onChangeText={handleSignupPasswordChange}
                editable={!loading}
                backgroundColor={COLORS.neutral100}
                borderColor={accentColor}
                containerStyle={styles.inputSpacing}
              />
              {!!signupPasswordError && (
                <Text style={styles.fieldError}>{signupPasswordError}</Text>
              )}

              <DiscoveryInput
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                editable={!loading}
                backgroundColor={COLORS.neutral100}
                borderColor={accentColor}
                containerStyle={styles.inputSpacing}
              />
              {!!confirmPasswordError && (
                <Text style={styles.fieldError}>{confirmPasswordError}</Text>
              )}

              <ModernButton
                title="S'inscrire"
                onPress={handleSignUp}
                disabled={signupErrorPresent || loading}
                loading={loading}
                accentColor={accentColor}
                accentColorDisabled={accentColorDisabled}
                style={{ marginTop: 16 }}
              />

              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Déjà un compte ?</Text>
                <TouchableOpacity
                  onPress={() => handleScrollToIndex(0)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.signupLink, { color: accentColor }]}> Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.pageContainer}>
            {item.content}
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.closeButton}
        onPress={closeModal}
      >
        <Text style={[styles.closeButtonText, { color: accentColor }]}>Non merci</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    width: SIZES.width,
    padding: 24,
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
  },
  eyebrow: {
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
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    lineHeight: 20,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputSpacing: {
    marginBottom: 4,
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
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
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
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    elevation: 10,
    padding: 8,
  },
  closeButtonText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
});

export default AuthContent;
