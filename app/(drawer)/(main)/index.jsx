import { useState, useLayoutEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Pressable,
} from "react-native";

import { COLORS, SIZES } from "@/constants";
import ReminderContent from "@/components/reminder-content";
import BackgroundContainer from "@/components/background-container";
import IndicationCalendar from "@/components/calendar/indication-calendar";
import { Calendar, LocaleConfig } from "react-native-calendars";
import ReminderItem from "@/components/calendar/reminder-item";
import AuthWithGoogle from "@/components/authWithGoogle/authWithGoogle";
import { useSelector } from "react-redux";
import { useNavigation } from "expo-router";
import moment from "moment";
import { generateCycleMenstrualData } from "@/utils/menstruationUtils";

const index = () => {
  const user = useSelector((state) => state.user);
  const navigation = useNavigation();
  const [howmanytimeReminder1, setHowmanytimeReminder1] = useState("?");
  const [howmanytimeReminder2, setHowmanytimeReminder2] = useState("?");
  const [howmanytimeReminder3, setHowmanytimeReminder3] = useState("?");
  const [scrollDisabled, setScrollDisabled] = useState(true);
  const [reminderModalIsVisible, setReminderModalIsVisible] = useState(false);
  const [reminderInfo, setReminderInfo] = useState({ as: "", time: "" });
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
  
  LocaleConfig.locales["mg"] = {
    monthNames: [
      "Janoary",
      "Febroary",
      "Martsa",
      "Aprily",
      "May",
      "Jona",
      "Jolay",
      "Aogositra",
      "Septambra",
      "Oktobra",
      "Novambra",
      "Desambra",
    ],
    monthNamesShort: [
      "Jan.",
      "Febr.",
      "Mar.",
      "Apr.",
      "May",
      "Jona",
      "Jolay.",
      "Aogo.",
      "Sept.",
      "Oct.",
      "Nov.",
      "Des.",
    ],
    dayNames: [
      "Alahady",
      "Alatsinainy",
      "Talata",
      "Alarobia",
      "Alakamisy",
      "Zoma",
      "Sabotsy",
    ],
    dayNamesShort: ["Alh.", "Alt.", "Tal.", "Alr.", "Alk.", "Zo.", "Sa."],
    today: "Androany",
  };
  
  LocaleConfig.defaultLocale = "fr";

  const handleReminderBtnOnePress = () => {
    setReminderInfo({ as: "Début des règles" });
    setReminderModalIsVisible(true);
  };

  const handleReminderBtnTwoPress = () => {
    setReminderInfo({ as: "Jour d'ovulation" });
    setReminderModalIsVisible(true);
  };

  const handleReminderBtnThreePress = () => {
    setReminderInfo({ as: "Prise de pillule" });
    setReminderModalIsVisible(true);
  };

  const handleCloseIconOnePress = () => {};

  const handleCloseIconTwoPress = () => {};

  const handleCloseIconThreePress = () => {};

  const handleRegisterButtonPress = (type, hour, minutes, active) => {
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
  };
  const cycles = useSelector((state) => state.cycleMenstruel.cyclesData);

  const markedDates = {};

  const generateMarkedDates = () => {
    cycles.forEach((cycle) => {
      for (let i = 0; i < user.durationMenstruation; i++) {
        // console.log(cycle);

        markedDates[
          moment(cycle.startMenstruationDate)
            .add(i, "days")
            .format("YYYY-MM-DD")
        ] = {
          customStyles: {
            container: {
              backgroundColor: "#E2445C",
            },
            text: {
              color: "#fff",
            },
          },
        };
      }

      // Parcourir entre le startfecondity et endfecondity day pour pouvoir les marquer
      let start = moment(cycle.fecundityPeriodStart);
      let end = moment(cycle.fecundityPeriodEnd);

      while (start <= end) {
        markedDates[start.format("YYYY-MM-DD")] = {
          customStyles: {
            container: {
              backgroundColor: "#FFADAD",
            },
            text: {
              color: "#fff",
            },
          },
        };
        start = start.add(1, "day");
      }

      markedDates[cycle.ovulationDate] = {
        customStyles: {
          container: {
            borderStyle: "solid",
            borderColor: "#E2445C",
            borderWidth: 2,
          },
          text: {
            color: "#000",
          },
        },
        // selected: true,
      };
    });

    // return markedDates;
  };

  generateMarkedDates();
  return (
    <>
      {reminderModalIsVisible == true && (
        <Pressable
          className="absolute z-50 bg-black/40"
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: SIZES.width,
          }}
          onPress={() => setReminderModalIsVisible(false)}
        >
          <ReminderContent
            onCloseIconPress={handleCloseIconOnePress}
            pills={false}
            type={reminderInfo.as}
            onRegisterButtonPress={handleRegisterButtonPress}
          />
        </Pressable>
      )}

      {/* <Animated.View
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: SIZES.height,
          width: SIZES.width,
        }}
        className="absolute z-50 bg-black/40 top-0 flex-1"
      >
        <AuthWithGoogle className="z-50" />
      </Animated.View> */}

      <ScrollView
        scrollEnabled={scrollDisabled}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <BackgroundContainer>
          {/* <Text
            style={styles.title}
            // onPress={() => navigation.navigate("Screen")}
          >{}</Text> */}
          <View style={styles.calendar}>
            <Calendar
              minDate={"2024-05-15"}
              disableAllTouchEventsForDisabledDays={true}
              initialDate={"2024-05-15"}
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
              // markedDates={generateMarkedDates()}
              // markedDates={{ "2024-05-30": { selected: true, color: "blue" } }}
              markedDates={markedDates}
              enableSwipeMonths={true}
              // onMonthChange={(month) => handleMonthChange(month)}
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
                  "pink" === "pink"
                    ? "rgba(255, 255, 255, .5)"
                    : "rgba(238, 220, 174, .5)",
              },
            ]}
            className="p-2"
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
    </>
  );
};

const styles = StyleSheet.create({
  authwithgoogleContainer: {
    // position: "absolute",
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
    // backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    height: "100%",
  },
  reminderContainer: {
    position: "absolute",
    alignItems: "center",
    paddingTop: "50%",
    // justifyContent: "center",
    // backgroundColor: "rgba(0, 0, 0, .3)",
    top: 0,
    right: -20,
    left: -20,
    bottom: 0,
    zIndex: 999,
  },
  title: {
    fontFamily: "Bold",

    textAlign: "center",
    marginTop: 60,
  },
  calendar: {
    marginTop: 50,
    marginBottom: 20,
  },
  indications: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  reminderTitle: {
    fontFamily: "SBold",
    fontSize: 17,
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
