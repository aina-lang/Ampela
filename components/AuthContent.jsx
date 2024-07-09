import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { COLORS } from "@/constants";
import { auth, database, storage } from "@/services/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useSelector } from "@legendapp/state/react";
import { preferenceState, userState } from "@/legendstate/AmpelaStates";
import { useModal } from "@/hooks/ModalProvider";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  BounceIn,
} from "react-native-reanimated";

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
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const scale = useSharedValue(0);
  const { theme } = useSelector(() => preferenceState.get());
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(scale.value, { damping: 10, stiffness: 200 }) },
      ],
    };
  });
  const flatListRef = useRef(null);

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
      let errorMessage;
      console.log(error.code);
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Adresse e-mail non trouvée";
          break;
        case "auth/invalid-credential":
          errorMessage = "Adresse e-mail non trouvée";
          break;
        case "auth/wrong-password":
          errorMessage = "Mot de passe incorrect";
          break;
        case "auth/invalid-email":
          errorMessage = "Adresse e-mail invalide";
          break;
        case "auth/user-disabled":
          errorMessage = "Ce compte a été désactivé";
          break;
        case "auth/network-request-failed":
          errorMessage = "Problème de connexion réseau";
          break;
        case "auth/too-many-requests":
          errorMessage = "Réessayer plus tard";
          break;
        default:
          errorMessage = "Erreur inconnue, veuillez réessayer";
      }
      setLoginError(errorMessage);
      setModalVisible(true);
    }
    //  finally {
    //   closeModal();
    //   setLoading(false);
    // }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleScrollToIndex = (index) => {
    flatListRef.current.scrollToIndex({ index });
  };

  useEffect(() => {
    setLoginErrorPresent(!loginEmail || !loginPassword);
    setSignupErrorPresent(
      !signupEmail ||
        !signupPassword ||
        !confirmPassword ||
        signupPasswordError ||
        confirmPasswordError
    );
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
            <Text style={styles.errorText}>{loginEmailError}</Text>
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
            <Text style={styles.errorText}>{loginPasswordError}</Text>
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
          {loginError && <Text style={styles.errorText}>{loginError}</Text>}
          <Text style={styles.orText}>Ou</Text>
          <TouchableOpacity
            style={[
              styles.switchButton,
              {
                borderColor:
                  theme === "pink" ? COLORS.accent500 : COLORS.accent800,
              },
            ]}
            onPress={() => handleScrollToIndex(1)}
          >
            <Text
              style={[styles.switchButtonText, { color: COLORS.accent500 }]}
            >
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
            <Text style={styles.errorText}>{signupEmailError}</Text>
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
            <Text style={styles.errorText}>{signupPasswordError}</Text>
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
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
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
          <Text style={styles.orText}>Ou</Text>
          <TouchableOpacity
            style={[
              styles.switchButton,
              {
                borderColor:
                  theme === "pink" ? COLORS.accent500 : COLORS.accent800,
              },
            ]}
            onPress={() => handleScrollToIndex(0)}
          >
            <Text
              style={[
                styles.switchButtonText,
                {
                  color: theme === "pink" ? COLORS.accent500 : COLORS.accent800,
                },
              ]}
            >
              Se connecter
            </Text>
          </TouchableOpacity>
        </>
      ),
    },
  ];

  return (
    <>
      <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
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
      <Modal
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
        transparent
      >
        <View style={styles.modalBackdrop}>
          <Animated.View entering={BounceIn} style={styles.modalContent}>
            <Text style={styles.modalText}>Erreur lors de la connexion:</Text>
            <Text style={styles.modalText}>{loginError}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Fermer</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    width: width - 40,
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
  errorText: {
    color: "red",
    textAlign: "center",
  },
  orText: {
    textAlign: "center",
    paddingVertical: 10,
  },
  switchButton: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 20,
    backgroundColor: "white",
  },
  switchButtonText: {
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    zIndex: 50,
    top: 5,
    right: 5,
    padding: 10,
  },
  modalBackdrop: {
    backgroundColor: "black",
    opacity: 0.4,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#FF7575",
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
  },
});

export default AuthContent;
