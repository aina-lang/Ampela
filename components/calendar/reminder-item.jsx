import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { COLORS, SIZES } from "@/constants";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { AntDesign, Feather } from "@expo/vector-icons";

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

    if (notificationTime > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: { someData: "goes here" } },
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

  if (!isRegistered) {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 1 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
      data: { notificationDate, title, body },
    });
  } else {
    return BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  }
};

const frequencyOptions = [
  { label: "Quotidien", value: "quotidien" },
  { label: "Hebdomadaire", value: "hebdomadaire" },
  { label: "Le jour même", value: "lejourmeme" },
  { label: "Chaque deux jours", value: "chaquedeuxjours" },
  { label: "Chaque trois jours", value: "chaquetroisjours" },
];

const pad = (n) => String(n).padStart(2, "0");

const ReminderItem = ({ as, time, howmanytimeReminder, onRegister }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState(
    howmanytimeReminder || "quotidien"
  );
  const [hour, setHour] = useState(time?.hour ?? 8);
  const [minute, setMinute] = useState(time?.minutes ?? 0);

  const toggleSwitch = async () => {
    setIsEnabled((previousState) => !previousState);
    if (!isEnabled) {
      const notificationDate = new Date();
      notificationDate.setHours(hour);
      notificationDate.setMinutes(minute);
      await registerBackgroundTask(
        notificationDate.toISOString(),
        as,
        `Il est temps pour ${as.toLowerCase()}`
      );
    } else {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    }
  };

  const handleConfirm = () => {
    setModalVisible(false);
    onRegister?.(as, hour, minute, selectedFrequency);
  };

  const changeHour = (delta) => {
    setHour((h) => (h + delta + 24) % 24);
  };

  const changeMinute = (delta) => {
    setMinute((m) => (m + delta + 60) % 60);
  };

  const renderFrequencyItem = ({ item }) => {
    const isSelected = item.value === selectedFrequency;
    return (
      <TouchableOpacity
        onPress={() => setSelectedFrequency(item.value)}
        style={[
          styles.chip,
          {
            backgroundColor: isSelected ? "#FF7575" : "#FAFAFA",
            borderColor: isSelected ? "#FF7575" : "#F0F0F0",
          },
        ]}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.chipText,
            { color: isSelected ? COLORS.neutral100 : "#3A3A3A" },
          ]}
        >
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
        activeOpacity={0.85}
      >
        <View style={styles.left}>
          <Text style={styles.title}>{as}</Text>
          <Text style={styles.subtitle}>
            {pad(hour)}:{pad(minute)} · {selectedFrequency}
          </Text>
        </View>
        <Switch
          trackColor={{ false: "#E5E5E5", true: "#FF7575" }}
          thumbColor={COLORS.neutral100}
          ios_backgroundColor="#E5E5E5"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{as}</Text>

            <Text style={styles.sectionLabel}>Heure du rappel</Text>
            <View style={styles.stepperRow}>
              <View style={styles.stepperGroup}>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => changeHour(-1)}
                >
                  <AntDesign name="minus" size={16} color="#FF7575" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{pad(hour)}</Text>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => changeHour(1)}
                >
                  <AntDesign name="plus" size={16} color="#FF7575" />
                </TouchableOpacity>
              </View>

              <Text style={styles.stepperColon}>:</Text>

              <View style={styles.stepperGroup}>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => changeMinute(-5)}
                >
                  <AntDesign name="minus" size={16} color="#FF7575" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{pad(minute)}</Text>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => changeMinute(5)}
                >
                  <AntDesign name="plus" size={16} color="#FF7575" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Périodicité</Text>
            <FlatList
              data={frequencyOptions}
              renderItem={renderFrequencyItem}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.chipList}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={styles.confirmButton}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmButtonText}>Terminer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutral100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  left: {
    gap: 4,
  },
  title: {
    fontFamily: "SBold",
    fontSize: SIZES.medium,
    color: "#1A1A1A",
  },
  subtitle: {
    fontFamily: "Regular",
    fontSize: SIZES.small - 1,
    color: "#8A8A8A",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalView: {
    backgroundColor: COLORS.neutral100,
    width: SIZES.width - 40,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 2,
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#3A3A3A",
    marginBottom: 10,
    marginTop: 6,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  stepperGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF7575",
  },
  stepperValue: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 4,
    color: "#1A1A1A",
    minWidth: 34,
    textAlign: "center",
  },
  stepperColon: {
    fontFamily: "Bold",
    fontSize: SIZES.medium + 4,
    color: "#1A1A1A",
  },
  chipList: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  chipText: {
    fontFamily: "Regular",
    fontSize: SIZES.small,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#EFEFEF",
  },
  cancelButtonText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: "#7A7A7A",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#FF7575",
    shadowColor: "#FF7575",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmButtonText: {
    fontFamily: "SBold",
    fontSize: SIZES.small,
    color: COLORS.neutral100,
  },
});

export default ReminderItem;