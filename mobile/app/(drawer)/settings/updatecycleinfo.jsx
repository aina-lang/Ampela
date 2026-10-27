import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { DecorativeBlobs, toast } from "@/components/ui";
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
import AppHeader, { HEADER_HEIGHT } from "@/components/AppHeader";
import { useNavigation } from "expo-router";
import {
  preferenceState,
  userState,
  updateUser,
  updateCycleMenstruelData,
} from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import {
  deleteCycleById,
  addCyclesMenstruels,
  getAllCycle,
  updateUserSqlite,
} from "@/services/database";
import { generateCycleMenstrualData } from "@/utils/menstruationUtils";
import { isSignedIn } from "@/services/api";
import { syncCycles } from "@/services/sync";
import { pushProfileToCloud } from "@/services/otpAuth";
import { rescheduleAllReminders } from "@/services/reminders";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import { ResponseOfQuestion0, ResponseOfQuestion1 } from "@/components/response-of-question";
import ModernButton from "@/components/ModernButton";

const UpdateCycleInfo = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [periodDuration, setPeriodDuration] = useState("");
  const [cycleDuration, setCycleDuration] = useState("");
  const { theme } = useSelector(() => preferenceState.get());
  const user = useSelector(() => userState.get());
  const [saving, setSaving] = useState(false);
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

    setSaving(true);
    try {
      // 1. Historique conservé : seuls les cycles qui commencent à partir
      //    de la nouvelle date de règles sont supprimés puis recalculés.
      //    Les cycles antérieurs gardent leurs anciennes durées.
      const allCycles = await getAllCycle();
      const obsolete = allCycles.filter(
        (cycle) => cycle.startMenstruationDate >= selectedDate
      );
      for (const cycle of obsolete) {
        await deleteCycleById(cycle.id);
      }

      // 2. Nouveaux paramètres de l'utilisatrice (état + base locale).
      const updatedUser = {
        ...user,
        lastMenstruationDate: selectedDate,
        cycleDuration: cycleNum,
        durationMenstruation: periodNum,
      };
      updateUser(updatedUser);
      await updateUserSqlite(
        updatedUser.id,
        updatedUser.username,
        updatedUser.profession,
        updatedUser.lastMenstruationDate,
        updatedUser.durationMenstruation,
        updatedUser.cycleDuration,
        updatedUser.email,
        updatedUser.profileImage
      );

      // 3. Douze cycles recalculés à partir de la nouvelle date, avec le
      //    même générateur que l'onboarding.
      const cycleData = generateCycleMenstrualData(selectedDate, cycleNum, periodNum);
      await addCyclesMenstruels(
        cycleData.map((cycle) => ({
          month: cycle.month,
          ovulationDate: cycle.ovulationDate,
          fecundityPeriodStart: cycle.fecundityPeriodStart,
          fecundityPeriodEnd: cycle.fecundityPeriodEnd,
          startMenstruationDate: cycle.startMenstruationDate,
          endMenstruationDate: cycle.endMenstruationDate,
          nextMenstruationStartDate: cycle.nextMenstruationDate,
          nextMenstruationEndDate: cycle.nextMenstruationEndDate,
        }))
      );

      // 4. Le calendrier de l'accueil lit cet état : historique + nouveaux cycles.
      const refreshedCycles = await getAllCycle();
      updateCycleMenstruelData(refreshedCycles);

      // Les rappels « règles » et « ovulation » actifs suivent les nouvelles dates.
      rescheduleAllReminders(refreshedCycles).catch((error) =>
        console.error("Reminder reschedule failed:", error)
      );

      // 5. Compte connecté : profil et cycles partent dans le cloud (sans bloquer).
      if (isSignedIn()) {
        Promise.all([pushProfileToCloud(), syncCycles()]).catch((error) =>
          console.error("Cycle sync failed:", error)
        );
      }

      toast.success("Informations du cycle mises à jour.");
      navigation.goBack();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour du cycle.");
      console.error(error);
    } finally {
      setSaving(false);
    }
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
      <DecorativeBlobs />
      <AppHeader navigation={navigation} title="Modification" showBack absolute />
      <ScrollView
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.description}>
          Choisissez une date du mois précédent pour mettre à jour l’information
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
          disabled={!isDateSelected || !periodDuration || !cycleDuration || saving}
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
    paddingTop: HEADER_HEIGHT + 16,
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
    color: "#5A525F",
    marginBottom: 10,
  },
  chipList: {
    gap: 10,
    paddingRight: 10,
    marginBottom: 20,
  },
});

export default UpdateCycleInfo;
