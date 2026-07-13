import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { COLORS, SIZES } from "@/constants";
import AppHeader from "@/components/AppHeader";
import { useNavigation } from "expo-router";
import { preferenceState } from "@/legendstate/AmpelaStates";
import {
  deleteCycleById,
  addCycleMenstruel,
  getAllCycle,
} from "@/services/database";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import { ResponseOfQuestion0, ResponseOfQuestion1 } from "@/components/response-of-question";
import ModernButton from "@/components/ModernButton";

const UpdateCycleInfo = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [periodDuration, setPeriodDuration] = useState("");
  const [cycleDuration, setCycleDuration] = useState("");
  const { theme } = preferenceState.get();
  const isDateSelected = !!selectedDate;
  const { surface, accentColor, accentColorDisabled } = useDiscoveryTheme();

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

    const periodNum = parseInt(periodDuration.split(" ")[0], 10);
    const cycleNum = parseInt(cycleDuration.split(" ")[0], 10);

    if (periodNum > 8) {
      Alert.alert("Erreur", "La durée des règles ne peut pas dépasser 8 jours");
      return;
    }

    if (periodNum < 1) {
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
        endMenstruationDate.getDate() + periodNum - 1
      );

      const nextMenstruationStartDate = new Date(startMenstruationDate);
      nextMenstruationStartDate.setDate(
        nextMenstruationStartDate.getDate() + cycleNum
      );

      const nextMenstruationEndDate = new Date(nextMenstruationStartDate);
      nextMenstruationEndDate.setDate(
        nextMenstruationEndDate.getDate() + periodNum - 1
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

  const periodDurations = [];
  const cycleDurations = [];
  for (let i = 1; i <= 8; i++) {
    periodDurations.push(i + " jours");
  }
  for (let i = 20; i <= 45; i++) {
    cycleDurations.push(i + " jours");
  }

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <AppHeader navigation={navigation} title="Modification" showBack absolute />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.description}>
          Choisissez une date du mois précédent pour mettre à jour l'information
          du cycle. Ce date sera le début des règles du dernier cycle
        </Text>
        <DiscoveryCard style={styles.calendarCard}>
          <Calendar
            onDayPress={handleDayPress}
            minDate={getFirstDayOfLastMonth().toISOString().split("T")[0]}
            maxDate={getLastDayOfLastMonth().toISOString().split("T")[0]}
            markedDates={{
              [selectedDate]: {
                selected: true,
                marked: true,
                selectedColor: accentColor,
              },
            }}
            theme={{
              selectedDayBackgroundColor: accentColor,
              todayTextColor: accentColor,
              arrowColor: accentColor,
            }}
          />
        </DiscoveryCard>

        <Text style={styles.chipLabel}>Durée des règles</Text>
        <FlatList
          data={periodDurations}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ResponseOfQuestion0
              text={item}
              active={periodDuration === item}
              onPress={() => setPeriodDuration(item)}
              accentColor={accentColor}
            />
          )}
          contentContainerStyle={styles.chipList}
          showsHorizontalScrollIndicator={false}
          horizontal
        />

        <Text style={styles.chipLabel}>Durée du cycle</Text>
        <FlatList
          data={cycleDurations}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ResponseOfQuestion1
              text={item}
              active={cycleDuration === item}
              onPress={() => setCycleDuration(item)}
              accentColor={accentColor}
            />
          )}
          contentContainerStyle={styles.chipList}
          showsHorizontalScrollIndicator={false}
          horizontal
        />

        <ModernButton
          title="Mettre à jour"
          onPress={handleUpdateCycleInfo}
          disabled={!isDateSelected || !periodDuration || !cycleDuration}
          accentColor={accentColor}
          accentColorDisabled={accentColorDisabled}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 200,
    paddingBottom: 40,
  },
  description: {
    fontSize: 16,
    color: COLORS.dark,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 30,
  },
  calendarCard: {
    marginBottom: 20,
  },
  chipLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#3A3A3A",
    marginBottom: 10,
  },
  chipList: {
    gap: 10,
    paddingRight: 10,
    marginBottom: 20,
  },
});

export default UpdateCycleInfo;
