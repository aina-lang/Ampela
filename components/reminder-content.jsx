import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
  Modal,
  Alert,
} from "react-native";

import { COLORS, SIZES } from "../constants";


const screenWidth = Dimensions.get("window").width;

const ReminderContent = ({
  isActive,
  setReminderModalIsVisible,
  pills,
  type,
}) => {
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [active, setActive] = useState(pills ? "Aujourd'hui" : "3 jours");
  // const [modalIsActive, setModalIsActive] = useState(isActive);
  // const {
  //   menstruationNotifications,
  //   ovulationNotifications,
  //   pillNotifications,
  // } = useSelector((state) => state.reminder);

  const hourScrollViewRef = useRef(null);
  const minuteScrollViewRef = useRef(null);


  // const selectedParams = useSelector(
  //   (state) => state.notification.selectedParams
  // );

  const handleHourChange = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const itemHeight = 50;
    const index = Math.round(yOffset / itemHeight);
    hourScrollViewRef.current.scrollToIndex({ animated: true, index });
    // setSelectedHour(index);
  };

  const handleMinuteChange = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const itemHeight = 50;
    const index = Math.round(yOffset / itemHeight);
    minuteScrollViewRef.current.scrollToIndex({ animated: true, index });

    // setSelectedMinute(index);
  };
  // const handleMenstruationToggle = () => {
  //   dispatch(toggleMenstruationNotifications());
  // };

  // const handleOvulationToggle = () => {
  //   dispatch(toggleOvulationNotifications());
  // };

  // const handlePillToggle = () => {
  //   dispatch(togglePillNotifications());
  // };

  const handleRegisterBtnPress = () => {
    // if (menstruationNotifications) {
    //   scheduleMenstruationNotifications();
    // }
    // if (ovulationNotifications) {
    //   scheduleOvulationNotifications();
    // }
    // if (pillNotifications) {
    //   schedulePillNotifications();
    // }
    onRegisterButtonPress(type, selectedHour, selectedMinute, active);
  };

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

  return (
    <Modal
      transparent={true}
      visible={isActive}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        setReminderModalIsVisible(!isActive);
      }}
    >
      <View
        className={`bg-black/40 justify-center items-center`}
        style={{ height: SIZES.height, width: SIZES.width }}
      >
        <View className="bg-white w-[90%] p-5 rounded-md mx-auto">
          <View style={styles.header}>
            <Text
              style={[
                styles.textRegular,
                { textAlign: "center", fontSize: 17 },
              ]}
            >
              {type}
            </Text>
          </View>

          <View style={styles.body}>
            <View
              style={{ flexDirection: "row", alignItems: "center", width: 120 }}
            >
              <FlatList
                onScroll={handleHourChange}
                showsVerticalScrollIndicator={false}
                style={{ height: 50 }}
                className="bg-white  shadow-sm shadow-black rounded-md overflow-hidden"
                ref={hourScrollViewRef}
                data={hours}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                  <View
                    // onPress={() => handleHourChange(item.value)}
                    className="rounded-md "
                    style={[
                      styles.item,
                      // {
                      //   backgroundColor:
                      //     selectedHour === item.value
                      //       ? COLORS.accent600
                      //       : "rgba(0, 0, 0, 0.1)",
                      // },
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        {
                          fontSize: 20,
                          // color: selectedHour === item.value ? "white" : "black",
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                )}
                keyExtractor={(item) => item.value.toString()}
                horizontal={false}
              />
              <Text style={styles.timeDivider}>:</Text>
              <FlatList
                onScroll={handleMinuteChange}
                style={{ height: 50 }}
                className="bg-white  shadow-sm shadow-black rounded-md overflow-hidden"
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ref={minuteScrollViewRef}
                data={minutes}
                renderItem={({ item }) => (
                  <View
                    className="rounded-md "
                    // onPress={() => handleMinuteChange(item.value)}
                    style={[
                      styles.item,
                      // {
                      //   backgroundColor:
                      //     selectedMinute === item.value
                      //       ? COLORS.accent600
                      //       : "rgba(0, 0, 0, 0.1)",
                      // },
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        {
                          fontSize: 20,
                          //   color:
                          //     selectedMinute === item.value ? "white" : "black",
                          //
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                )}
                keyExtractor={(item) => item.value.toString()}
                horizontal={false} // Pour scroller verticalement
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.textRegular}>Répéter : </Text>
            <View style={styles.pressableContainer}>
              {[
                {
                  label: pills ? "Ajourd'hui" : "3 jours",
                  value: pills ? "Ajourd'hui" : "3 jours",
                },
                {
                  label: pills ? "Tous les jours" : "2 jours",
                  value: pills ? "Tous les jours" : "2 jours",
                },
                ...(pills
                  ? []
                  : [
                      { label: "1 jour", value: "1 jour" },
                      { label: "Le jour même", value: "Le jour même" },
                    ]),
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.item2,
                    {
                      backgroundColor:
                        active === item.value
                          ? COLORS.accent600
                          : "rgba(0, 0, 0, 0.1)",
                    },
                  ]}
                  className={`rounded-md ${
                    active === item.value ? " shadow-sm shadow-black" : ""
                  }`}
                  onPress={() => handleItemPress(item.value)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      { color: active === item.value ? "white" : "black" },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                // onPress={handleRegisterBtnPress}
                style={[styles.button, { backgroundColor: COLORS.accent500 }]}
                className="shadow-md shadow-black"
              >
                <Text style={styles.textMedium} className="text-white">
                  Enregistrer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setReminderModalIsVisible(!isActive)}
                style={[
                  styles.button,
                  { backgroundColor: "rgba(0, 0, 0, 0.1)" },
                ]}
              >
                <Text style={styles.textMedium}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    width: screenWidth,
    height: SIZES.height,
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
  separator: {
    height: 1,
    backgroundColor: "gray",
  },
  pressableContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
    flexWrap: "wrap",
    padding: 10,
  },
  item: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: "auto",
  },
  item2: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    marginTop: 5,
    padding: 10,
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
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  textRegular: {
    fontFamily: "Regular",
  },
  textMedium: {
    fontFamily: "Medium",
  },
});

export default ReminderContent;
