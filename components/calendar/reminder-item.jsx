import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  FlatList,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND_NOTIFICATION_TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error }) => {
    if (error) {
      console.error(error);
      return;
    }

    const { notificationDate, title, body } = data;
    const now = new Date();
    const notificationTime = new Date(notificationDate);

    console.log(title, body);
    if (notificationTime > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: { someData: "goes here" },
        },
        trigger: { date: notificationTime },
      });
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  }
);

const registerBackgroundTask = async (notificationDate, title, body) => {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    console.log("Background execution is restricted or denied.");
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_NOTIFICATION_TASK
  );

  console.log(TaskManager.getRegisteredTasksAsync());
  if (!isRegistered) {
    console.log("NOT REGISTERED");
    return BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 1 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
      data: { notificationDate, title, body },
    });
  } else {
    console.log("REGISTERED");
    return BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  }
};

const ReminderItem = ({ as, time, howmanytimeReminder }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useSelector(() => preferenceState.get());
  const [selectedFrequency, setSelectedFrequency] = useState("quotidien");

  const toggleSwitch = async () => {
    setIsEnabled((previousState) => !previousState);
    if (!isEnabled) {
      const notificationDate = new Date();
      notificationDate.setHours(time.hour);
      notificationDate.setMinutes(time.minutes);
      await registerBackgroundTask(
        notificationDate.toISOString(),
        as,
        `Il est temps pour ${as.toLowerCase()}`
      );
    } else {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    }
  };

  const frequencyOptions = [
    { label: "Quotidien", value: "quotidien" },
    { label: "Hebdomadaire", value: "hebdomadaire" },
    { label: "Le jour même", value: "lejourmeme" },
    { label: "Chaque deux jours", value: "chaquedeuxjours" },
    { label: "Chaque trois jours", value: "chaquetroisjours" },
  ];

  const renderFrequencyItem = ({ item }) => {
    const isSelected = item.value === selectedFrequency;
    const itemStyle = isSelected
      ? styles.selectedFrequency
      : styles.regularFrequency;
    return (
      <TouchableOpacity onPress={() => setSelectedFrequency(item.value)}>
        <Text style={[itemStyle, { color: isSelected ? "white" : "black" }]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.container}
        className="shadow-sm shadow-black"
      >
        <View style={styles.left}>
          <Text style={styles.textRegular}>{as}</Text>

          <Text style={styles.textRegular}>
            Rappeler: {howmanytimeReminder}
          </Text>
        </View>
        <View>
          <Switch
            trackColor={{
              false: theme === "pink" ? COLORS.neutral200 : COLORS.neutral250,
              true: theme === "pink" ? COLORS.accent600 : COLORS.accent800,
            }}
            thumbColor={isEnabled ? COLORS.neutral100 : COLORS.neutral100}
            ios_backgroundColor={COLORS.neutral200}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView} className="p-3 py-5">
            <Text className="text-[18px] text-center mb-10">{as}</Text>
            <Text className="mb-3">Périodicité</Text>
            <FlatList
              data={frequencyOptions}
              renderItem={renderFrequencyItem}
              keyExtractor={(item) => item.value}
              contentContainerStyle={{ marginBottom: 20 }}
            />
            <Button
              title="Terminer"
              onPress={() => setModalVisible(false)}
              color={COLORS.accent500}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedFrequency: {
    backgroundColor: COLORS.accent600,
    color: COLORS.white,
    padding: 10,
    borderRadius: 5,
  },
  regularFrequency: {
    backgroundColor: COLORS.neutral100,
    color: "black",
    padding: 10,
    borderRadius: 5,
  },
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutral100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  left: {
    gap: 12,
    alignItems: "flex",
  },
  time: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 20,
  },
  textRegular: {
    fontFamily: "Regular",
    fontSize: SIZES.medium,
  },
  textMedium: {
    fontFamily: "Medium",
    fontSize: SIZES.large,
  },
  modalContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    height: SIZES.height,
    alignItems: "center",
    justifyContent: "center",
  },
  modalView: {
    backgroundColor: "white",
    width: SIZES.width - 40,
    minHeight: SIZES.height * 0.3,
    borderRadius: 5,
  },
});

export default ReminderItem;
