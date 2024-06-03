import { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Button,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import CheckBox, { Checkbox } from "expo-checkbox";
import { Link } from "expo-router";
import { COLORS, FONT, SIZES } from "@/constants";
import { useNavigation } from "@react-navigation/native";

const confidentiality = () => {
  let bouncyCheckbox1Ref = null;
  let bouncyCheckbox2Ref = null;
  const navigation = useNavigation();

  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);

  useEffect(() => {
    if (checkbox1 === true && checkbox2 === true) {
      setIsNextBtnDisabled(false);
    } else {
      setIsNextBtnDisabled(true);
    }
  }, [checkbox1, checkbox2]);

  const handleNextBtnPress = useCallback(() => {
    navigation.navigate("username");
  });

  const handleAcceptAllBtnPress = useCallback(() => {
    if (checkbox1 === false) {
      bouncyCheckbox1Ref?.onPress();
    }
    if (checkbox2 === false) {
      bouncyCheckbox2Ref?.onPress();
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.confidentialityTitle}
        className="bg-[#FF7575] text-white rounded-br-[150] pt-20 shadow-lg shadow-black"
      >
        Confidentialité
      </Text>
      <View
        style={[styles.confidentialityContainer]}
        className=" flex items-center justify-center p-8"
      >
        <View>
          <View style={styles.confidentialityItem}>
            <CheckBox
              value={checkbox1}
              onValueChange={setCheckbox1}
              color={checkbox1 ? "#FF7575" : ""}
            />

            <Pressable onPress={() => setCheckbox1(!checkbox1)}>
              <Text style={styles.confidentialityText}>
                J'accepte{" "}
                <Link
                  href="https://policies.google.com/privacy?hl=fr-CA"
                  className="text-[#FF7575]"
                >
                  la politique de confidentialité{" "}
                </Link>
                et{" "}
                <Link
                  href="https://policies.google.com/privacy?hl=fr-CA"
                  className="text-[#FF7575] ml-2"
                >
                  les conditions d'utilisation{" "}
                </Link>
                .
              </Text>
            </Pressable>
          </View>
          <View style={styles.confidentialityItem}>
            <Checkbox
              value={checkbox2}
              onValueChange={setCheckbox2}
              color={checkbox2 ? "#FF7575" : ""}
            />
            <Pressable onPress={() => setCheckbox2(!checkbox2)}>
              <Text style={styles.confidentialityText}>
                J'accepte le traitement de mes données personnelles de santé
                dans le but de bénéficier des fontions de l'application{" "}
                <Link
                  href="https://jonathan-boyer.fr"
                  className="text-[#FF7575]"
                >
                  Ampela
                </Link>{" "}
                .
              </Text>
            </Pressable>
          </View>
          {/* {!isAllChecked ? ( 
            <Button
              // bgColor={COLORS.neutral100}
              // textColor={COLORS.accent600}
              color={"white"}
              t
              onPress={handleAcceptAllBtnPress}
              title="Tout accepter"
            />
            <TouchableOpacity className="p-3 bg-[#FF7575] items-center">
              <Text>Tout accepter</Text>
            </TouchableOpacity>
          ) : null}
          */}
        </View>
      </View>
      <View
        style={styles.btnBox}
        className="flex items-center  justify-end flex-row  p-5"
      >
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
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
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
});

export default confidentiality;
