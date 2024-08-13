import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { COLORS, images, SIZES } from "@/constants";
import { auth, database, realtimeDatabase } from "@/services/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection } from "firebase/firestore";
import { useSelector } from "@legendapp/state/react";
import {
  preferenceState,
  updateCycleMenstruelData,
  updateUser,
} from "@/legendstate/AmpelaStates";
import i18n from "@/constants/i18n";
import { router, useNavigation } from "expo-router";
import {
  addCyclesToSQLite,
  deleteAllCycles,
  getAllCycle,
  updateUserSqlite,
} from "@/services/database";
import {
  fetchCyclesFromFirebase,
  fetchUserDataFromRealtimeDB,
} from "@/services/firestoreAPI";
import CustomAlert from "@/components/CustomAlert";
import { Image } from "expo-image";
import { get, ref } from "firebase/database";
import * as FileSystem from "expo-file-system";

const Login = () => {
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

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log("Attempting to sign in with email and password");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      console.log("User signed in successfully:", userCredential.user.uid);

      if (!userCredential.user.emailVerified) {
        console.log("Email not verified, sending verification email");
        await sendEmailVerification(userCredential.user);
        setVerificationModalVisible(true);
        console.log("Verification email sent");
        setLoading(false);
        return;
      }

      const userId = userCredential.user.uid;
      console.log(
        `Fetching user data from Realtime Database for userId: ${userId}`
      );
      const userDbRef = ref(realtimeDatabase, `users/${userId}/user`);

      console.log(
        `Fetching user data from Realtime Database for userId: ${userId}`
      );

      const snapshot = await get(userDbRef);

      if (!snapshot.exists()) {
        throw new Error("User data does not exist.");
      }

      const data = snapshot.val();

      if (data.onlineImage) {
        console.log("Downloading online image");
        const localUri = `${FileSystem.documentDirectory}${userId}_profile.jpg`;

        const downloadResult = await FileSystem.downloadAsync(
          data.onlineImage,
          localUri
        );

        if (downloadResult.status === 200) {
          console.log("Image downloaded successfully");
          await updateUser({
            userId: userCredential.user.uid,
            username: data.username,
            lastMenstruationDate: data.lastMenstruationDate,
            durationMenstruation: data.durationMenstruation,
            cycleDuration: data.cycleDuration,
            email: userCredential.user.email,
            profileImage: downloadResult.uri,
            onlineImage: data.onlineImage,
          });

          await updateProfile(auth.currentUser, {
            displayName: data.username,
            photoURL: data.onlineImage,
          });

          console.log("User profile updated in Firebase auth");
        } else {
          console.error("Failed to download image");
        }
      } else {
        console.log("No online image to download");
        await updateUser({
          userId: userCredential.user.uid,
          username: data.username,
          lastMenstruationDate: data.lastMenstruationDate,
          durationMenstruation: data.durationMenstruation,
          cycleDuration: data.cycleDuration,
          email: userCredential.user.email,
          profileImage: data.profileImage,
          onlineImage: data.onlineImage,
        });
      }

      const updatedCycles = await getAllCycle();
      updateCycleMenstruelData({ cyclesData: updatedCycles });
      console.log("Menstrual cycle data updated");

      console.log("Navigating back");
      router.navigate("(drawer)/(main)");
    } catch (error) {
      console.error("Login failed:", error.message);
      handleAuthError(error);
    } finally {
      setLoading(false);
      console.log("Loading state set to false");
    }
  };

  const handleAuthError = (error) => {
    let errorMessage;
    auth.signOut();
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
      <CustomAlert
        type="loading"
        message="Vérification en cours..."
        visible={loading}
        onClose={() => setModalVisible(false)}
        autoClose={false}
      />
      <CustomAlert
        type="error"
        // message={"Erreur lors de la connexion"}
        description={loginError}
        visible={isModalVisible && !loading}
        onClose={() => setModalVisible(false)}
        autoClose={true}
      />
      <View className="p-5" style={[]}>
        <Text
          style={[styles.confidentialityTitle, { color: COLORS.accent500 }]}
          className="rounded-b-xl pt-20 text-white"
        >
          {i18n.t("connecter")}
        </Text>
        <Text style={styles.infoText}>
          Si vous voulez participer au message privée et forum, veuillez vous
          connecter ou créer un compte.
        </Text>
      </View>
      <Image
        source={images.otp1}
        style={{ width: SIZES.width, height: SIZES.height * 0.2 }}
        contentFit="contain"
      />
      <View style={styles.pageContainer}>
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
        <View className="mt-0 mb-2 flex-row justify-end">
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => {
              setResetEmailSentModalVisible(true);
              handleForgotPassword();
            }}
            className=""
          >
            <Text style={styles.forgotPasswordText}>
              {/* {i18n.t("motDePasseOublie")} */}
              mot de passe oublié ?
            </Text>
          </TouchableOpacity>
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

        <TouchableOpacity
          style={[
            {
              borderColor:
                theme === "pink" ? COLORS.accent500 : COLORS.accent800,
            },
          ]}
          onPress={() => navigation.navigate("username")}
          className="mt-10"
        >
          <Text className="text-center">
            Je suis un nouveau utilisatrice {"  "}
            <Text
              style={[styles.switchButtonText, { color: COLORS.accent500 }]}
            >
              {i18n.t("inscription")}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  pageContainer: {
    padding: 20,
    justifyContent: "center",
  },
  infoText: {
    marginTop: 20,
  },
  input: {
    padding: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  inputContainer: {
    borderRadius: 5,
    marginVertical: 10,
    width: SIZES.width - 40,
    backgroundColor: COLORS.bg200,
    borderWidth: 1,
    borderColor: "#c0bdbd",
  },
  button: {
    padding: 15,
    borderRadius: 5,
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
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: "white",
  },
  switchButtonText: {
    textAlign: "center",
  },
});

export default Login;
