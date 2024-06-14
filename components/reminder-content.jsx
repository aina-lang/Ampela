import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES } from "../../constants";
import { useSelector } from "@legendapp/state/react";
import { preferenceState } from "@/legendstate/AmpelaStates";
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const registerBackgroundTask = async (notificationDate, title, body) => {
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.Status.Restricted || status === BackgroundFetch.Status.Denied) {
    console.log('Background execution is restricted or denied.');
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync('BACKGROUND_NOTIFICATION_TASK');
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync('BACKGROUND_NOTIFICATION_TASK', {
      minimumInterval: 60, // Exécutez la tâche toutes les 60 secondes
      stopOnTerminate: false, // Ne pas arrêter la tâche lorsque l'application est terminée
      startOnBoot: true, // Commencez la tâche au démarrage de l'appareil
      data: { notificationDate, title, body }, // Passer les paramètres ici
    });
  }
};

const ReminderItem = ({ as, time, onPress, howmanytimeReminder, selectedReminderInterval }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { theme } = useSelector(() => preferenceState.get());

  const scheduleNotification = async (interval) => {
    const notificationDate = new Date();
    notificationDate.setHours(time.hour);
    notificationDate.setMinutes(time.minutes);

    switch (interval) {
      case "Aujourd'hui":
        break; 
      case "Tous les jours":
        for (let i = 0; i < howmanytimeReminder; i++) {
          notificationDate.setDate(notificationDate.getDate() + i);
          await registerBackgroundTask(notificationDate.toISOString(), as, `Il est temps pour ${as.toLowerCase()}`);
        }
        break;
      case "3 jours":
        for (let i = 0; i < howmanytimeReminder; i++) {
          notificationDate.setDate(notificationDate.getDate() + 3 * i);
          await registerBackgroundTask(notificationDate.toISOString(), as, `Il est temps pour ${as.toLowerCase()}`);
        }
        break;
      case "2 jours":
        for (let i = 0; i < howmanytimeReminder; i++) {
          notificationDate.setDate(notificationDate.getDate() + 2 * i);
          await registerBackgroundTask(notificationDate.toISOString(), as, `Il est temps pour ${as.toLowerCase()}`);
        }
        break;
      case "1 jour":
        for (let i = 0; i < howmanytimeReminder; i++) {
          notificationDate.setDate(notificationDate.getDate() + 1 * i);
          await registerBackgroundTask(notificationDate.toISOString(), as, `Il est temps pour ${as.toLowerCase()}`);
        }
        break;
      case "Le jour même":
        await registerBackgroundTask(notificationDate.toISOString(), as, `Il est temps pour ${as.toLowerCase()}`);
        break;
      default:
        break;
    }
  };

  const toggleSwitch = async () => {
    setIsEnabled(previousState => !previousState);
    if (!isEnabled) {
      await scheduleNotification(selectedReminderInterval);
    } else {
      await BackgroundFetch.unregisterTaskAsync('BACKGROUND_NOTIFICATION_TASK');
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      className="shadow-sm shadow-black"
    >
      <View style={styles.left}>
        <Text style={styles.textRegular}>{as}</Text>
        <View style={styles.time}>
          <Text style={styles.textMedium}>
            {time?.hour.toString().padStart(2, "0")}
          </Text>
          <Text style={styles.textMedium}>{":"}</Text>
          <Text style={styles.textMedium}>
            {time?.minutes.toString().padStart(2, "0")}
          </Text>
        </View>
        <Text style={styles.textRegular}>Rappeler: {howmanytimeReminder}</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutral100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  left: {
    gap: 12,
    alignItems: "flex-start",
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
});

export default ReminderItem;
