import { useState } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "@/constants";
import BackgroundContainer from "@/components/background-container";
import IndicationCalendar from "@/components/calendar/indication-calendar";
import { Calendar, LocaleConfig } from "react-native-calendars";
import ReminderItem from "@/components/calendar/reminder-item";
import moment from "moment";
import { observer, useSelector } from "@legendapp/state/react";
import {
  cycleMenstruelState,
  preferenceState,
  userState,
} from "@/legendstate/AmpelaStates";
import i18n from "@/constants/i18n";

LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ],
  monthNamesShort: [
    "Janv.", "Févr.", "Mars", "Avril", "Mai", "Juin",
    "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc.",
  ],
  dayNames: [
    "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
  ],
  dayNamesShort: ["Di.", "Lu.", "Ma.", "Me.", "Je.", "Ve.", "Sa."],
  today: "Aujourd'hui",
};

LocaleConfig.locales["mg"] = {
  monthNames: [
    "Janoary", "Febroary", "Martsa", "Aprily", "May", "Jona",
    "Jolay", "Aogositra", "Septambra", "Oktobra", "Novambra", "Desambra",
  ],
  monthNamesShort: [
    "Jan.", "Febr.", "Mar.", "Apr.", "May", "Jona",
    "Jolay.", "Aogo.", "Sept.", "Oct.", "Nov.", "Des.",
  ],
  dayNames: [
    "Alahady", "Alatsinainy", "Talata", "Alarobia", "Alakamisy", "Zoma", "Sabotsy",
  ],
  dayNamesShort: ["Alh.", "Alt.", "Tal.", "Alr.", "Alk.", "Zo.", "Sa."],
  today: "Androany",
};

const index = () => {
  const user = useSelector(() => userState.get());
  const { theme, language } = useSelector(() => preferenceState.get());
  const { cyclesData } = useSelector(() => cycleMenstruelState.get());

  const [howmanytimeReminder1, setHowmanytimeReminder1] = useState("quotidien");
  const [howmanytimeReminder2, setHowmanytimeReminder2] = useState("quotidien");
  const [howmanytimeReminder3, setHowmanytimeReminder3] = useState("quotidien");
  const [scrollDisabled, setScrollDisabled] = useState(true);
  const [time1, setTime1] = useState({ hour: 0, minutes: 0 });
  const [time2, setTime2] = useState({ hour: 0, minutes: 0 });
  const [time3, setTime3] = useState({ hour: 0, minutes: 0 });

  i18n.defaultLocale = "fr";
  i18n.locale = language || i18n.defaultLocale;
  LocaleConfig.defaultLocale = language || "fr";

  // TODO: brancher la vraie logique d'ouverture de modal de rappel
  // (setReminderInfo / setReminderModalIsVisible n'existaient pas dans ce composant)
  const handleReminderBtnOnePress = () => {
    console.warn("Modal de rappel non branché : Début des règles");
  };
  const handleReminderBtnTwoPress = () => {
    console.warn("Modal de rappel non branché : Jour d'ovulation");
  };
  const handleReminderBtnThreePress = () => {
    console.warn("Modal de rappel non branché : Prise de pilule");
  };

  // TODO: brancher dispatch / notifications réelles
  // (dispatch, setTranslateYOne/Two/Three n'existaient pas dans ce composant)
  const handleRegisterButtonPress = (type, hour, minutes, active) => {
    setScrollDisabled(true);
    switch (type) {
      case "Début des règles":
        setTime1({ hour, minutes });
        setHowmanytimeReminder1(active);
        break;
      case "Jour d'ovulation":
        setTime2({ hour, minutes });
        setHowmanytimeReminder2(active);
        break;
      case "Prise de pillule":
        setTime3({ hour, minutes });
        setHowmanytimeReminder3(active);
        break;
      default:
        return;
    }
  };

  const cycles = cyclesData || [];
  const markedDates = {};

  const generateMarkedDates = () => {
    cycles.forEach((cycle) => {
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
            borderColor: theme === "orange" ? COLORS.accent800 : "#FF7575",
            borderWidth: 2,
          },
          text: { color: "#000" },
        },
      };

      // MENSTRUATIONS
      for (let i = 0; i < (user?.durationMenstruation || 0); i++) {
        const dateKey = moment(cycle.startMenstruationDate)
          .add(i, "days")
          .format("YYYY-MM-DD");
        markedDates[dateKey] = {
          customStyles: {
            container: {
              backgroundColor: theme === "orange" ? COLORS.accent800 : "#FF7575",
            },
            text: { color: "#fff" },
          },
        };
      }
    });
  };

  generateMarkedDates();

  return (

      <ScrollView
        scrollEnabled={scrollDisabled}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <BackgroundContainer>
          {/* Calendrier */}
          <View style={styles.calendarCard}>
            <Calendar
              disableAllTouchEventsForDisabledDays
              style={styles.calendar}
              theme={{
                textSectionTitleColor: "#B0B0B0",
                todayTextColor: "#FF7575",
                dayTextColor: "#2D2D2D",
                textDisabledColor: "#D8D8D8",
                arrowColor: "#FF7575",
                monthTextColor: "#1A1A1A",
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

          {/* Légende */}
          <View style={styles.indications}>
            <IndicationCalendar title="Jours des règles" />
            <IndicationCalendar title="Ovulation" />
            <IndicationCalendar title="Période de fécondité" />
          </View>

          {/* Rappels */}
          <View style={styles.reminderCard}>
            <Text style={styles.reminderTitle}>Rappels</Text>
            <View style={{ gap: 10 }}>
              <ReminderItem
  as="Début des règles"
  time={time1}
  howmanytimeReminder={howmanytimeReminder1}
  onRegister={handleRegisterButtonPress}
/>
<ReminderItem
  as="Jour d'ovulation"
  time={time2}
  howmanytimeReminder={howmanytimeReminder2}
  onRegister={handleRegisterButtonPress}
/>
<ReminderItem
  as="Prise de pillule"
  time={time3}
  howmanytimeReminder={howmanytimeReminder3}
  onRegister={handleRegisterButtonPress}
/>
            </View>
          </View>
        </BackgroundContainer>
      </ScrollView>
    
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
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
    color: "#1A1A1A",
    marginBottom: 16,
  },
  reminderCard: {
    marginTop: 20,
    marginBottom: 140,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
});

export default observer(index);