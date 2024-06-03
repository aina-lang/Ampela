import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import { COLORS, SIZES } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../redux/userSlice";

const UsernameAndPasswordScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [nameText, setNameText] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);
  const [passwordShow1, setPasswordShow1] = useState(false);
  const [passwordShow2, setPasswordShow2] = useState(false);
  const [text, setText] = useState(
    "(Au minimum 8 caractères, une majuscule, et un chiffre)"
  );
  const [colorText, setColorText] = useState("#000000");
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  // useEffect(() => {
  //   if (nameText !== "" && password !== "" && passwordConfirm !== "") {
  //     if (passwordRegex.test(password) && password === passwordConfirm) {
  //       setIsNextBtnDisabled(false);
  //     } else {
  //       setIsNextBtnDisabled(true);
  //     }
  //   } else {
  //     setIsNextBtnDisabled(true);
  //   }
  // }, [nameText, password, passwordConfirm]);
  useEffect(() => {
    if (nameText !== "") {
      setIsNextBtnDisabled(false);
    } else {
      setIsNextBtnDisabled(true);
    }
  }, [nameText]);

  const handleUsernameChange = (text) => {
    setNameText(text);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text === "") {
      setText("(Au moins 8 caractères, une majuscule, et un chiffre)");
      setColorText("#000000");
    } else if (passwordRegex.test(text)) {
      setText("Validé");
      setColorText("green");
    } else {
      setColorText("red");
      setText("(Au moins 8 caractères, une majuscule, et un chiffre)");
    }
  };

  const handlePasswordConfirmChange = (text) => {
    setPasswordConfirm(text);
  };
  const handleNextBtnPress = () => {
    const userData = {
      username: nameText,
      // password,
    };
    dispatch(updateUser(userData));
    console.log("User Data:", { ...user, ...userData });
    navigation.navigate("lastMenstrualCycleStart");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.title}
        className="bg-[#FF7575] text-white rounded-br-[150] pt-20 px-2 shadow-lg shadow-black"
      >
        Quel est votre nom d'utlisateur
      </Text>
      <View className=" " style={{ height: SIZES.height * 0.6 }}>
        <View style={styles.inputBoxDeeper}>
          <Text>Pseudo pour utoilser l'application</Text>
          <View style={styles.inputContainer}>
            <TextInput
              cursorColor={COLORS.accent400}
              placeholder="Nom d'utilisateur"
              value={nameText}
              onChangeText={handleUsernameChange}
              style={styles.input}
              className=""
            />
          </View>

          {/* <View>
            <View className="flex flex-row" style={styles.inputContainer}>
              <TextInput
                secureTextEntry={passwordShow1}
                cursorColor={COLORS.accent400}
                placeholder="Mot de passe"
                value={password}
                onChangeText={handlePasswordChange}
                style={styles.input}
                className=" w-[85%]"
              />
              <TouchableOpacity
                className="flex-grow   items-center justify-center"
                onPress={() => setPasswordShow1(!passwordShow1)}
              >
                <Feather
                  name={passwordShow1 === true ? "eye" : "eye-off"}
                  size={20}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontFamily: "Medium",
                fontSize: SIZES.small,
                color: colorText,
              }}
            >
              {text}
            </Text>
          </View> */}

          {/* <View className="flex flex-row" style={styles.inputContainer}>
            <TextInput
              secureTextEntry={passwordShow2}
              cursorColor={COLORS.accent400}
              placeholder="Confirmez le mot de passe"
              value={passwordConfirm}
              onChangeText={handlePasswordConfirmChange}
              style={styles.input}
              className=" w-[85%]"
            />
            <TouchableOpacity
              className="flex-grow   items-center justify-center"
              onPress={() => setPasswordShow2(!passwordShow2)}
            >
              <Feather
                name={passwordShow2 === true ? "eye" : "eye-off"}
                size={20}
              />
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
      <View
        style={styles.btnBox}
        className="flex items-center  justify-between flex-row p-5"
      >
        <TouchableOpacity
          className="p-3  items-center rounded-md px-5"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-[#8a8888]">Précedent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="p-3  items-center rounded-md px-5 shadow-md shadow-black"
          onPress={handleNextBtnPress}
          disabled={isNextBtnDisabled}
          style={{
            backgroundColor: isNextBtnDisabled ? "#e7e5e5" : "#FF7575",
          }}
        >
          <Text className="text-white">Suivant</Text>
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
  title: {
    fontSize: SIZES.width * 0.08,
    fontFamily: "Bold",
    textAlign: "center",
    height: SIZES.height * 0.3,
  },
  inputBoxDeeper: {
    marginTop: 70,
    marginLeft: 20,
    gap: 10,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#c0bdbd",
    borderRadius: 15,
    fontFamily: "Medium",
    marginVertical: 10,
    width: Math.floor(Dimensions.get("window").width) - 40,
    overflow: "hidden",
    backgroundColor: "rgb(243 244 246)",
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontFamily: "Medium",
  },
  btnBox: {
    height: SIZES.height * 0.15,
    width: SIZES.width,
  },
});

export default UsernameAndPasswordScreen;
