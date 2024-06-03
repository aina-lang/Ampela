import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
 
} from "react-native";
import { COLORS, SIZES } from "../../constants";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../redux/userSlice";

const LastMenstrualCycleStartAge = () => {
  const [selected, setSelected] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(new Date().getDate()).padStart(2, "0")}`
  );
  const [isNextBtnDisabled, setIsNextBtnDisabled] = useState(true);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (selected) {
      setIsNextBtnDisabled(false);
    }
  }, [selected]);

  useEffect(() => {
    const userData = {
      lastMenstruationDate: selected,
    };
    dispatch(updateUser(userData));
    // console.log(selected);
  }, [selected]);
  const handleNextBtnPress = () => {
    console.log(user);
    navigation.navigate("questionsSeries");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.title}
        className="bg-[#FF7575] text-white rounded-br-[150] p-4 pt-20 shadow-lg shadow-black"
      >
        {/* {t("questionDateVosDernieresRegles")} */}
        {user.username + "  , "}
        date de vos dernier regle
      </Text>
      <View style={styles.calendar}>
        <Calendar
          style={{
            height: 360,
            borderRadius: 8,
            backgroundColor: "rgba(255, 255, 255, .5)",
          }}
          theme={{
            textSectionTitleColor: COLORS.neutral400,
            todayTextColor: COLORS.primary,
            dayTextColor: "#2d4150",
            textDisabledColor: COLORS.neutral400,
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.primary,
            textDayFontFamily: "Regular",
            textMonthFontFamily: "Bold",
            textDayHeaderFontFamily: "Regular",
            textDayFontSize: SIZES.medium,
            textMonthFontSize: SIZES.large,
            textDayHeaderFontSize: SIZES.medium,
          }}
          onDayPress={(day) => {
            setSelected(day.dateString);
            console.log(selected);
          }}
          markedDates={{
            [selected]: {
              selected: true,
              disableTouchEvent: true,
              selectedColor: COLORS.accent600,
              selectedTextColor: COLORS.neutral100,
            },
          }}
        />
        <TouchableOpacity
          className=" items-center rounded-md px-5"
          onPress={() => setSelected("")}
          style={{
            borderWidth: selected === "" ? 1 : 0,
            borderColor: COLORS.accent600,
            padding: 10,
          }}
        >
          <Text className="text-[#E2445C]">Je m'en souviens pas</Text>
        </TouchableOpacity>
      </View>
      <View
        style={styles.btnBox}
        className="flex items-center  justify-between flex-row p-5"
      >
        <TouchableOpacity
          className="p-3  items-center rounded-md px-5"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-[#8a8888]">Précedent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="p-3  items-center rounded-md px-5 shadow-lg"
          onPress={handleNextBtnPress}
          disabled={isNextBtnDisabled}
          style={{
            backgroundColor: isNextBtnDisabled ? "#e7e5e5" : "#FF7575",
          }}
        >
          <Text className="text-white">Suivant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral100,
  },
  title: {
    fontSize: SIZES.width * 0.08,
    fontFamily: "Bold",
    textAlign: "center",
    height: SIZES.height * 0.3,
  },
  calendar: {
    width: SIZES.width,
    height: SIZES.height * 0.6,
    padding: 10,
  },
  btnBox: {
    height: SIZES.height * 0.15,
    width: SIZES.width,
  },
});

export default LastMenstrualCycleStartAge;
