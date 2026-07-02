import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "@/constants";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "expo-router";
import { useSelector } from "@legendapp/state/react";
import { updateUser, userState } from "@/legendstate/AmpelaStates";
import { AntDesign } from "@expo/vector-icons";

const LastMenstrualCycleStartAge = () => {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const firstDayOfMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-01`;

  const [selected, setSelected] = useState(todayString);
  const navigation = useNavigation();
  const user = useSelector(() => userState.get());

  const isNextBtnDisabled = false; // toujours possible d'avancer (date par défaut si oubli)

  useEffect(() => {
    const dateToUpdate = selected === "" ? firstDayOfMonth : selected;
    updateUser({ lastMenstruationDate: dateToUpdate });
  }, [selected]);

  const handleNextBtnPress = () => {
    navigation.navigate("questionsSeries");
  };

  const handleDateChange = (day) => {
    const selectedDate = day.dateString;
    if (new Date(selectedDate) <= today) {
      setSelected(selectedDate);
    } else {
      console.warn("La date sélectionnée doit être aujourd'hui ou dans le passé.");
    }
  };

  const handleForgetDate = () => {
    setSelected("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {user?.username ? `Bonjour ${user.username}` : "Bonjour"}
        </Text>
        <Text style={styles.title}>Date de vos dernières règles</Text>
        <Text style={styles.subtitle}>
          Sélectionnez le premier jour de vos dernières règles.
        </Text>
      </View>

      {/* Calendrier */}
      <View style={styles.calendarCard}>
        <Calendar
          style={styles.calendar}
          maxDate={todayString}
          theme={{
            textSectionTitleColor: "#B0B0B0",
            todayTextColor: "#FF7575",
            dayTextColor: "#2D2D2D",
            textDisabledColor: "#D8D8D8",
            arrowColor: "#FF7575",
            monthTextColor: "#1A1A1A",
            textDayFontFamily: "Regular",
            textMonthFontFamily: "Bold",
            textDayHeaderFontFamily: "Regular",
            textDayFontSize: SIZES.medium,
            textMonthFontSize: SIZES.medium,
            textDayHeaderFontSize: SIZES.small,
          }}
          onDayPress={handleDateChange}
          markedDates={{
            [selected]: {
              selected: true,
              disableTouchEvent: true,
              selectedColor: "#FF7575",
              selectedTextColor: COLORS.neutral100,
            },
          }}
        />

        <TouchableOpacity
          style={[
            styles.forgetChip,
            {
              backgroundColor: selected === "" ? "#FF7575" : "#FAFAFA",
              borderColor: selected === "" ? "#FF7575" : "#F0F0F0",
            },
          ]}
          onPress={handleForgetDate}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.forgetChipText,
              { color: selected === "" ? COLORS.neutral100 : "#7A7A7A" },
            ]}
          >
            Je ne me souviens plus
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation basse */}
      <View style={styles.btnBox}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AntDesign name="arrow-left" size={16} color="#9E9E9E" />
          <Text style={styles.backButtonText}>Précédent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextBtnPress}
          disabled={isNextBtnDisabled}
          activeOpacity={0.85}
          style={[
            styles.nextBtn,
            { backgroundColor: isNextBtnDisabled ? "#EFEFEF" : "#FF7575" },
          ]}
        >
          <Text
            style={[
              styles.nextBtnText,
              { color: isNextBtnDisabled ? "#B0B0B0" : COLORS.neutral100 },
            ]}
          >
            Suivant
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  eyebrow: {
    color: "#FF7575",
    fontFamily: "SBold",
    fontSize: SIZES.small,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontFamily: "Bold",
    fontSize: SIZES.width * 0.065,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
    color: "#8A8A8A",
    lineHeight: 20,
  },
  calendarCard: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 12,
  },
  calendar: {
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  forgetChip: {
    alignSelf: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  forgetChipText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  btnBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  backButtonText: {
    color: "#9E9E9E",
    fontSize: 15,
    fontFamily: "SBold",
    marginLeft: 6,
  },
  nextBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: "#FF7575",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnText: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
  },
});

export default LastMenstrualCycleStartAge;