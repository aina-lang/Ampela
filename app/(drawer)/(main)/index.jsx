import { useState, useRef, useCallback, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  Button,
} from "react-native";

import { COLORS, SIZES } from "@/constants";
import ReminderContent from "@/components/reminder-content";
import BackgroundContainer from "@/components/background-container";
import IndicationCalendar from "@/components/calendar/indication-calendar";
import { Calendar, LocaleConfig } from "react-native-calendars";
import ReminderItem from "@/components/calendar/reminder-item";
import { useSelector } from "react-redux";
import { useNavigation } from "expo-router";
import moment from "moment";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { ThemeContext } from "@/hooks/theme-context";

const index = () => {
  const user = useSelector((state) => state.user);
  const navigation = useNavigation();
  const [howmanytimeReminder1, setHowmanytimeReminder1] = useState("?");
  const [howmanytimeReminder2, setHowmanytimeReminder2] = useState("?");
  const [howmanytimeReminder3, setHowmanytimeReminder3] = useState("?");
  const [scrollDisabled, setScrollDisabled] = useState(true);
  const [reminderModalIsVisible, setReminderModalIsVisible] = useState(false);
  const [reminderInfo, setReminderInfo] = useState({ as: "", time: "" });
  const { theme } = useContext(ThemeContext);
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

  const handleRegisterButtonPress = (type, hour, minutes, active) => {
    setScrollDisabled(true);
    switch (type) {
      case "Début des règles":
        setTime1({ ...time1, hour: hour, minutes: minutes });
        setHowmanytimeReminder1(active);
        dispatch(scheduleMenstruationNotifications());
        setTranslateYOne(1500);
        break;
      case "Jour d'ovulation":
        setTime2({ ...time2, hour: hour, minutes: minutes });
        setHowmanytimeReminder2(active);
        dispatch(scheduleOvulationNotifications());
        setTranslateYTwo(1500);
        break;
      case "Prise de pillule":
        setTime3({ ...time3, hour: hour, minutes: minutes });
        setHowmanytimeReminder3(active);
        dispatch(schedulePillNotifications());
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
        markedDates[
          moment(cycle.startMenstruationDate)
            .add(i, "days")
            .format("YYYY-MM-DD")
        ] = {
          customStyles: {
            container: {
              backgroundColor:
                theme === "orange" ? COLORS.accent800 : COLORS.accent600,
            },
            text: {
              color: "#fff",
            },
          },
        };
      }

      let start = moment(cycle.fecundityPeriodStart);
      let end = moment(cycle.fecundityPeriodEnd);

      while (start <= end) {
        markedDates[start.format("YYYY-MM-DD")] = {
          customStyles: {
            container: {
              backgroundColor:
                theme === "orange" ? COLORS.neutral250 : COLORS.accent400,
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
            borderColor:
              theme === "orange" ? COLORS.accent800 : COLORS.accent500,
            borderWidth: 2,
          },
          text: {
            color: "#000",
          },
        },
      };
    });
  };

  generateMarkedDates();

  const bottomSheetRef = useRef();

  const openBottomSheet = () => {
    bottomSheetRef.current.expand();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current.close();
  };

  const handleSheetChanges = useCallback((index) => {
    // console.log("handleSheetChanges", index);
  }, []);

  return (
    <>
      <ReminderContent
        isActive={reminderModalIsVisible}
        setReminderModalIsVisible={setReminderModalIsVisible}
        pills={false}
        type={reminderInfo.as}
        onRegisterButtonPress={handleRegisterButtonPress}
      />
      {/* <Button onPress={openBottomSheet} title="open bottom" /> */}
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={[500, "90%"]}
        initialSnapIndex={100}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheet>

      <ScrollView
        scrollEnabled={scrollDisabled}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <BackgroundContainer>
          <View style={styles.calendar}>
            <Calendar
              disableAllTouchEventsForDisabledDays={true}
              style={{
                height: 380,
                borderRadius: 8,
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
              markedDates={markedDates}
              enableSwipeMonths={true}
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
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  container: {
    height: "100%",
  },
  reminderContainer: {
    position: "absolute",
    alignItems: "center",
    paddingTop: "50%",
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

// import { useState, useEffect, useRef } from "react";
// import { Text, View, Button, Platform } from "react-native";
// import * as Device from "expo-device";
// import * as Notifications from "expo-notifications";
// import Constants from "expo-constants";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// export default function App() {
//   const [expoPushToken, setExpoPushToken] = useState("");
//   const [channels, setChannels] = useState([]);
//   const [notification, setNotification] = useState();
//   // (useState < Notifications.Notification) | (undefined > undefined);

//   const notificationListener = useRef();
//   const responseListener = useRef();

//   useEffect(() => {
//     registerForPushNotificationsAsync().then(
//       (token) => token && setExpoPushToken(token)
//     );

//     if (Platform.OS === "android") {
//       Notifications.getNotificationChannelsAsync().then((value) =>
//         setChannels(value ?? [])
//       );
//     }
//     notificationListener.current =
//       Notifications.addNotificationReceivedListener((notification) => {
//         setNotification(notification);
//       });

//     responseListener.current =
//       Notifications.addNotificationResponseReceivedListener((response) => {
//         console.log(response);
//       });

//     return () => {
//       notificationListener.current &&
//         Notifications.removeNotificationSubscription(
//           notificationListener.current
//         );
//       responseListener.current &&
//         Notifications.removeNotificationSubscription(responseListener.current);
//     };
//   }, []);

//   return (
//     <View
//       style={{
//         flex: 1,
//         alignItems: "center",
//         justifyContent: "space-around",
//       }}
//     >
//       <Text>Your expo push token: {expoPushToken}</Text>
//       <Text>{`Channels: ${JSON.stringify(
//         channels.map((c) => c.id),
//         null,
//         2
//       )}`}</Text>
//       <View style={{ alignItems: "center", justifyContent: "center" }}>
//         <Text>
//           Title: {notification && notification.request.content.title}{" "}
//         </Text>
//         <Text>Body: {notification && notification.request.content.body}</Text>
//         <Text>
//           Data:{" "}
//           {notification && JSON.stringify(notification.request.content.data)}
//         </Text>
//       </View>
//       <Button
//         title="Press to schedule a notification"
//         onPress={async () => {
//           await schedulePushNotification();
//         }}
//       />
//     </View>
//   );
// }

// async function schedulePushNotification() {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "You've got mail! 📬",
//       body: "Here is the notification body",
//       data: { data: "goes here", test: { test1: "more data" } },
//     },
//     trigger: { seconds: 2 },
//   });
// }

// async function registerForPushNotificationsAsync() {
//   let token;

//   if (Platform.OS === "android") {
//     await Notifications.setNotificationChannelAsync("default", {
//       name: "default",
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: "#FF231F7C",
//     });
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") {
//       alert("Failed to get push token for push notification!");
//       return;
//     }

//     try {
//       const projectId =
//         Constants?.expoConfig?.extra?.eas?.projectId ??
//         Constants?.easConfig?.projectId;
//       if (!projectId) {
//         throw new Error("Project ID not found");
//       }
//       token = (
//         await Notifications.getExpoPushTokenAsync({
//           projectId,
//         })
//       ).data;
//       console.log(token);
//     } catch (e) {
//       token = `${e}`;
//     }
//   } else {
//     alert("Must use physical device for Push Notifications");
//   }

//   return token;
// }
