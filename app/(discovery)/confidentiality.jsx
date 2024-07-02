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
  ScrollView,
  FlatList,
} from "react-native";
import CheckBox, { Checkbox } from "expo-checkbox";
import { Link } from "expo-router";
import { COLORS, FONT, SIZES } from "@/constants";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { I18n } from "i18n-js";
import i18n from "@/constants/i18n";

const confidentiality = () => {
  const { theme } = useSelector(() => preferenceState.get());

  let bouncyCheckbox1Ref = null;
  let bouncyCheckbox2Ref = null;
  const navigation = useNavigation();

  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);

  useEffect(() => {
    if ( checkbox2 === true) {
      setIsNextBtnDisabled(false);
    } else {
      setIsNextBtnDisabled(true);
    }
  }, [checkbox1, checkbox2]);

  const handleNextBtnPress = useCallback(() => {
    navigation.navigate("login");
  });

  const prevHandled = () => {
    navigation.goBack();
  };
  const handleAcceptAllBtnPress = useCallback(() => {
    if (checkbox1 === false) {
      bouncyCheckbox1Ref?.onPress();
    }
    if (checkbox2 === false) {
      bouncyCheckbox2Ref?.onPress();
    }
  });

  const confidentialiteData = [
    {
      title: "utilisation",
      description:
        "  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat",
    },
    {
      title: "utilisation",
      description:
        "  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia iusto nemo sunt fuga illum rem sit officia recusandae, magni nobis, nostrum expedita libero ut pariatur explicabo harum. Maxime, voluptatibus fugiat",
    },
  ];

  const renderItem = ({ item }) => (
    <View className="p-3 max-w-[98%]">
      <Text className="font-bold  mb-2" style={{ fontSize: 20 }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 16, textAlign: "left", lineHeight: 25 }}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.confidentialityTitle}
        className="bg-[#FF7575] text-white rounded-br-[150px] pt-20 shadow-lg shadow-black"
      >
        {i18n.t("confidentialite")}
      </Text>
      <View
        style={[styles.confidentialityContainer]}
        className=" flex items-center justify-center p-2"
      >
        <View>
          {/* <View style={styles.confidentialityItem}>
            <CheckBox
              value={checkbox1}
              onValueChange={setCheckbox1}
              color={checkbox1 ? "#FF7575" : ""}
            /> */}

          {/* <Pressable onPress={() => setCheckbox1(!checkbox1)}>
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
            </Pressable> */}
          {/* </View> */}
          <View style={styles.confidentialityItem}>
            <FlatList
              data={confidentialiteData}
              renderItem={renderItem}
              contentContainerStyle={{
                // backgroundColor: "green",
                width: SIZES.width,
              }}
            />
            <View className="mt-3 flex-row space-x-3 ml-3">
              <Checkbox
                value={checkbox2}
                onValueChange={setCheckbox2}
                color={checkbox2 ? "#FF7575" : ""}
              />
              <Pressable onPress={() => setCheckbox2(!checkbox2)}>
                <Text style={styles.confidentialityText}>
                  {/* J'accepte le traitement de mes données personnelles de santé
                dans le but de bénéficier des fontions de l'application{" "}
                <Link
                  href="https://jonathan-boyer.fr"
                  className="text-[#FF7575]"
                >
                  Ampela
                </Link>{" "}
                . */}
                  Accepter
                </Text>
              </Pressable>
            </View>
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
        className="flex items-center  justify-between flex-row  p-5"
      >
        <TouchableOpacity onPress={prevHandled} className="p-3 rounded-md ">
          <Text>Retour</Text>
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
});

export default confidentiality;
