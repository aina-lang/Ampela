import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { auth, database } from "@/services/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDocs, collection, query, where } from "firebase/firestore";
import { useSelector } from "@legendapp/state/react";
import {
  clearAsyncStorage,
  preferenceState,
  updateCycleMenstruelData,
  updateUser,
  userState,
} from "@/legendstate/AmpelaStates";
import i18n from "@/constants/i18n";
import { useNavigation } from "expo-router";
import {
  addCyclesToSQLite,
  deleteAllCycles,
  updateUserSqlite,
} from "@/services/database";

import Animated, { BounceIn } from "react-native-reanimated";
import {
  fetchCyclesFromFirebase,
  fetchUserDataFromRealtimeDB,
} from "@/services/firestoreAPI";

const { width } = Dimensions.get("window");

const Login = () => {
  const user = useSelector(() => userState.get());
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [loginErrorPresent, setLoginErrorPresent] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const { theme } = useSelector(() => preferenceState.get());
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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

  // const handleLogin = async () => {
  //   setLoading(true);
  //   await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
  //     .then(async (userCredential) => {
  //       if (!userCredential.user.emailVerified) {
  //         await sendEmailVerification(userCredential.user).then((response) => {
  //           console.log(response);
  //         });
  //         setVerificationModalVisible(true);
  //       } else {
  //         const usersCollectionRef = collection(database, "users");
  //         const q = query(
  //           usersCollectionRef,
  //           where("userId", "==", userCredential.user.uid)
  //         );
  //         const querySnapshot = await getDocs(q);

  //         if (!querySnapshot.empty) {
  //           const userDoc = querySnapshot.docs[0];
  //           console.log("User data:", userDoc.data());
  //           const userData = userDoc.data();
  //           updateUser({
  //             id: userCredential.user.uid,
  //             username: userData.username,
  //             email: userData.email,
  //             profileImage: userData.profileImage,
  //           });
  //           updateUserSqlite({
  //             id: userCredential.user.uid,
  //             username: userData.username,
  //             email: userData.email,
  //             profileImage: userData.profileImage,
  //           });
  //         } else {
  //           const blob = await new Promise((resolve, reject) => {
  //             const xhr = new XMLHttpRequest();
  //             xhr.onload = function () {
  //               resolve(xhr.response);
  //             };
  //             xhr.onerror = function () {
  //               reject(new TypeError("Network request failed"));
  //             };
  //             xhr.responseType = "blob";
  //             xhr.open("GET", user.profileImage, true);
  //             xhr.send(null);
  //           });

  //           const storageRef = ref(storage, `Avatar/${user.username}_avatar`);
  //           await uploadBytes(storageRef, blob);

  //           const profilePhotoUrl = await getDownloadURL(storageRef);

  //           const userDocRef = collection(database, "users");
  //           await addDoc(userDocRef, {
  //             userId: userCredential?.user?.uid,
  //             username: user.username,
  //             profession: user.profession,
  //             lastMenstruationDate: user.lastMenstruationDate,
  //             durationMenstruation: user.durationMenstruation,
  //             cycleDuration: user.cycleDuration,
  //             email: loginEmail,
  //             profileImage: profilePhotoUrl,
  //           });
  //         }

  //         // Delete all existing cycles
  //         await deleteAllCycles();

  //         // Fetch cycles from Firebase Realtime Database
  //         const firebaseCycles = await fetchCyclesFromFirebase();

  //         // Add fetched cycles to SQLite
  //         await addCyclesToSQLite(firebaseCycles);

  //         setLoading(false);
  //         navigation.navigate("(drawer)");
  //       }
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       let errorMessage;
  //       console.log(error);
  //       switch (error.code) {
  //         case "auth/user-not-found":
  //           errorMessage = "Adresse e-mail non trouvée";
  //           break;
  //         case "auth/invalid-credential":
  //           errorMessage = "Vérifier votre identifiants et votre mot de passe ";
  //           break;
  //         case "auth/wrong-password":
  //           errorMessage = "Mot de passe incorrect";
  //           break;
  //         case "auth/invalid-email":
  //           errorMessage = "Adresse e-mail invalide";
  //           break;
  //         case "auth/user-disabled":
  //           errorMessage = "Ce compte a été désactivé";
  //           break;
  //         case "auth/network-request-failed":
  //           errorMessage = "Problème de connexion réseau";
  //           break;
  //         case "auth/too-many-requests":
  //           errorMessage = "Réessayer plus tard";
  //           break;
  //         default:
  //           errorMessage = "Erreur inconnue, veuillez réessayer";
  //       }
  //       setLoginError(errorMessage);
  //       setModalVisible(true);
  //       setLoading(false);
  //     });
  // };

  const handleLogin = async () => {
    setLoading(true);

    try {
      // const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );

      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        setVerificationModalVisible(true);
      } else {
        const userId = userCredential.user.uid;

        // Récupérer les données utilisateur depuis Firebase Realtime Database
        const userData = await fetchUserDataFromRealtimeDB(userId);

        if (userData) {
          const { username, email, profileImage } = userData.user;

          // Mettre à jour les données utilisateur dans l'état et SQLite
          updateUser({
            id: userId,
            username: username,
            email: email,
            profileImage: profileImage,
          });

          updateUserSqlite({
            id: userId,
            username: username,
            email: email,
            profileImage: profileImage,
          });

          // Supprimer tous les cycles existants
          deleteAllCycles();

          // Récupérer les cycles depuis Firebase et mettre à jour l'état et SQLite
          const firebaseCycles = await fetchCyclesFromFirebase(userId);
          await updateCycleMenstruelData(firebaseCycles.cyclesData);
          await addCyclesToSQLite(firebaseCycles.cyclesData);
        } else {
          // Si les données utilisateur ne sont pas disponibles, gérer la création d'un nouvel utilisateur
          const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              resolve(xhr.response);
            };
            xhr.onerror = function () {
              reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", userCredential.user.photoURL, true);
            xhr.send(null);
          });

          const storageRef = ref(
            storage,
            `Avatar/${userCredential.user.displayName}_avatar`
          );
          await uploadBytes(storageRef, blob);

          const profilePhotoUrl = await getDownloadURL(storageRef);

          const userDocRef = collection(database, "users");
          await addDoc(userDocRef, {
            userId: userCredential.user.uid,
            username: userCredential.user.displayName,
            email: loginEmail,
            profileImage: profilePhotoUrl,
          });

          // Supprimer tous les cycles existants et récupérer les cycles depuis Firebase
          deleteAllCycles();
          const firebaseCycles = await fetchCyclesFromFirebase(
            userCredential.user.uid
          );
          await updateCycleMenstruelData(firebaseCycles.cyclesData);
          await addCyclesToSQLite(firebaseCycles.cyclesData);
        }

        // Navigation vers la route principale après la connexion réussie
        navigation.navigate("(drawer)");
      }
    } catch (error) {
      // Gestion des erreurs de connexion
      console.log(error);
      let errorMessage;
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Adresse e-mail non trouvée";
          break;
        case "auth/invalid-credential":
          errorMessage = "Vérifier vos identifiants et votre mot de passe";
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
          errorMessage = "Réessayez plus tard";
          break;
        default:
          errorMessage = "Erreur inconnue, veuillez réessayer";
      }
      setLoginError(errorMessage);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (!loginEmail || !loginPassword) {
      setLoginErrorPresent(true);
    } else {
      setLoginErrorPresent(false);
    }
  }, [loginEmail, loginPassword]);

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.confidentialityTitle}
        className="bg-[#FF7575] text-white rounded-br-[120px] pt-20"
      >
        {i18n.t("confidentialite")}
      </Text>

      <View style={styles.pageContainer}>
        <Text style={styles.infoText}>
          Si vous voulez poser des questions, commenter ou réagir, et envoyer
          des messages (forum, message privé), veuillez vous connecter ou créer
          un compte. Cela synchronisera également vos données.
        </Text>
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
            {
              backgroundColor:
                loginErrorPresent || loading
                  ? theme === "pink"
                    ? COLORS.accent500_40
                    : COLORS.accent800_40
                  : theme === "pink"
                  ? COLORS.accent500
                  : COLORS.accent800,
            },
          ]}
          onPress={handleLogin}
          disabled={loginErrorPresent || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? i18n.t("chargement") : i18n.t("connection")}
          </Text>
        </TouchableOpacity>
        {/* {loginError && <Text style={styles.errorText}>{loginError}</Text>} */}
        <Text style={styles.orText} className="lowercase">
          {i18n.t("ou")}
        </Text>
        <TouchableOpacity
          style={[
            styles.switchButton,
            {
              borderColor:
                theme === "pink" ? COLORS.accent500 : COLORS.accent800,
            },
          ]}
          onPress={() => navigation.navigate("username")}
        >
          <Text style={[styles.switchButtonText, { color: COLORS.accent500 }]}>
            {i18n.t("inscription")}
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        transparent
      >
        <View className="bg-black/40 h-full p-3 items-center justify-center">
          <Animated.View
            entering={BounceIn}
            style={styles.modalContent}
            className="bg-white items-center justify-center"
          >
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
      {/* Modal de chargement */}
      <Modal transparent={true} visible={isLoading} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.modalText}>
              Chargement de vos données... {Math.round(progress)}%
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
  },
  confidentialityTitle: {
    fontSize: SIZES.width * 0.08,
    fontFamily: "Bold",
    textAlign: "center",
    height: SIZES.height * 0.3,
  },
  pageContainer: {
    width,
    padding: 20,
    justifyContent: "center",
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
    borderRadius: 15,
    marginVertical: 10,
    width: width - 40,
    backgroundColor: COLORS.bg200,
    // borderWidth: 1,
    // borderColor: "#c0bdbd",
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
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#FF7575",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
  },

  progressBarContainer: {
    width: "100%",
    height: 10,
    backgroundColor: "#e7e5e5",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.accent600,
    borderRadius: 5,
  },
  orText: {
    textAlign: "center",
    paddingVertical: 10,
  },
  switchButton: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: "white",
  },
  switchButtonText: {
    textAlign: "center",
  },
});

export default Login;
