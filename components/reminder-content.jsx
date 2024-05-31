import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { COLORS } from "../constants";
import Animated from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

const ReminderContent = ({
  onCloseIconPress,
  pills,
  type,
  onRegisterButtonPress,
}) => {
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [active, setActive] = useState("");

  const handleHourChange = (hour) => {
    setSelectedHour(hour);
  };

  const handleMinuteChange = (minute) => {
    setSelectedMinute(minute);
  };

  const renderHourItem = (data, index) => (
    <TouchableOpacity
      key={data.value}
      onPress={() => handleHourChange(data.value)}
      style={{ padding: 10 }}
    >
      <Text>{data.label}</Text>
    </TouchableOpacity>
  );

  const renderMinuteItem = (data, index) => (
    <TouchableOpacity
      key={data.value}
      onPress={() => handleMinuteChange(data.value)}
      style={{ padding: 10 }}
    >
      <Text>{data.label}</Text>
    </TouchableOpacity>
  );

  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i < 10 ? `0${i}` : i}`,
  }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: `${i < 10 ? `0${i}` : i}`,
  }));

  const handleItemPress = (item) => {
    setActive(active === item ? "" : item);
  };

  const handleRegisterBtnPress = () => {
    onRegisterButtonPress(type, selectedHour, selectedMinute, active);
  };

  return (
    <Animated.View className="bg-white  p-5 py-10 rounded-md w-[90%] mx-auto shadow-md shadow-black">
      <View style={styles.header}>
        <Text
          style={[styles.textRegular, { textAlign: "center", fontSize: 17 }]}
        >
          {type}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* <ScrollPicker
            dataSource={hours}
            selectedIndex={selectedHour}
            renderItem={renderHourItem}
            onValueChange={handleHourChange}
            wrapperHeight={80}
            wrapperBackground="#FFFFFF"
            itemHeight={60}
            highlightColor="#d8d8d8"
            highlightBorderWidth={2}
          /> */}
          <Text style={styles.timeDivider} className="text-xl">
            10 : 12
          </Text>
          {/* <ScrollPicker
            dataSource={minutes}
            selectedIndex={selectedMinute}
            renderItem={renderMinuteItem}
            onValueChange={handleMinuteChange}
            wrapperHeight={80}
            wrapperBackground="#FFFFFF"
            itemHeight={60}
            highlightColor="#d8d8d8"
            highlightBorderWidth={2}
            
          /> */}
        </View>
      </View>

      <View style={styles.footer} className="p-5 py-0">
        <Text style={styles.textRegular}>Répéter : </Text>
        <View style={styles.pressableContainer}>
          <TouchableOpacity
            style={[
              styles.item,
              {
                backgroundColor:
                  active === "Ajourd'hui" || active === "3 jours"
                    ? COLORS.accent600
                    : "rgba(0, 0, 0, 0.1)",
              },
            ]}
            onPress={() => handleItemPress(pills ? "Aujourd'hui" : "3 jours")}
          >
            <Text
              style={[
                styles.itemText,
                {
                  color:
                    active === "Ajourd'hui" || active === "3 jours"
                      ? COLORS.neutral100
                      : COLORS.neutral400,
                },
              ]}
            >
              {pills ? "Ajourd'hui" : "3 jours"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.item,
              {
                backgroundColor:
                  active === "Tous les jours" || active === "2 jours"
                    ? COLORS.accent600
                    : "rgba(0, 0, 0, 0.1)",
              },
            ]}
            onPress={() =>
              handleItemPress(pills ? "Tous les jours" : "2 jours")
            }
          >
            <Text
              style={[
                styles.itemText,
                {
                  color:
                    active === "Tous les jours" || active === "2 jours"
                      ? COLORS.neutral100
                      : COLORS.neutral400,
                },
              ]}
            >
              {pills ? "Tous les jours " : "2 jours"}
            </Text>
          </TouchableOpacity>
          {pills ? null : (
            <>
              <TouchableOpacity
                style={[
                  styles.item,
                  {
                    backgroundColor:
                      active === "1 jour"
                        ? COLORS.accent600
                        : "rgba(0, 0, 0, 0.1)",
                  },
                ]}
                onPress={() => handleItemPress("1 jour")}
              >
                <Text
                  style={[
                    styles.itemText,
                    {
                      color:
                        active === "1 jour"
                          ? COLORS.neutral100
                          : COLORS.neutral400,
                    },
                  ]}
                >
                  1 jour
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.item,
                  {
                    backgroundColor:
                      active === "Le jour même"
                        ? COLORS.accent600
                        : "rgba(0, 0, 0, 0.1)",
                  },
                ]}
                onPress={() => handleItemPress("Le jour même")}
              >
                <Text
                  style={[
                    styles.itemText,
                    {
                      color:
                        active === "Le jour même"
                          ? COLORS.neutral100
                          : COLORS.neutral400,
                    },
                  ]}
                >
                  Le jour même
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View className=" flex flex-row space-x-3 w-full items-center justify-center">
          <TouchableOpacity
            onPress={handleRegisterBtnPress}
            className="p-5 bg-[#FF7575] py-2 rounded-md shadow-sm shadow-black"
          >
            <Text style={[styles.textMedium, { color: COLORS.neutral100 }]}>
              Enregistrer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCloseIconPress}
            className="p-5 bg-[#d5d6d6] py-2 rounded-md shadow-black"
          >
            <Text style={[styles.textMedium, { color: COLORS.neutral100 }]}>
              Annuler
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: COLORS.neutral100,
    width: screenWidth - 40,
    borderRadius: 15,
  },
  header: {
    marginBottom: 20,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timeDivider: {
    marginHorizontal: 10,
    // fontSize: RFValue(SIZES.medium),
  },
  footer: {
    marginTop: 20,
  },
  pressableContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  item: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 10,
    marginVertical: 5,
  },
  itemText: {
    // fontSize: RFValue(SIZES.small),
    fontFamily: "Regular",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    paddingVertical: 8,
    width: 120,
  },
  textRegular: {
    fontFamily: "Regular",
  },
  textMedium: {
    fontFamily: "Medium",
  },
});

export default ReminderContent;
