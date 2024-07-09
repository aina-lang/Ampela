import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { COLORS } from "@/constants";
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
import { preferenceState, updateUser, userState } from "@/legendstate/AmpelaStates";

import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { updateUserSqlite } from "@/services/database";
import { query } from "firebase/database";

const { width } = Dimensions.get("window");

const AuthContent = ({ closeModal }) => {
  const user = useSelector(() => userState.get());
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
  const { theme } = useSelector(() => preferenceState.get());
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

  useEffect(() => {
    if (!loginEmail || !loginPassword) {
      setLoginErrorPresent(true);
    } else {
      setLoginErrorPresent(false);
    }

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
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={handleLoginEmailChange}
              editable={!loading}
            />
          </View>
          {loginEmailError && (
            <Text style={{ color: "red" }}>{loginEmailError}</Text>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={handleLoginPasswordChange}
              editable={!loading}
            />
          </View>
          {loginPasswordError && (
            <Text style={{ color: "red" }}>{loginPasswordError}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  loginErrorPresent || loading ? "#e7e5e5" : "#FF7575",
              },
            ]}
            onPress={handleLogin}
            disabled={loginErrorPresent || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Chargement..." : "Se connecter"}
            </Text>
          </TouchableOpacity>
          {loginError && <Text style={{ color: "red" }}>{loginError}</Text>}
          <Text className="text-center py-2">Ou</Text>
          <TouchableOpacity
            style={{
              padding: 15,
              borderRadius: 15,
              backgroundColor: "white",
              borderWidth: 1,
              borderColor:
                theme === "pink" ? COLORS.accent500 : COLORS.accent800,
            }}
            className=" mb-5"
            onPress={() => handleScrollToIndex(1)}
          >
            <Text className="text-center" style={{ color: COLORS.accent500 }}>
              S'inscrire
            </Text>
          </TouchableOpacity>
        </>
      ),
    },
    {
      key: "2",
      title: "Inscription",
      content: (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={handleSignupEmailChange}
              editable={!loading}
            />
          </View>
          {signupEmailError && (
            <Text style={{ color: "red" }}>{signupEmailError}</Text>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={handleSignupPasswordChange}
              editable={!loading}
            />
          </View>
          {signupPasswordError && (
            <Text style={{ color: "red" }}>{signupPasswordError}</Text>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              onChangeText={handleConfirmPasswordChange}
              editable={!loading}
            />
          </View>
          {confirmPasswordError && (
            <Text style={{ color: "red" }}>{confirmPasswordError}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  signupErrorPresent || loading ? "#e7e5e5" : "#FF7575",
              },
            ]}
            onPress={handleSignUp}
            disabled={signupErrorPresent || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Chargement..." : "S'inscrire"}
            </Text>
          </TouchableOpacity>
          <Text className="text-center py-2">Ou</Text>
          <TouchableOpacity
            style={{
              padding: 15,
              borderRadius: 15,
              borderWidth: 1,
              borderColor:
                theme === "pink" ? COLORS.accent500 : COLORS.accent800,
            }}
            className=" mb-5"
            onPress={() => handleScrollToIndex(0)}
          >
            <Text className="text-center" style={{ color: COLORS.accent500 }}>
              Se connecter
            </Text>
          </TouchableOpacity>
        </>
      ),
    },
  ];

  return (
    <>
      <TouchableOpacity
        className="absolute z-50 top-5 right-5"
        onPress={closeModal}
      >
        <Text>Non merci</Text>
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.pageContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.infoText}>
              Si vous voulez poser des questions, commenter ou réagir, et
              envoyer des messages (forum, message privé), veuillez vous
              connecter ou créer un compte. Cela synchronisera également vos
              données.
            </Text>
            {item.content}
          </View>
        )}
        contentContainerStyle={{ backgroundColor: "white" }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    width,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  infoText: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    padding: 10,
    borderRadius: 15,
    overflow: "hidden",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#c0bdbd",
    borderRadius: 15,
    marginVertical: 10,
    width: Math.floor(Dimensions.get("window").width) - 40,
    backgroundColor: "rgb(243 244 246)",
  },
  button: {
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});

export default AuthContent;
