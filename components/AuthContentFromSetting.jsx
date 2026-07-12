import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { auth, database, storage } from "@/services/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  where,
} from "firebase/firestore";
import { useSelector } from "@legendapp/state/react";
import { updateUser, userState, preferenceState } from "@/legendstate/AmpelaStates";

import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { updateUserSqlite } from "@/services/database";
import { uploadCyclesToFirestore, downloadCyclesFromFirestore } from "@/services/sync";
import { query } from "firebase/database";

const { width } = Dimensions.get("window");

const AuthContent = ({ closeModal }) => {
  const user = useSelector(() => userState.get());
  const { theme } = useSelector(() => preferenceState.get());
  const accentColor = theme === "pink" ? "#FF7575" : "#FE8729";
  const accentColorDisabled = theme === "pink" ? "#FFB5B5" : "#FED4A0";
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
  const scale = useSharedValue(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      closeModal();
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

      const usersCollectionRef = collection(database, "users");
      const q = query(
        usersCollectionRef,
        where("userId", "==", userCredential.user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        console.log("User data:", userDoc.data());
        const userData = userDoc.data();
        updateUser({
          id: userCredential.user.uid,
          username: userData.username,
          email: userData.email,
          profileImage: userData.profileImage,
        });

        // Sauvegarder les données dans SQLite
        updateUserSqlite({
          id: userCredential.user.uid,
          username: userData.username,
          email: userData.email,
          profileImage: userData.profileImage,
        });

        await downloadCyclesFromFirestore(userCredential.user.uid);
      } else {
        console.error("No such user document!");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error.message);
    } finally {
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
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={loginEmail}
                  onChangeText={handleLoginEmailChange}
                  editable={!loading}
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
                  editable={!loading}
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

              <TouchableOpacity
                onPress={handleLogin}
                disabled={!isFormValid || loading}
                activeOpacity={0.85}
                style={[
                  styles.loginBtn,
                  { backgroundColor: isFormValid && !loading ? accentColor : accentColorDisabled, shadowColor: isFormValid && !loading ? accentColor : "transparent", elevation: isFormValid && !loading ? 4 : 0 },
                ]}
              >
                {loading ? (
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
        <>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.infoText}>
            Créez un compte pour sauvegarder vos données et échanger sur le forum.
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={signupEmail}
              onChangeText={handleSignupEmailChange}
              editable={!loading}
            />
          </View>
          {!!signupEmailError && (
            <Text style={styles.fieldError}>{signupEmailError}</Text>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={signupPassword}
              onChangeText={handleSignupPasswordChange}
              editable={!loading}
            />
          </View>
          {!!signupPasswordError && (
            <Text style={styles.fieldError}>{signupPasswordError}</Text>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              editable={!loading}
            />
          </View>
          {!!confirmPasswordError && (
            <Text style={styles.fieldError}>{confirmPasswordError}</Text>
          )}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={signupErrorPresent || loading}
            activeOpacity={0.85}
            style={[
              styles.loginBtn,
              { backgroundColor: signupErrorPresent || loading ? accentColorDisabled : accentColor, shadowColor: signupErrorPresent || loading ? "transparent" : accentColor, elevation: signupErrorPresent || loading ? 0 : 4 },
            ]}
          >
            {loading ? (
              <ActivityIndicator
                color={signupErrorPresent || loading ? "#B0B0B0" : "#FFFFFF"}
              />
            ) : (
              <Text
                style={[
                  styles.loginBtnText,
                  { color: signupErrorPresent || loading ? "#B0B0B0" : COLORS.neutral100 },
                ]}
              >
                S'inscrire
              </Text>
            )}
          </TouchableOpacity>
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Déjà un compte ?</Text>
            <TouchableOpacity
              onPress={() => handleScrollToIndex(0)}
              activeOpacity={0.7}
            >
              <Text style={[styles.signupLink, { color: accentColor }]}> Se connecter</Text>
            </TouchableOpacity>
          </View>
        </>
      ),
    },
  ];

  return (
    <View style={{ flex: 1 }}>
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
        contentContainerStyle={{ backgroundColor: "white" }}
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
  pageContainer: {
    width,
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
  },
  infoText: {
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
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
