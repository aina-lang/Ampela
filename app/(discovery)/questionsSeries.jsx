import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, SIZES } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { updateUser } from "../../redux/userSlice";
import {
  ResponseOfQuestion0,
  ResponseOfQuestion1,
} from "@/components/response-of-question";
import { addUser } from "@/services/database";
import ProgressBar from "@/components/ProgreessBar";
import { Redirect } from "expo-router";
import { generateCycleMenstrualData } from "@/utils/menstruationUtils";

const menstruationDurations = [];
const cycleDurations = [];

for (let i = 2; i < 46; i++) {
  let text = null;
  if (i > 2 && i < 8) {
    text = i + " " + "jours";
    menstruationDurations.push(text);
  }
  if (i > 20 && i < 46) {
    text = i + " " + "jours";
    cycleDurations.push(text);
  }
}

const QuestionsSeries = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [response0, setResponse0] = useState(menstruationDurations[0]);
  const [response1, setResponse1] = useState(cycleDurations[0]);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);
  const dontRememberText = "je m'en souviens pas";
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const user = useSelector((state) => state.user);

  const handleResponsePress0 = (item) => {
    setResponse0(item);
  };
  const handleResponsePress1 = (item) => {
    setResponse1(item);
  };

  function getNumberFromString(strs) {
    if (strs === dontRememberText) {
      return 28;
    } else {
      const arrs = strs.split(" ");
      return parseInt(arrs[0], 10);
    }
  }

  useEffect(() => {
    if (response0 && response1) {
      setIsNextBtnDisabled(false);
    } else {
      setIsNextBtnDisabled(true);
    }
  }, [response0, response1]);

  const handleNextBtnPress = async () => {
    setIsTransactionInProgress(true);

    await addUser(
      user.username,
      user.password,
      user.profession,
      user.lastMenstruationDate,
      user.durationMenstruation,
      user.cycleDuration,
      user.email
    );
    const cycleData = generateCycleMenstrualData(
      user.lastMenstruationDate,
      user.cycleDuration,
      user.durationMenstruation
    );

    // Boucle pour enregistrer chaque cycle dans la base de données
    for (let i = 0; i < cycleData.length; i++) {
      const cycle = cycleData[i];
      // Ajout du cycle menstruel dans la base de données
      await addCycleMenstruel({
        userId: user.id,
        ...cycle,
      });
    }

    setIsTransactionInProgress(false);
    navigation.navigate("main");
  };

  useEffect(() => {
    const userData = {
      menstruationDuration: getNumberFromString(response0),
    };
    dispatch(updateUser(userData));
  }, [response0]);

  useEffect(() => {
    const userData = {
      cycleDuration: getNumberFromString(response1),
    };
    dispatch(updateUser(userData));
  }, [response1]);

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.title}
        className="bg-[#FF7575] text-white rounded-br-[150] pt-20 px-2 shadow-lg shadow-black"
      >
        Indiquez vos durées menstruelles et de cycle
      </Text>
      <View style={styles.content} className=" flex justify-center">
        <View style={styles.contentItem}>
          <Text style={styles.question}>Durée de vos règles </Text>
          <FlatList
            style={{
              width: SIZES.width,
              padding: 10,
              paddingRight: 20,
              height: 70,
            }}
            data={menstruationDurations}
            renderItem={({ item }) => (
              <ResponseOfQuestion0
                text={item}
                active={response0 === item ? true : false}
                onPress={() => handleResponsePress0(item)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            horizontal
          />
        </View>
        <View style={styles.contentItem}>
          <Text style={styles.question}>Durée du cycle</Text>
          <FlatList
            data={cycleDurations}
            style={{
              width: SIZES.width,
              padding: 10,
              paddingRight: 20,
              height: 70,
            }}
            renderItem={({ item }) => (
              <ResponseOfQuestion1
                text={item}
                active={response1 === item ? true : false}
                onPress={() => handleResponsePress1(item)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            horizontal
          />
          <View
            style={{ width: SIZES.width - 40, marginTop: 15 }}
            className=" mx-auto"
          >
            <TouchableOpacity
              style={[
                {
                  height: 40,
                  alignSelf: "flex-start",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 10,
                  borderRadius: 10,
                },
                {
                  backgroundColor:
                    response1 === dontRememberText ? COLORS.accent600 : "white",
                  borderColor:
                    response1 === dontRememberText ? COLORS.accent600 : null,
                },
              ]}
              className=" shadow-md shadow-black"
              onPress={() => {
                handleResponsePress1(dontRememberText);
              }}
            >
              <Text
                style={[
                  { fontFamily: "Regular", fontSize: SIZES.small },
                  {
                    color:
                      response1 === dontRememberText ? COLORS.neutral100 : null,
                  },
                ]}
              >
                {dontRememberText}
              </Text>
            </TouchableOpacity>
          </View>
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
          <Text className="text-white">Terminer</Text>
        </TouchableOpacity>
      </View>
      <ProgressBar percentage={10} isVisible={isTransactionInProgress} />
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
  contentItem: {
    marginTop: 10,
  },
  question: {
    fontFamily: "Bold",
    fontSize: 20,
    padding: 20,
    paddingBottom: 5,
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
});

export default QuestionsSeries;
