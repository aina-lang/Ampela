import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { COLORS, SIZES } from "@/constants";
import { useNavigation } from "expo-router";
import { useSelector } from "@legendapp/state/react";
import { updateUser, userState, preferenceState } from "@/legendstate/AmpelaStates";
import { AntDesign } from "@expo/vector-icons";
import StepScreenWrapper from "@/components/StepScreenWrapper";
import ModernButton from "@/components/ModernButton";

const LastMenstrualCycleStartAge = () => {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const firstDayOfMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-01`;

  const [selected, setSelected] = useState(todayString);
  const navigation = useNavigation();
  const user = useSelector(() => userState.get());
  const { theme } = useSelector(() => preferenceState.get());
  const accentColor = theme === "pink" ? "#FF7575" : "#FE8729";
  const accentColorDisabled = theme === "pink" ? "#FFB5B5" : "#FED4A0";

  const isNextBtnDisabled = false;

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
    <StepScreenWrapper
      stepNumber={2}
      eyebrow="Étape 2 sur 3"
      title="Date de vos dernières règles"
      subtitle="Sélectionnez le premier jour de vos dernières règles."
    >
      <View style={styles.content}>
        <View style={styles.calendarCard}>
          <Calendar
            style={styles.calendar}
            maxDate={todayString}
            theme={{
              textSectionTitleColor: "#B0B0B0",
              todayTextColor: COLORS.accent500,
              dayTextColor: "#2D2D2D",
              textDisabledColor: "#D8D8D8",
              arrowColor: COLORS.accent500,
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
                selectedColor: COLORS.accent500,
                selectedTextColor: COLORS.neutral100,
              },
            }}
          />

          <TouchableOpacity
            style={[
              styles.forgetChip,
              {
                backgroundColor: selected === "" ? COLORS.accent500 : "#FAFAFA",
                borderColor: selected === "" ? COLORS.accent500 : "#F0F0F0",
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

        <View style={styles.btnBox}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <AntDesign name="arrowleft" size={16} color="#9E9E9E" />
            <Text style={styles.backButtonText}>Précédent</Text>
          </TouchableOpacity>

          <ModernButton
            title="Suivant"
            onPress={handleNextBtnPress}
            accentColor={accentColor}
            accentColorDisabled={accentColorDisabled}
            style={{ flex: 1, marginLeft: 12 }}
          />
        </View>
      </View>
    </StepScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  calendarCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  forgetChip: {
    alignSelf: "center",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  forgetChipText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  btnBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 6,
  },
  backButtonText: {
    color: "#9E9E9E",
    fontSize: 15,
    fontFamily: "SBold",
  },
});

export default LastMenstrualCycleStartAge;
