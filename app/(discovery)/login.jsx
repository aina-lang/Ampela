import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { auth, database, storage } from "@/services/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useSelector } from "@legendapp/state/react";
import { userState } from "@/legendstate/AmpelaStates";
import i18n from "@/constants/i18n";
import { useNavigation } from "expo-router";
const { width } = Dimensions.get("window");

const login = () => {
  const user = useSelector(() => userState.get());
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [loginErrorPresent, setLoginErrorPresent] = useState(false);
const navigation=useNavigation()

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
  }, [loginEmail, loginPassword]);

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.confidentialityTitle}
        className="bg-[#FF7575] text-white rounded-br-[150px] pt-20 shadow-lg shadow-black"
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
          onPress={()=>navigation.navigate("username")}
        >
          <Text className="text-center" style={{ color: COLORS.accent500 }} >
            S'inscrire
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
  confidentialityContainer: {
    width: SIZES.width,
    height: SIZES.height * 0.6,
  },
  confidentialityTitle: {
    fontSize: SIZES.width * 0.08,
    fontFamily: "Bold",
    textAlign: "center",
    height: SIZES.height * 0.3,
  },
  confidentialityItem: {
    marginTop: 20,
  },
  confidentialityText: {
    fontFamily: "Regular",
    fontSize: SIZES.width * 0.05,
    lineHeight: 24,
    paddingRight: 20,
  },
  btnBox: {
    height: SIZES.height * 0.15,
    width: SIZES.width,
  },
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

export default login;
