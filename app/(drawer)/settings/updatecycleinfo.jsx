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
import { preferenceState } from "@/legendstate/AmpelaStates";
import {
  deleteCycleById,
  addCycleMenstruel,
  getAllCycle,
} from "@/services/database";

const UpdateCycleInfo = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [cycleDuration, setCycleDuration] = useState("");
  const [periodDuration, setPeriodDuration] = useState("");
  const { theme } = preferenceState.get();
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

  const getRemainingMonths = (startDate, endDate) => {
    const months = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
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


      let lastDeletedCycleDate = new Date(selectedDate);
      for (const cycle of allCycles) {
        const cycleStartDate = new Date(cycle.startMenstruationDate);
        if (cycleStartDate >= lastDeletedCycleDate) {
          await deleteCycleById(cycle.id);
          if (cycleStartDate > lastDeletedCycleDate) {
            lastDeletedCycleDate = cycleStartDate;
          }
        }
      }

      const startMenstruationDate = new Date(selectedDate);
      const endMenstruationDate = new Date(startMenstruationDate);
      endMenstruationDate.setDate(
        endMenstruationDate.getDate() + parseInt(periodDuration) - 1
      );

      const nextMenstruationStartDate = new Date(startMenstruationDate);
      nextMenstruationStartDate.setDate(
        nextMenstruationStartDate.getDate() + parseInt(cycleDuration)
      );

      const nextMenstruationEndDate = new Date(nextMenstruationStartDate);
      nextMenstruationEndDate.setDate(
        nextMenstruationEndDate.getDate() + parseInt(periodDuration) - 1
      );

      const fecundityPeriodStart = new Date(startMenstruationDate);
      fecundityPeriodStart.setDate(fecundityPeriodStart.getDate() - 14);
      const fecundityPeriodEnd = new Date(fecundityPeriodStart);
      fecundityPeriodEnd.setDate(fecundityPeriodEnd.getDate() + 4);

      const ovulationDate = new Date(fecundityPeriodStart);
      ovulationDate.setDate(ovulationDate.getDate() + 14);


      const remainingMonths = getRemainingMonths(startMenstruationDate, lastDeletedCycleDate);

      for (const month of remainingMonths) {
        const monthStartDate = new Date(month.getFullYear(), month.getMonth(), 1);
        const nextMonthStartDate = new Date(monthStartDate);
        nextMonthStartDate.setMonth(nextMonthStartDate.getMonth() + 1);

        const monthEndDate = new Date(nextMonthStartDate);
        monthEndDate.setDate(monthEndDate.getDate() - 1);

        const fecundityPeriodStart = new Date(startMenstruationDate);
        fecundityPeriodStart.setDate(fecundityPeriodStart.getDate() - 14);
        const fecundityPeriodEnd = new Date(fecundityPeriodStart);
        fecundityPeriodEnd.setDate(fecundityPeriodEnd.getDate() + 4);

        const ovulationDate = new Date(fecundityPeriodStart);
        ovulationDate.setDate(ovulationDate.getDate() + 14);

        await addCycleMenstruel(
          fecundityPeriodEnd.toISOString().split("T")[0],
          fecundityPeriodStart.toISOString().split("T")[0],
          `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`, 
          startMenstruationDate.toISOString().split("T")[0],
          endMenstruationDate.toISOString().split("T")[0],
          nextMenstruationStartDate.toISOString().split("T")[0],
          nextMenstruationEndDate.toISOString().split("T")[0],
          ovulationDate.toISOString().split("T")[0]
        );

       
        startMenstruationDate.setMonth(startMenstruationDate.getMonth() + 1);
      }

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
            onChangeText={setCycleDuration}
            placeholder="Entrez une nouvelle durée du cycle"
            maxLength={2}
            editable={isDateSelected}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                theme === "pink" ? "rgba(226,68,92, 1)" : COLORS.accent800,
            },
          ]}
          onPress={handleUpdateCycleInfo}
          disabled={!isDateSelected}
        >
          <Text style={styles.updateButtonText}>Mettre à jour</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
    paddingTop: 110,
  },
  description: {
    fontSize: 16,
    color: COLORS.dark,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  inputDisabled: {
    backgroundColor: "#e0e0e0",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UpdateCycleInfo;
