import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { COLORS, SIZES } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import {
  ResponseOfQuestion0,
  ResponseOfQuestion1,
} from "@/components/response-of-question";
import { addCycleMenstruel, addUser } from "@/services/database";
import { generateCycleMenstrualData } from "@/utils/menstruationUtils";
import { updateUser, userState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";

const durationMenstruations = [];
const cycleDurations = [];

for (let i = 2; i < 46; i++) {
  let text = null;
  if (i > 2 && i < 8) {
    text = i + " " + "jours";
    durationMenstruations.push(text);
  }
  if (i > 20 && i < 46) {
    text = i + " " + "jours";
    cycleDurations.push(text);
  }
}

const QuestionsSeries = () => {
  const navigation = useNavigation();
  const [response0, setResponse0] = useState(durationMenstruations[0]);
  const [response1, setResponse1] = useState(cycleDurations[0]);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const dontRememberText = "je m'en souviens pas";
  const user = useSelector(() => userState.get());

  const handleResponsePress0 = (item) => {
    setResponse0(item);
  };

  const handleResponsePress1 = (item) => {
    setResponse1(item);
  };

  function getNumberFromString(strs) {
    if (strs === dontRememberText) {
      return 28; // Valeur par défaut si l'utilisateur ne se souvient pas
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
    setIsLoading(true);

    // Ajustez la valeur du cycle de menstruation et de la durée des menstruations
    const cycleDuration = getNumberFromString(response1);
    const durationMenstruation = getNumberFromString(response0);

    // Générer les données du cycle menstruel
    const cycleData = generateCycleMenstrualData(
      user.lastMenstruationDate,
      cycleDuration,
      durationMenstruation
    );

    await addUser(
      user.username,
      user.password,
      user.profession,
      user.lastMenstruationDate,
      durationMenstruation,
      cycleDuration,
      user.email,
      user.profileImage
    );

    // Boucle pour enregistrer chaque cycle dans la base de données
    for (let i = 0; i < cycleData.length; i++) {
      const cycle = cycleData[i];

      // Mise à jour du pourcentage de progression
      setProgress(((i + 1) / cycleData.length) * 100);

      // Ajout du cycle menstruel dans la base de données
      await addCycleMenstruel(
        cycle.fecundityPeriodEnd,
        cycle.fecundityPeriodStart,
        cycle.month,
        cycle.startMenstruationDate,
        cycle.endMenstruationDate,
        cycle.nextMenstruationDate,
        cycle.nextMenstruationEndDate,
        cycle.ovulationDate
      );
    }

    setIsLoading(false);
    navigation.navigate("(drawer)");
  };

  useEffect(() => {
    const userData = {
      durationMenstruation: getNumberFromString(response0),
    };
    updateUser(userData);
  }, [response0]);

  useEffect(() => {
    const userData = {
      cycleDuration: getNumberFromString(response1),
    };
    updateUser(userData);
  }, [response1]);

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.title}
        className="bg-[#FF7575] text-white rounded-br-[150px] pt-20 px-2 shadow-lg shadow-black"
      >
        Indiquez vos durées menstruelles et de cycle
      </Text>
      <View style={styles.content} className="flex justify-center">
        <View style={styles.contentItem}>
          <Text style={styles.question}>Durée de vos règles </Text>
          <FlatList
            style={{
              width: SIZES.width,
              padding: 10,
              paddingRight: 20,
              height: 70,
            }}
            data={durationMenstruations}
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
            className="mx-auto"
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
              className="shadow-sm shadow-black" // Change shadow-md to shadow-sm
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
        className="flex items-center justify-between flex-row p-5"
      >
        <TouchableOpacity
          className="p-3 items-center rounded-md px-5"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-[#8a8888]">Précedent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="p-3 items-center rounded-md px-5 shadow-sm shadow-black" // Change shadow-md to shadow-sm
          onPress={handleNextBtnPress}
          disabled={isNextBtnDisabled}
          style={{
            backgroundColor: isNextBtnDisabled ? "#e7e5e5" : "#FF7575",
          }}
        >
          <Text className="text-white">Terminer</Text>
        </TouchableOpacity>
      </View>

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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 250,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginVertical: 10,
    fontSize: 16,
    color: COLORS.primary,
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
});

export default QuestionsSeries;
