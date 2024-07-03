import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { COLORS } from "@/constants";
import HeaderWithGoBack from "@/components/header-with-go-back";
import { useNavigation } from "expo-router";
import { preferenceState, userState, cycleMenstruelState } from "@/legendstate/AmpelaStates";
import {
  deleteCycleById,
  addCycleMenstruel,
  getAllCycle,
  updateUserSqlite,
} from "@/services/database";
import { generateCycleMenstrualData } from "@/utils/menstruationUtils";


const UpdateCycleInfo = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [cycleDuration, setCycleDuration] = useState("");
  const [periodDuration, setPeriodDuration] = useState("");
  const { theme } = preferenceState.get();
  const user = userState.get();
  const isDateSelected = !!selectedDate;

  const getFirstDayOfLastMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  };

  const getLastDayOfLastMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 0);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleUpdateCycleInfo = async () => {
    if (!selectedDate) {
      Alert.alert("Erreur", "Veuillez choisir une date");
      return;
    }

    if (!cycleDuration) {
      Alert.alert("Erreur", "Veuillez entrer la durée du cycle");
      return;
    }

    if (!periodDuration) {
      Alert.alert("Erreur", "Veuillez entrer la durée des règles");
      return;
    }

    if (parseInt(periodDuration) > 8) {
      Alert.alert("Erreur", "La durée des règles ne peut pas dépasser 8 jours");
      return;
    }

    if (parseInt(periodDuration) < 1) {
      Alert.alert("Erreur", "La durée des règles doit être d'au moins 1 jour");
      return;
    }

    try {
      const allCycles = await getAllCycle();

      for (const cycle of allCycles) {
        const cycleStartDate = new Date(cycle.startMenstruationDate);
        const selectedDateObj = new Date(selectedDate);
        if (cycleStartDate >= selectedDateObj) {
          await deleteCycleById(cycle.id);
        }
      }

      const cyclesData = generateCycleMenstrualData(
        selectedDate,
        cycleDuration,
        periodDuration
      );

      for (const cycle of cyclesData) {
        await addCycleMenstruel(
          cycle.endMenstruationDate,
          cycle.startMenstruationDate,
          cycle.month,
          cycle.startMenstruationDate,
          cycle.endMenstruationDate,
          cycle.nextMenstruationDate,
          cycle.nextMenstruationEndDate,
          cycle.ovulationDate
        );
      }

      const updatedUser = {
        ...user,
        lastMenstruationDate: selectedDate,
        durationMenstruation: periodDuration,
        cycleDuration: cycleDuration,
      };
      userState.set(updatedUser);

      await updateUserSqlite(
        user.id,
        user.username,
        user.password,
        user.profession,
        selectedDate,
        periodDuration,
        cycleDuration,
        user.email,
        user.profileImage
      );

      const updatedCycles = await getAllCycle();
      cycleMenstruelState.set({ cyclesData: updatedCycles });

      Alert.alert(
        "Succès",
        `Information du cycle mise à jour pour la date: ${selectedDate}\nDurée du cycle: ${cycleDuration}\nDurée des règles: ${periodDuration}`
      );
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la mise à jour des informations du cycle."
      );
      console.error(error);
    }

    // navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <HeaderWithGoBack title="Modification" navigation={navigation} />
      <ScrollView
        style={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Choisissez une date du mois précédent pour mettre à jour l'information
          du cycle. Ce date sera le début des règles du dernier cycle
        </Text>
        <Calendar
          onDayPress={handleDayPress}
          minDate={getFirstDayOfLastMonth().toISOString().split("T")[0]}
          maxDate={getLastDayOfLastMonth().toISOString().split("T")[0]}
          markedDates={{
            [selectedDate]: {
              selected: true,
              marked: true,
              selectedColor: COLORS.accent500,
            },
          }}
          theme={{
            selectedDayBackgroundColor: COLORS.accent500,
            todayTextColor: COLORS.accent500,
            arrowColor: COLORS.accent500,
          }}
        />
        <View style={styles.inputContainer}>
          <Text>Nouveau règle</Text>
          <TextInput
            style={[styles.input, !isDateSelected && styles.inputDisabled]}
            keyboardType="numeric"
            value={periodDuration}
            onChangeText={(text) => {
              const value = text.replace(/[^0-9]/g, "");
              const numValue = parseInt(value, 10);
              if (numValue >= 1 && numValue <= 9) {
                setPeriodDuration(value);
              } else if (value === "") {
                setPeriodDuration("");
              }
            }}
            placeholder="Entrez une nouvelle durée des règles"
            maxLength={1}
            editable={isDateSelected}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text>Nouveau cycle</Text>
          <TextInput
            style={[styles.input, !isDateSelected && styles.inputDisabled]}
            keyboardType="numeric"
            value={cycleDuration}
            onChangeText={(text) => {
              const value = text.replace(/[^0-9]/g, "");
              const numValue = parseInt(value, 10);
              if (numValue >= 1 && numValue <= 40) {
                setCycleDuration(value);
              } else if (value === "") {
                setCycleDuration("");
              }
            }}
            placeholder="Entrez une nouvelle durée du cycle"
            maxLength={2}
            editable={isDateSelected}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            (!selectedDate || !cycleDuration || !periodDuration) &&
              styles.buttonDisabled,
          ]}
          onPress={handleUpdateCycleInfo}
          disabled={!selectedDate || !cycleDuration || !periodDuration}
        >
          <Text style={styles.buttonText}>Mettre à jour</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  description: {
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: COLORS.dark,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGrey,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: COLORS.lightGrey,
  },
  buttonText: {
    fontSize: 18,
    color: COLORS.light,
  },
});

export default UpdateCycleInfo;
