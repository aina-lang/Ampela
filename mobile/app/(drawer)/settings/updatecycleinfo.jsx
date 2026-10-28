import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import i18n from "@/constants/i18n";
import { monthNames as calendarMonthNames } from "@/constants/calendarLocale";
import MonthYearPicker from "@/components/calendar/MonthYearPicker";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
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
import { scheduleSync } from "@/services/sync";
import { rescheduleAllReminders } from "@/services/reminders";
import { useDiscoveryTheme } from "@/components/discovery";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import { ResponseOfQuestion0, ResponseOfQuestion1 } from "@/components/response-of-question";
import ModernButton from "@/components/ModernButton";

const UpdateCycleInfo = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  // Durées en jours (nombres) ; le libellé « N jours » est traduit à l'affichage.
  const [periodDuration, setPeriodDuration] = useState(null);
  const [cycleDuration, setCycleDuration] = useState(null);
  const dayLabel = (n) => `${n} ${i18n.t("jours")}`;
  const { theme } = useSelector(() => preferenceState.get());
  const user = useSelector(() => userState.get());
  const [saving, setSaving] = useState(false);
  const isDateSelected = !!selectedDate;
  const { surface, accentColor, accentColorDisabled } = useDiscoveryTheme();

  // Les dernières règles peuvent dater de plusieurs mois : aucune date
  // minimale, seulement « pas dans le futur ». Le mois affiché se choisit
  // par balayage ou via la fenêtre mois/année du titre, comme à l'accueil.
  const todayString = moment().format("YYYY-MM-DD");
  const [visibleMonth, setVisibleMonth] = useState(() => moment().startOf("month"));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleUpdateCycleInfo = async () => {
    if (!selectedDate) {
      Alert.alert(i18n.t("erreur"), i18n.t("cycleUpdatePickDate"));
      return;
    }

    if (!cycleDuration) {
      Alert.alert(i18n.t("erreur"), i18n.t("cycleUpdateNeedCycle"));
      return;
    }

    if (!periodDuration) {
      Alert.alert(i18n.t("erreur"), i18n.t("cycleUpdateNeedPeriod"));
      return;
    }

    const periodNum = Number(periodDuration);
    const cycleNum = Number(cycleDuration);

    if (periodNum > 8) {
      Alert.alert(i18n.t("erreur"), i18n.t("cycleUpdatePeriodMax"));
      return;
    }

    if (periodNum < 1) {
      Alert.alert(i18n.t("erreur"), i18n.t("cycleUpdatePeriodMin"));
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
      updateUser(updatedUser, { touch: true });
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
      updateCycleMenstruelData(refreshedCycles, { touch: true });

      // Les rappels « règles » et « ovulation » actifs suivent les nouvelles dates.
      rescheduleAllReminders(refreshedCycles).catch((error) =>
        console.error("Reminder reschedule failed:", error)
      );

      // 5. Compte connecté : profil et cycles partent dans le cloud (sans bloquer).
      if (isSignedIn()) {
        scheduleSync();
      }

      toast.success(i18n.t("cycleUpdateSaved"));
      navigation.goBack();
    } catch (error) {
      toast.error(i18n.t("cycleUpdateFailed"));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const periodDurations = Array.from({ length: 8 }, (_, i) => i + 1);
  const cycleDurations = Array.from({ length: 26 }, (_, i) => i + 20);

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <DecorativeBlobs />
      <AppHeader navigation={navigation} title={i18n.t("cycleUpdateTitle")} showBack absolute />
      <ScrollView
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.description}>{i18n.t("cycleUpdateDescription")}</Text>
        <DiscoveryCard style={styles.calendarCard}>
          <Calendar
            key={visibleMonth.format("YYYY-MM")}
            current={visibleMonth.format("YYYY-MM-DD")}
            onMonthChange={(m) => setVisibleMonth(moment(m.dateString).startOf("month"))}
            renderHeader={() => (
              <TouchableOpacity
                onPress={() => setMonthPickerOpen(true)}
                activeOpacity={0.7}
                style={styles.calendarHeader}
                accessibilityLabel={i18n.t("calendarPickMonth")}
              >
                <Text style={styles.calendarHeaderText}>
                  {calendarMonthNames()[visibleMonth.month()]} {visibleMonth.year()}
                </Text>
                <Ionicons name="chevron-down" size={16} color={accentColor} />
              </TouchableOpacity>
            )}
            enableSwipeMonths
            onDayPress={handleDayPress}
            maxDate={todayString}
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

        <MonthYearPicker
          visible={monthPickerOpen}
          month={visibleMonth.month()}
          year={visibleMonth.year()}
          monthNames={calendarMonthNames()}
          onConfirm={(month, year) => {
            setVisibleMonth(moment({ year, month, day: 1 }));
            setMonthPickerOpen(false);
          }}
          onCancel={() => setMonthPickerOpen(false)}
        />

        <Text style={styles.chipLabel}>{i18n.t("accountPeriodLength")}</Text>
        <FlatList
          data={periodDurations}
          keyExtractor={(item) => String(item)}
          renderItem={({ item }) => (
            <ResponseOfQuestion0
              text={dayLabel(item)}
              active={periodDuration === item}
              onPress={() => setPeriodDuration(item)}
              accentColor={accentColor}
            />
          )}
          contentContainerStyle={styles.chipList}
          showsHorizontalScrollIndicator={false}
          horizontal
        />

        <Text style={styles.chipLabel}>{i18n.t("accountCycleLength")}</Text>
        <FlatList
          data={cycleDurations}
          keyExtractor={(item) => String(item)}
          renderItem={({ item }) => (
            <ResponseOfQuestion1
              text={dayLabel(item)}
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
          title={i18n.t("cycleUpdateButton")}
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
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  calendarHeaderText: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#433C47",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: HEADER_HEIGHT + 16,
    paddingBottom: 40,
  },
  description: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#7A737F",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
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
