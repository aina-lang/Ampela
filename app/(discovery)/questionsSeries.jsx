import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { COLORS, SIZES } from "@/constants";
import { useNavigation } from "expo-router";
import {
  ResponseOfQuestion0,
  ResponseOfQuestion1,
} from "@/components/response-of-question";
import { addCycleMenstruel, addUser } from "@/services/database";
import { generateCycleMenstrualData } from "@/utils/menstruationUtils";
import { updateUser, userState, preferenceState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import { AntDesign } from "@expo/vector-icons";
import StepScreenWrapper from "@/components/StepScreenWrapper";
import ModernButton from "@/components/ModernButton";

const durationMenstruations = [];
const cycleDurations = [];

for (let i = 2; i < 46; i++) {
  if (i > 2 && i < 8) {
    durationMenstruations.push(i + " jours");
  }
  if (i > 20 && i < 46) {
    cycleDurations.push(i + " jours");
  }
}

const dontRememberText = "je m'en souviens pas";

const QuestionsSeries = () => {
  const navigation = useNavigation();
  const [response0, setResponse0] = useState(durationMenstruations[0]);
  const [response1, setResponse1] = useState(cycleDurations[0]);
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const user = useSelector(() => userState.get());
  const { theme } = useSelector(() => preferenceState.get());
  const accentColor = theme === "pink" ? "#FF7575" : "#FE8729";
  const accentColorDisabled = theme === "pink" ? "#FFB5B5" : "#FED4A0";

  const handleResponsePress0 = (item) => setResponse0(item);
  const handleResponsePress1 = (item) => setResponse1(item);

  function getNumberFromString(str) {
    if (str === dontRememberText) return 28;
    return parseInt(str.split(" ")[0], 10);
  }

  useEffect(() => {
    setIsNextBtnDisabled(!(response0 && response1));
  }, [response0, response1]);

  useEffect(() => {
    updateUser({ durationMenstruation: getNumberFromString(response0) });
  }, [response0]);

  useEffect(() => {
    updateUser({ cycleDuration: getNumberFromString(response1) });
  }, [response1]);

  const handleNextBtnPress = async () => {
    setIsLoading(true);
    try {
      const cycleDuration = getNumberFromString(response1);
      const durationMenstruation = getNumberFromString(response0);

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

      for (let i = 0; i < cycleData.length; i++) {
        const cycle = cycleData[i];
        setProgress(((i + 1) / cycleData.length) * 100);
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

      navigation.navigate("(drawer)");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des cycles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StepScreenWrapper
      stepNumber={3}
      eyebrow="Étape 3 sur 3"
      title="Vos durées menstruelles"
      subtitle="Ces informations nous permettent de calculer vos prédictions."
    >
      <View style={styles.content}>
        <View style={styles.contentItem}>
          <Text style={styles.question}>Durée de vos règles</Text>
          <FlatList
            data={durationMenstruations}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <ResponseOfQuestion0
                text={item}
                active={response0 === item}
                onPress={() => handleResponsePress0(item)}
                accentColor={accentColor}
              />
            )}
            contentContainerStyle={styles.chipList}
            showsHorizontalScrollIndicator={false}
            horizontal
          />
        </View>

        <View style={styles.contentItem}>
          <Text style={styles.question}>Durée du cycle</Text>
          <FlatList
            data={cycleDurations}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <ResponseOfQuestion1
                text={item}
                active={response1 === item}
                onPress={() => handleResponsePress1(item)}
                accentColor={accentColor}
              />
            )}
            contentContainerStyle={styles.chipList}
            showsHorizontalScrollIndicator={false}
            horizontal
          />

          <TouchableOpacity
            style={[
              styles.dontRememberChip,
              {
                backgroundColor:
                  response1 === dontRememberText ? accentColor : "#FAFAFA",
                borderColor:
                  response1 === dontRememberText ? accentColor : "#F0F0F0",
              },
            ]}
            onPress={() => handleResponsePress1(dontRememberText)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.dontRememberText,
                {
                  color:
                    response1 === dontRememberText
                      ? COLORS.neutral100
                      : "#7A7A7A",
                },
              ]}
            >
              {dontRememberText}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.btnBox}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <AntDesign name="arrowleft" size={16} color="#9E9E9E" />
            <Text style={styles.backButtonText}>Précédent</Text>
          </TouchableOpacity>

          <ModernButton
            title="Terminer"
            onPress={handleNextBtnPress}
            disabled={isNextBtnDisabled}
            accentColor={accentColor}
            accentColorDisabled={accentColorDisabled}
            style={{ flex: 1, marginLeft: 12 }}
          />
        </View>
      </View>

      <Modal transparent visible={isLoading} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={styles.modalText}>
              Préparation de vos données... {Math.round(progress)}%
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progress}%`, backgroundColor: accentColor },
                ]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </StepScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentItem: {
    marginBottom: 28,
  },
  question: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
    marginBottom: 14,
  },
  chipList: {
    gap: 10,
    paddingRight: 10,
  },
  dontRememberChip: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  dontRememberText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  btnBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 6,
  },
  backButtonText: {
    color: "#9E9E9E",
    fontSize: 15,
    fontFamily: "SBold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 260,
    padding: 28,
    backgroundColor: COLORS.neutral100,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  modalText: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: SIZES.small,
    fontFamily: "SBold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#EFEFEF",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
});

export default QuestionsSeries;
