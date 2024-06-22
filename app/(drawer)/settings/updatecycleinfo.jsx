import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
  TextInput,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { COLORS, SIZES } from "@/constants";
import HeaderWithGoBack from "@/components/header-with-go-back";
import { useNavigation } from "expo-router";
import {
  ResponseOfQuestion0,
  ResponseOfQuestion1,
} from "@/components/response-of-question";

const durationMenstruations = [];
const cycleDurations = [];

for (let i = 2; i < 46; i++) {
  let text = null;
  if (i > 2 && i < 8) {
    text = i + " jours";
    durationMenstruations.push(text);
  }
  if (i > 20 && i < 46) {
    text = i + " jours";
    cycleDurations.push(text);
  }
}

const UpdateCycleInfo = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [cycleDuration, setCycleDuration] = useState("");
  const [periodDuration, setPeriodDuration] = useState("");
  const [response0, setResponse0] = useState(durationMenstruations[0]);
  const [response1, setResponse1] = useState(cycleDurations[0]);

  const handleResponsePress0 = (item) => {
    if (selectedDate) setResponse0(item);
  };

  const handleResponsePress1 = (item) => {
    if (selectedDate) setResponse1(item);
  };

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

  const handleUpdateCycleInfo = () => {
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

    Alert.alert(
      "Succès",
      `Information du cycle mise à jour pour la date: ${selectedDate}\nDurée du cycle: ${cycleDuration}\nDurée des règles: ${periodDuration}`
    );
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <HeaderWithGoBack
        title="Mettre à jour l'information du cycle"
        navigation={navigation}
      />
      <ScrollView
        style={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Choisissez une date du mois précédent pour mettre à jour l'information
          du cycle.
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

        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-md p-2 "
          keyboardType="numeric"
          defaultValue="2"
          placeholder="Entrez un vouveau durée des  regles"
          maxLength={1}
        />
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-md p-2 mt-3"
          keyboardType="numeric"
          defaultValue="20"
          placeholder="Entrez un vouveau durée des  cycles"
          maxLength={2}
        />

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdateCycleInfo}
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
  },
  label: {
    fontSize: 14,
    color: COLORS.dark,
    marginVertical: 10,
    marginLeft: 10,
  },
  flatList: {
    width: SIZES.width,
    padding: 10,
    paddingRight: 20,
    height: 70,
  },
  updateButton: {
    backgroundColor: COLORS.accent500,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 120,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UpdateCycleInfo;
