import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../redux/userSlice";
import { COLORS, SIZES } from "../constants";
import Checkbox from "expo-checkbox";
import { useNavigation } from "@react-navigation/native";

const PersonalHealthTestScreen = () => {
  const [checkbox1, setCheckbox1] = useState(true);
  const [checkbox2, setCheckbox2] = useState(false);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (checkbox1 === true || checkbox2 === true) {
      setIsNextBtnDisabled(false);
    } else {
      setIsNextBtnDisabled(true);
    }
  }, [checkbox1, checkbox2]);

  const handleCheckbox1Press = (value) => {
    setCheckbox1(value);
    setCheckbox2(!value);
  };

  const handleCheckbox2Press = (value) => {
    setCheckbox2(value);
    setCheckbox1(!value);
  };

  const handleNextBtnPress = () => {
    if (checkbox1 === true) {
      dispatch(updateUser({ profession: "doctor" }));
      console.log("Updated User Data:", { ...user});
      // navigation.navigate("DoctorAuthScreen");
      
    } else if (checkbox2) {
      dispatch(updateUser({ profession: "simpleUser" }));
      console.log("Updated User Data:", { ...user });
      navigation.navigate("usernameAndPasswordScreen");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.title}
        className="bg-[#FF7575] text-white rounded-br-[150] pt-20 shadow-lg shadow-black"
      >
        Êtes-vous un personnel de santé ?
      </Text>
      <View style={styles.content} className="">
        <View style={styles.checkboxContainer} className="">
          <View style={styles.checkboxItem}>
            <Checkbox
              value={checkbox1}
              onValueChange={handleCheckbox1Press}
              color={checkbox1 ? "#FF7575" : ""}
            />
            <TouchableOpacity
              onPress={() => {
                setCheckbox1(!checkbox1);
                setCheckbox2(!checkbox2);
              }}
            >
              <Text style={styles.checkboxText}>
                Oui, je suis un personnel de santé (Gynécologue, sage femme)
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.checkboxItem}>
            <Checkbox
              value={checkbox2}
              onValueChange={handleCheckbox2Press}
              color={checkbox2 ? "#FF7575" : ""}
            />
            <TouchableOpacity
              onPress={() => {
                setCheckbox2(!checkbox2);
                setCheckbox1(!checkbox1);
              }}
            >
              <Text style={styles.checkboxText}>
                Non, je ne suis qu'un simple utilisateur
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View
        style={styles.btnBox}
        className="flex items-center justify-between flex-row p-5"
      >
        <TouchableOpacity
          className="p-3 items-center rounded-md px-5"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-[#8a8888]">Précédent</Text>
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
  content: {
    width: SIZES.width,
    height: SIZES.height * 0.6,
  },
  title: {
    fontSize: SIZES.width * 0.08,
    fontFamily: "Bold",
    textAlign: "center",
    height: SIZES.height * 0.3,
  },
  btnBox: {
    height: SIZES.height * 0.15,
    width: SIZES.width,
  },
  checkboxContainer: {
    gap: 30,
    marginTop: "40%",
  },
  checkboxItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  checkboxText: {
    fontFamily: "Regular",
    lineHeight: 24,
    fontSize: SIZES.width * 0.05,
  },
});

export default PersonalHealthTestScreen;
