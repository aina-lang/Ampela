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
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useProgress } from "@/hooks/ProgressContext";
import ProgressBar from "./ProgressBar";
import { useSelector } from "@legendapp/state/react";
import { userState } from "@/legendstate/AmpelaStates";

const { width } = Dimensions.get("window");

const AuthContent = () => {
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

  // const { showProgress, hideProgress, isVisible } = useProgress();

  const handleSignUp = async () => {
    console.log(user);
    try {
      // showProgress("Signing Up...");

      // Création de l'utilisateur avec email et mot de passe
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );
      const userFromFirestoreUid = userCredential?.user?.uid;

      // Conversion de l'image de profil en blob
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

      // Référence du stockage Firebase
      const storageRef = ref(storage, `Avatar/${user.username}_avatar`);

      // Téléchargement de l'image de profil
      await uploadBytes(storageRef, blob);
      console.log("Uploaded a blob or file!");

      // Récupération de l'URL de l'image de profil
      const profilePhotoUrl = await getDownloadURL(storageRef);

      // Référence du document utilisateur dans Firestore
      const userDocRef = collection(database, "users");

      // Enregistrement des informations utilisateur dans Firestore
      await addDoc(userDocRef, {
        // password: signupPassword,
        userId: userFromFirestoreUid,
        username: user.username,
        profession: user.profession,
        lastMenstruationDate: user.lastMenstruationDate,
        durationMenstruation: user.durationMenstruation,
        cycleDuration: user.cycleDuration,
        email: signupEmail,
        profileImage: profilePhotoUrl,
      });

      // Réinitialisation des champs de saisie
      setSignupEmail("");
      setSignupPassword("");
      setConfirmPassword("");
      // hideProgress();
    } catch (error) {
      // hideProgress();
      console.error("Erreur lors de l'inscription:", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      // showProgress("Logging In...");

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
        hideProgress();
        // dispatch(setUser(userData));
      } else {
        console.error("No such user document!");
      }

      // hideProgress();
    } catch (error) {
      console.error("Erreur lors de la connexion:", error.message);
      // hideProgress();
      // setLoginError(true);
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
            />
          </View>
          {loginPasswordError && (
            <Text style={{ color: "red" }}>{loginPasswordError}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: loginErrorPresent ? "#e7e5e5" : "#FF7575" },
            ]}
            onPress={handleLogin}
            disabled={loginErrorPresent}
          >
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>
          {loginError && <Text style={{ color: "red" }}>{loginError}</Text>}
          <Text className="text-center py-2">Ou</Text>
          <TouchableOpacity
            style={{
              padding: 15,
              borderRadius: 15,
              backgroundColor: "white",
            }}
            className="shadow-sm shadow-black mb-5"
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
            />
          </View>
          {confirmPasswordError && (
            <Text style={{ color: "red" }}>{confirmPasswordError}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: signupErrorPresent ? "#e7e5e5" : "#FF7575",
              },
            ]}
            onPress={handleSignUp}
            disabled={signupErrorPresent}
          >
            <Text style={styles.buttonText}>S'inscrire</Text>
          </TouchableOpacity>
          <Text className="text-center py-2">Ou</Text>
          <TouchableOpacity
            style={{
              padding: 15,
              borderRadius: 15,
              backgroundColor: "white",
            }}
            className="shadow-sm shadow-black mb-5"
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
