import { useState, useCallback, useEffect, useLayoutEffect } from "react";
import { View, ScrollView, Text, StyleSheet, SafeAreaView } from "react-native";

import { COLORS, SIZES } from "../../constants";
import ReminderContent from "../../components/reminder-content";
import BackgroundContainer from "../../components/background-container";
import IndicationCalendar from "../../components/calendar/indication-calendar";
import { Calendar, LocaleConfig } from "react-native-calendars";
import ReminderItem from "../../components/calendar/reminder-item";

import AuthWithGoogle from "../../components/authWithGoogle/authWithGoogle";

import {
  getMenstruationPeriod,
  getFecundityPeriod,
  getOvulationDate,
} from "../../components/utils/menstruationUtils";
import { useSelector } from "react-redux";

LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNamesShort: [
    "Janv.",
    "Févr.",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
  dayNames: [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ],
  dayNamesShort: ["Di.", "Lu.", "Ma.", "Me.", "Je.", "Ve.", "Sa."],
  today: "Aujourd'hui",
};

LocaleConfig.defaultLocale = "fr";

const index = ({ navigation }) => {
  const [lastMentrualPeriodStartDate, setLastMentrualPeriodStartDate] =
    useState("2024-05-28");

  const user = useSelector((state) => state.user);
  const [cycleDurations, setCycleDurations] = useState(28);
  const [menstruationDurations, setMenstruationDurations] = useState(4);

  const [translateYOne, setTranslateYOne] = useState(1500);
  const [translateYTwo, setTranslateYTwo] = useState(1500);
  const [translateYThree, setTranslateYThree] = useState(1500);
  const [howmanytimeReminder1, setHowmanytimeReminder1] = useState("?");
  const [howmanytimeReminder2, setHowmanytimeReminder2] = useState("?");
  const [howmanytimeReminder3, setHowmanytimeReminder3] = useState("?");
  const [scrollDisabled, setScrollDisabled] = useState(true);

  const [time1, setTime1] = useState({
    hour: 0,
    minutes: 0,
  });
  const [time2, setTime2] = useState({
    hour: 0,
    minutes: 0,
  });
  const [time3, setTime3] = useState({
    hour: 0,
    minutes: 0,
  });

  const handleReminderBtnOnePress = useCallback(() => {
    setScrollDisabled(false);
    setTranslateYOne(0);
  }, []);
  const handleReminderBtnTwoPress = useCallback(() => {
    setScrollDisabled(false);
    setTranslateYTwo(0);
  }, []);
  const handleReminderBtnThreePress = useCallback(() => {
    setScrollDisabled(false);
    setTranslateYThree(0);
  }, []);

  const handleCloseIconOnePress = useCallback(() => {
    setScrollDisabled(true);
    setTranslateYOne(1500);
  }, []);
  const handleCloseIconTwoPress = useCallback(() => {
    setScrollDisabled(true);
    setTranslateYTwo(1500);
  }, []);
  const handleCloseIconThreePress = useCallback(() => {
    setScrollDisabled(true);
    setTranslateYThree(1500);
  });

  const handleRegisterButtonPress = useCallback(
    (type, hour, minutes, active) => {
      setScrollDisabled(true);
      switch (type) {
        case "Début des règles":
          setTime1({ ...time1, hour: hour, minutes: minutes });
          setHowmanytimeReminder1(active);
          setTranslateYOne(1500);
          break;
        case "Jour d'ovulation":
          setTime2({ ...time2, hour: hour, minutes: minutes });
          setHowmanytimeReminder2(active);
          setTranslateYTwo(1500);
          break;
        case "Prise de pillule":
          setTime3({ ...time3, hour: hour, minutes: minutes });
          setHowmanytimeReminder3(active);
          setTranslateYThree(1500);
          break;
        default:
          return null;
      }
    },
    []
  );

  useLayoutEffect();
  return (
    <SafeAreaView className="h-full flex-1 ">
      <ScrollView
        scrollEnabled={scrollDisabled}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* <View style={styles.authwithgoogleContainer}>
          <AuthWithGoogle />
        </View> */}
        <BackgroundContainer>
          <Text
            style={styles.title}
            // onPress={() => navigation.navigate("Screen")}
          ></Text>
          <View style={styles.calendar}>
            <Calendar
              style={{
                height: 380,
                borderRadius: 8,
                // backgroundColor: "rgba(255, 255, 255, .5)",
              }}
              theme={{
                textSectio0nTitleColor: COLORS.neutral400,
                todayTextColor: COLORS.primary,
                dayTextColor: "#2d4150",
                textDisabledColor: COLORS.neutral400,
                arrowColor: COLORS.primary,
                monthTextColor: COLORS.primary,
                textDayFontFamily: "Regular",
                textMonthFontFamily: "SBold",
                textDayHeaderFontFamily: "Regular",
                textDayFontSize: SIZES.medium,
                textMonthFontSize: SIZES.large,
                textDayHeaderFontSize: SIZES.medium,
              }}
              onDayPress={(day) => {
                // //.log(day.dateString);
              }}
              enableSwipeMonths={true}
              onMonthChange={(month) => handleMonthChange(month)}
              markingType="custom"
            />
          </View>
          <View style={styles.indications}>
            <IndicationCalendar title="Jours des règles" />
            <IndicationCalendar title="Ovulation" />
            <IndicationCalendar title="Période de fécondité" />
          </View>
          <View
            style={[
              styles.reminder,
              {
                backgroundColor:
                  true === "pink"
                    ? "rgba(255, 255, 255, .5)"
                    : "rgba(238, 220, 174, .5)",
              },
            ]}
          >
            <Text style={styles.reminderTitle}>rappels</Text>
            <View
              style={{
                gap: 10,
              }}
            >
              <ReminderItem
                as="Début des règles"
                onPress={handleReminderBtnOnePress}
                time={time1}
                howmanytimeReminder={howmanytimeReminder1}
              />
              <ReminderItem
                as="Jour d'ovulation"
                onPress={handleReminderBtnTwoPress}
                time={time2}
                howmanytimeReminder={howmanytimeReminder2}
              />
              <ReminderItem
                as="Prise de pillule"
                onPress={handleReminderBtnThreePress}
                time={time3}
                howmanytimeReminder={howmanytimeReminder3}
              />
            </View>
          </View>
        </BackgroundContainer>
      </ScrollView>
      <View
        style={[
          styles.reminderContainer,
          {
            transform: [
              // to fix
              { translateY: translateYOne },
            ],
          },
        ]}
      >
        <ReminderContent
          onCloseIconPress={handleCloseIconOnePress}
          pills={false}
          type="Début des règles"
          onRegisterButtonPress={handleRegisterButtonPress}
        />
      </View>
      <View
        style={[
          styles.reminderContainer,
          {
            transform: [
              // to fix
              { translateY: translateYTwo },
            ],
          },
        ]}
      >
        <ReminderContent
          onCloseIconPress={handleCloseIconTwoPress}
          pills={false}
          type="Jour d'ovulation"
          onRegisterButtonPress={handleRegisterButtonPress}
        />
      </View>
      <View
        style={[
          styles.reminderContainer,
          {
            transform: [
              // to fix
              { translateY: translateYThree },
            ],
          },
        ]}
      >
        <ReminderContent
          onCloseIconPress={handleCloseIconThreePress}
          pills={true}
          type="Prise de pillule"
          onRegisterButtonPress={handleRegisterButtonPress}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  authwithgoogleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    height: "100%",
  },
  reminderContainer: {
    position: "absolute",
    alignItems: "center",
    paddingTop: "50%",
    // justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, .3)",
    top: 0,
    right: -20,
    left: -20,
    bottom: 0,
    zIndex: 999,
  },
  title: {
    fontFamily: "Bold",
    // fontSize: RFValue(SIZES.xLarge),
    textAlign: "center",
    marginTop: 60,
  },
  calendar: {
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  indications: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  reminderTitle: {
    fontFamily: "SBold",
    // fontSize: RFValue(SIZES.large),
    marginBottom: 20,
  },
  reminder: {
    marginTop: 20,
    marginBottom: 100,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});

export default index;
