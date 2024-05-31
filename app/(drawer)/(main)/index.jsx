// import { useState, useLayoutEffect } from "react";
// import {
//   View,
//   ScrollView,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Button,
//   Pressable,
// } from "react-native";

// import { COLORS, SIZES } from "../../../constants";
// import ReminderContent from "../../../components/reminder-content";
// import BackgroundContainer from "../../../components/background-container";
// import IndicationCalendar from "../../../components/calendar/indication-calendar";
// import { Calendar } from "react-native-calendars";
// import ReminderItem from "../../../components/calendar/reminder-item";
// import AuthWithGoogle from "../../../components/authWithGoogle/authWithGoogle";
// import { useSelector } from "react-redux";
// import { useNavigation } from "expo-router";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import Animated from "react-native-reanimated";
// import {
//   getFecundityPeriod,
//   getMenstruationPeriod,
//   getOvulationDate,
// } from "@/utils/menstruationUtils";
// import moment from "moment";

// const index = () => {
//   const user = useSelector((state) => state.user);
//   const navigation = useNavigation();
//   const [howmanytimeReminder1, setHowmanytimeReminder1] = useState("?");
//   const [howmanytimeReminder2, setHowmanytimeReminder2] = useState("?");
//   const [howmanytimeReminder3, setHowmanytimeReminder3] = useState("?");
//   const [scrollDisabled, setScrollDisabled] = useState(true);
//   const [reminderModalIsVisible, setReminderModalIsVisible] = useState(false);
//   const [reminderInfo, setReminderInfo] = useState({ as: "", time: "" });
//   const [time1, setTime1] = useState({
//     hour: 0,
//     minutes: 0,
//   });
//   const [time2, setTime2] = useState({
//     hour: 0,
//     minutes: 0,
//   });
//   const [time3, setTime3] = useState({
//     hour: 0,
//     minutes: 0,
//   });

//   const handleReminderBtnOnePress = () => {
//     setReminderInfo({ as: "Début des règles" });
//     setReminderModalIsVisible(true);
//   };

//   const handleReminderBtnTwoPress = () => {
//     setReminderInfo({ as: "Jour d'ovulation" });
//     setReminderModalIsVisible(true);
//   };

//   const handleReminderBtnThreePress = () => {
//     setReminderInfo({ as: "Prise de pillule" });
//     setReminderModalIsVisible(true);
//   };

//   const handleCloseIconOnePress = () => {};

//   const handleCloseIconTwoPress = () => {};

//   const handleCloseIconThreePress = () => {};

//   const handleRegisterButtonPress = (type, hour, minutes, active) => {
//     setScrollDisabled(true);
//     switch (type) {
//       case "Début des règles":
//         setTime1({ ...time1, hour: hour, minutes: minutes });
//         setHowmanytimeReminder1(active);
//         setTranslateYOne(1500);
//         break;
//       case "Jour d'ovulation":
//         setTime2({ ...time2, hour: hour, minutes: minutes });
//         setHowmanytimeReminder2(active);
//         setTranslateYTwo(1500);
//         break;
//       case "Prise de pillule":
//         setTime3({ ...time3, hour: hour, minutes: minutes });
//         setHowmanytimeReminder3(active);
//         setTranslateYThree(1500);
//         break;
//       default:
//         return null;
//     }
//   };

//   // useLayoutEffect(() => {
//   //   navigation.setOptions({
//   //     headerTitle: () => (
//   //       <View className=" w-full flex-row items-center justify-between">
//   //         <View className="flex flex-row  items-center justify-center">
//   //           <TouchableOpacity className="p-2 pl-0 mr-3">
//   //             <Ionicons
//   //               name="menu"
//   //               color={"white"}
//   //               size={35}
//   //               onPress={() => navigation.openDrawer()}
//   //             />
//   //           </TouchableOpacity>
//   //           <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
//   //             Bonjour {user.username}
//   //           </Text>
//   //         </View>
//   //         <TouchableOpacity className="p-2 pl-0 ">
//   //           <Ionicons
//   //             name="notifications-circle"
//   //             color={"white"}
//   //             size={30}
//   //             onPress={() => navigation.openDrawer()}
//   //           />
//   //         </TouchableOpacity>
//   //       </View>
//   //     ),
//   //     headerStyle: {
//   //       backgroundColor: "#FF7575",
//   //       height: SIZES.height * 0.14,
//   //     },
//   //     headerTintColor: "white",
//   //   });
//   // }, [navigation]);
//   // Date de la dernière menstruation (dans le passé)
//   const lastMenstruationDate = "2024-05-15";
//   // Durée du cycle menstruel
//   const cycleDuration = 28; // en jours
//   // Durée de la menstruation
//   const menstruationDuration = 5; // en jours

//   // Tableau pour stocker les données pour chaque mois suivant à partir de la date de la dernière menstruation
//   const cyclesData = [];

//   // Date de la dernière menstruation
//   let currentCycleStart = moment(lastMenstruationDate).startOf("month");

//   // Itérer sur chaque mois suivant à partir de la date de la dernière menstruation
//   while (currentCycleStart.isBefore(moment().add(1, "year"), "month")) {
//     // Calculez les informations pour le cycle menstruel dans ce mois
//     const ovulationDate = getOvulationDate(
//       currentCycleStart.format("YYYY-MM-DD"),
//       cycleDuration
//     );
//     const fecundityPeriod = getFecundityPeriod(
//       currentCycleStart.format("YYYY-MM-DD"),
//       cycleDuration
//     );
//     const menstruationPeriod = getMenstruationPeriod(
//       currentCycleStart.format("YYYY-MM-DD"),
//       cycleDuration,
//       menstruationDuration
//     );

//     // Ajoutez les données calculées pour ce cycle menstruel au tableau des données des cycles
//     cyclesData.push({
//       month: currentCycleStart.format("MMMM YYYY"),
//       ovulationDate: ovulationDate.ovulationDate,
//       fecundityPeriodStart: fecundityPeriod.startFecondityDate,
//       fecundityPeriodEnd: fecundityPeriod.endFecondityDate,
//       nextMenstruationDate: menstruationPeriod.nextMenstruationDate,
//       nextMenstruationEndDate: menstruationPeriod.nextMenstruationEndDate,
//     });

//     // Définissez la date de début du prochain cycle menstruel comme la date de fin de la dernière menstruation de ce cycle
//     currentCycleStart = moment(
//       menstruationPeriod.nextMenstruationEndDate
//     ).startOf("month");
//   }

//   return (
//     <>
//       {reminderModalIsVisible == true && (
//         <Pressable
//           className="absolute z-50 bg-black/40"
//           style={{
//             position: "absolute",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             height: "100%",
//             width: SIZES.width,
//           }}
//           onPress={() => setReminderModalIsVisible(false)}
//         >
//           <ReminderContent
//             onCloseIconPress={handleCloseIconOnePress}
//             pills={false}
//             type={reminderInfo.as}
//             onRegisterButtonPress={handleRegisterButtonPress}
//           />
//         </Pressable>
//       )}

//       {/* <Animated.View
//         style={{
//           position: "absolute",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           height: SIZES.height,
//           width: SIZES.width,
//         }}
//         className="absolute z-50 bg-black/40 top-0 flex-1"
//       >
//         <AuthWithGoogle className="z-50" />
//       </Animated.View> */}
//       <View>
//         {cyclesData.map((cycleData, index) => (
//           <View key={index}>
//             <Text>Month: {cycleData.month}</Text>
//             <Text>Ovulation Date: {cycleData.ovulationDate}</Text>
//             <Text>
//               Fecundity Period Start: {cycleData.fecundityPeriodStart}
//             </Text>
//             <Text>Fecundity Period End: {cycleData.fecundityPeriodEnd}</Text>
//             <Text>
//               Next Menstruation Date: {cycleData.nextMenstruationDate}
//             </Text>
//             <Text>
//               Next Menstruation End Date: {cycleData.nextMenstruationEndDate}
//             </Text>
//             <Text>-------------------------------------------------</Text>
//           </View>
//         ))}
//       </View>
//       <ScrollView
//         scrollEnabled={scrollDisabled}
//         style={styles.container}
//         showsVerticalScrollIndicator={false}
//       >
//         <BackgroundContainer>
//           {/* <Text
//             style={styles.title}
//             // onPress={() => navigation.navigate("Screen")}
//           >{}</Text> */}
//           <View style={styles.calendar}>
//             <Calendar
//               style={{
//                 height: 380,
//                 borderRadius: 8,
//                 // backgroundColor: "rgba(255, 255, 255, .5)",
//               }}
//               theme={{
//                 textSectio0nTitleColor: COLORS.neutral400,
//                 todayTextColor: COLORS.primary,
//                 dayTextColor: "#2d4150",
//                 textDisabledColor: COLORS.neutral400,
//                 arrowColor: COLORS.primary,
//                 monthTextColor: COLORS.primary,
//                 textDayFontFamily: "Regular",
//                 textMonthFontFamily: "SBold",
//                 textDayHeaderFontFamily: "Regular",
//                 textDayFontSize: SIZES.medium,
//                 textMonthFontSize: SIZES.large,
//                 textDayHeaderFontSize: SIZES.medium,
//               }}
//               onDayPress={(day) => {
//                 // //.log(day.dateString);
//               }}
//               markedDates={{
//                 "2024-05-31": {
//                   selected: true,
//                   disableTouchEvent: true,
//                   selectedColor: COLORS.accent600,
//                   selectedTextColor: COLORS.neutral100,
//                 },
//               }}
//               enableSwipeMonths={true}
//               // onMonthChange={(month) => handleMonthChange(month)}
//               markingType="custom"
//             />
//           </View>
//           <View style={styles.indications}>
//             <IndicationCalendar title="Jours des règles" />
//             <IndicationCalendar title="Ovulation" />
//             <IndicationCalendar title="Période de fécondité" />
//           </View>
//           <View
//             style={[
//               styles.reminder,
//               {
//                 backgroundColor:
//                   "pink" === "pink"
//                     ? "rgba(255, 255, 255, .5)"
//                     : "rgba(238, 220, 174, .5)",
//               },
//             ]}
//             className="p-2"
//           >
//             <Text style={styles.reminderTitle}>rappels</Text>
//             <View
//               style={{
//                 gap: 10,
//               }}
//             >
//               <ReminderItem
//                 as="Début des règles"
//                 onPress={handleReminderBtnOnePress}
//                 time={time1}
//                 howmanytimeReminder={howmanytimeReminder1}
//               />
//               <ReminderItem
//                 as="Jour d'ovulation"
//                 onPress={handleReminderBtnTwoPress}
//                 time={time2}
//                 howmanytimeReminder={howmanytimeReminder2}
//               />
//               <ReminderItem
//                 as="Prise de pillule"
//                 onPress={handleReminderBtnThreePress}
//                 time={time3}
//                 howmanytimeReminder={howmanytimeReminder3}
//               />
//             </View>
//           </View>
//         </BackgroundContainer>
//       </ScrollView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   authwithgoogleContainer: {
//     // position: "absolute",
//     // top: 0,
//     // left: 0,
//     // right: 0,
//     // bottom: 0,
//     // backgroundColor: "rgba(0, 0, 0, 0.4)",
//   },
//   container: {
//     height: "100%",
//   },
//   reminderContainer: {
//     position: "absolute",
//     alignItems: "center",
//     paddingTop: "50%",
//     // justifyContent: "center",
//     // backgroundColor: "rgba(0, 0, 0, .3)",
//     top: 0,
//     right: -20,
//     left: -20,
//     bottom: 0,
//     zIndex: 999,
//   },
//   title: {
//     fontFamily: "Bold",

//     textAlign: "center",
//     marginTop: 60,
//   },
//   calendar: {
//     marginTop: 50,
//     marginBottom: 20,
//   },
//   indications: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     rowGap: 10,
//   },
//   reminderTitle: {
//     fontFamily: "SBold",
//     fontSize: 17,
//     marginBottom: 20,
//   },
//   reminder: {
//     marginTop: 20,
//     marginBottom: 100,
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     borderRadius: 8,
//   },
// });

// export default index;
import { generateCycleMenstrualData } from "@/utils/menstruationUtils";
import React from "react";
import { View, Text } from "react-native";

const index = () => {
  // Définir les paramètres pour la fonction
  const startDate = "2024-05-15";
  const cycleDuration = 28;
  const menstruationDuration = 5;

  // Appeler la fonction pour générer les données des cycles menstruels
  const cyclesData = generateCycleMenstrualData(
    startDate,
    cycleDuration,
    menstruationDuration
  );

  // Afficher les données
  return (
    <View>
      <Text>Index</Text>
      {cyclesData.map((cycle, index) => (
        <View key={index}>
          <Text>Month: {cycle.month}</Text>
          <Text>Ovulation Date: {cycle.ovulationDate}</Text>
          <Text>Fecundity Period Start: {cycle.fecundityPeriodStart}</Text>
          <Text>Fecundity Period End: {cycle.fecundityPeriodEnd}</Text>
          <Text>Next Menstruation Date: {cycle.nextMenstruationDate}</Text>
          <Text>
            Next Menstruation End Date: {cycle.nextMenstruationEndDate}
          </Text>
          <Text>-------------------------------------------------</Text>
        </View>
      ))}
    </View>
  );
};

export default index;
