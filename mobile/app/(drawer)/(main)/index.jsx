import { handleHeaderScroll } from "@/hooks/useHeaderScroll";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "@/constants";
import i18n from "@/constants/i18n";
import BackgroundContainer from "@/components/background-container";
import { useTabBarSpace } from "@/components/MyTabBar";
import IndicationCalendar from "@/components/calendar/indication-calendar";
import { Calendar } from "react-native-calendars";
import { LocaleConfig, monthNames as calendarMonthNames } from "@/constants/calendarLocale";
import ReminderItem from "@/components/calendar/reminder-item";
import MonthYearPicker from "@/components/calendar/MonthYearPicker";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { observer, useSelector } from "@legendapp/state/react";
import {
  cycleMenstruelState,
  preferenceState,
  userState,
} from "@/legendstate/AmpelaStates";
import { useDiscoveryTheme } from "@/components/discovery";
import AccountPromoSheet from "@/components/AccountPromoSheet";
import {
  getOvulationDate,
  getFecundityPeriod,
  getMenstruationPeriod,
} from "@/utils/menstruationUtils";
import { useNavigation, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";


const Index = () => {
  const tabBarSpace = useTabBarSpace();
  const navigation = useNavigation();
  const user = useSelector(() => userState.get());
  const { theme, language } = useSelector(() => preferenceState.get());
  const { cyclesData } = useSelector(() => cycleMenstruelState.get());
  const discovery = useDiscoveryTheme();

  // Mois affiché par le calendrier ; modifiable par balayage ou via la
  // fenêtre mois/année ouverte en touchant le titre.
  const [visibleMonth, setVisibleMonth] = useState(() => moment().startOf("month"));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const monthNames = calendarMonthNames();

  const renderCalendarHeader = () => (
    <TouchableOpacity
      onPress={() => setMonthPickerOpen(true)}
      activeOpacity={0.7}
      style={styles.calendarHeader}
      accessibilityLabel={i18n.t("calendarPickMonth")}
    >
      <Text style={styles.calendarHeaderText}>
        {monthNames[visibleMonth.month()]} {visibleMonth.year()}
      </Text>
      <Ionicons name="chevron-down" size={16} color={discovery.accentColor} />
    </TouchableOpacity>
  );


  const cycles = useMemo(() => cyclesData || [], [cyclesData]);

  // Cycles à afficher pour le mois visible. Les cycles stockés font foi
  // (historique conservé lors d'une mise à jour + prédictions courantes) ;
  // au-delà de ce qui est stocké, on extrapole à chaque balayage, dans le
  // passé comme dans le futur, avec la durée de cycle actuelle.
  const cyclesForView = useMemo(() => {
    const cycleLength = Number(user?.cycleDuration) || 0;
    const menstruationLength = Number(user?.durationMenstruation) || 0;
    const stored = [...cycles].sort((a, b) =>
      a.startMenstruationDate.localeCompare(b.startMenstruationDate)
    );
    const firstStored = stored[0]?.startMenstruationDate ?? user?.lastMenstruationDate;
    const lastStored = stored[stored.length - 1]?.startMenstruationDate ?? firstStored;
    if (!cycleLength || !firstStored) return stored;

    const rangeStart = visibleMonth.clone().subtract(cycleLength, "days");
    const rangeEnd = visibleMonth.clone().endOf("month").add(cycleLength, "days");

    const buildCycle = (start) => {
      const startKey = start.format("YYYY-MM-DD");
      const ovulation = getOvulationDate(startKey, cycleLength);
      const fecundity = getFecundityPeriod(startKey, cycleLength);
      const next = getMenstruationPeriod(startKey, cycleLength, menstruationLength);
      return {
        month: start.format("MMMM YYYY"),
        startMenstruationDate: startKey,
        endMenstruationDate: start
          .clone()
          .add(Math.max(menstruationLength - 1, 0), "days")
          .format("YYYY-MM-DD"),
        ovulationDate: ovulation.ovulationDate,
        fecundityPeriodStart: fecundity.startFecondityDate,
        fecundityPeriodEnd: fecundity.endFecondityDate,
        nextMenstruationDate: next.nextMenstruationDate,
        nextMenstruationEndDate: next.nextMenstruationEndDate,
      };
    };

    const result = [...stored];
    // Avant le premier cycle connu
    let before = moment(firstStored).subtract(cycleLength, "days");
    while (before.isSameOrAfter(rangeStart)) {
      result.push(buildCycle(before));
      before = before.clone().subtract(cycleLength, "days");
    }
    // Après le dernier cycle connu
    let after = moment(lastStored).add(cycleLength, "days");
    while (after.isSameOrBefore(rangeEnd)) {
      result.push(buildCycle(after));
      after = after.clone().add(cycleLength, "days");
    }
    return result;
  }, [cycles, user?.cycleDuration, user?.durationMenstruation, user?.lastMenstruationDate, visibleMonth]);

  const markedDates = {};

  const generateMarkedDates = () => {
    cyclesForView.forEach((cycle) => {
      // FÉCONDITÉ
      let start = moment(cycle.fecundityPeriodStart);
      const end = moment(cycle.fecundityPeriodEnd);

      while (start.isSameOrBefore(end)) {
        markedDates[start.format("YYYY-MM-DD")] = {
          customStyles: {
            container: {
              backgroundColor:
                theme === "orange" ? COLORS.neutral250 : "#FFADAD",
            },
            text: { color: "#fff" },
          },
        };
        start = start.add(1, "day");
      }

      // OVULATION
      markedDates[cycle.ovulationDate] = {
        customStyles: {
          container: {
            borderStyle: "solid",
            borderColor: discovery.accentColor,
            borderWidth: 2,
          },
          text: { color: "#433C47" },
        },
      };

      // MENSTRUATIONS : du début à la fin propres à ce cycle, pour que
      // l'historique garde la durée de règles qu'il avait.
      let day = moment(cycle.startMenstruationDate);
      const lastDay = cycle.endMenstruationDate
        ? moment(cycle.endMenstruationDate)
        : day.clone().add(Math.max((user?.durationMenstruation || 1) - 1, 0), "days");
      while (day.isSameOrBefore(lastDay)) {
        const dateKey = day.format("YYYY-MM-DD");
        day = day.clone().add(1, "day");
        markedDates[dateKey] = {
          customStyles: {
            container: {
              backgroundColor: discovery.accentColor,
            },
            text: { color: "#fff" },
          },
        };
      }
    });
  };

  generateMarkedDates();

  return (
    // Le fond reste fixe : c'est le contenu qui défile par-dessus.
    <BackgroundContainer>
      <ScrollView
        onScroll={handleHeaderScroll}
        scrollEventThrottle={16}
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarSpace }]}
        showsVerticalScrollIndicator={false}
      >
          {/* Calendrier */}
          <View  style={[styles.calendarCard,{
                backgroundColor: discovery.surface,
              }]}>
            <Calendar
              // key : force le calendrier à sauter au mois choisi dans la
              // fenêtre (la prop `current` seule n'est lue qu'au montage).
              key={visibleMonth.format("YYYY-MM")}
              current={visibleMonth.format("YYYY-MM-DD")}
              onMonthChange={(m) =>
                setVisibleMonth(moment(m.dateString).startOf("month"))
              }
              renderHeader={renderCalendarHeader}
              disableAllTouchEventsForDisabledDays
              style={[styles.calendar]}
              theme={{
                textSectionTitleColor: "#B0B0B0",
                todayTextColor: discovery.accentColor,
                dayTextColor: "#4A434F",
                textDisabledColor: "#D8D8D8",
                arrowColor: discovery.accentColor,
                monthTextColor: "#433C47",
                textDayFontFamily: "Regular",
                textMonthFontFamily: "SBold",
                textDayHeaderFontFamily: "Regular",
                textDayFontSize: SIZES.medium,
                textMonthFontSize: SIZES.medium,
                textDayHeaderFontSize: SIZES.small,
              }}
              markedDates={markedDates}
              enableSwipeMonths
              markingType="custom"
            />
          </View>

          <MonthYearPicker
            visible={monthPickerOpen}
            month={visibleMonth.month()}
            year={visibleMonth.year()}
            monthNames={monthNames}
            onConfirm={(month, year) => {
              setVisibleMonth(moment({ year, month, day: 1 }));
              setMonthPickerOpen(false);
            }}
            onCancel={() => setMonthPickerOpen(false)}
          />

          {/* Légende */}
          <View style={styles.indications}>
            <IndicationCalendar title="Jours des règles" />
            <IndicationCalendar title="Ovulation" />
            <IndicationCalendar title="Période de fécondité" />
          </View>

          {/* Rappels */}
          <View style={[styles.reminderCard,{
                backgroundColor: discovery.surface,
              }]}>
            <Text style={styles.reminderTitle}>{i18n.t("rappels")}</Text>
            <View style={{ gap: 10 }}>
              <ReminderItem as="Début des règles" />
              <ReminderItem as="Jour d'ovulation" />
              <ReminderItem as="Prise de pilule" />
            </View>
          </View>
      </ScrollView>

      {/* Invitation à créer un compte (une fois par lancement, sans compte) */}
      <AccountPromoSheet />
    </BackgroundContainer>
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
    height:"100%"
  },
  contentContainer: {
    // paddingHorizontal: 20,
    // paddingBottom: 40,
  },
  calendarCard: {
    marginTop: 160,
    marginBottom: 20,
   
    borderRadius: 16,

    padding: 8,
  },
  calendar: {
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  indications: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  reminderTitle: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#433C47",
    marginBottom: 16,
  },
  reminderCard: {
    marginTop: 20,
    marginBottom: 140,
    padding: 16,
    borderRadius: 16,

  },
});

export default observer(Index);