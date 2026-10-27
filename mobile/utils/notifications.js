import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import moment from "moment";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } catch (e) {
      token = null;
    }
  }

  return token;
}

export async function ensureNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Planifie une notification locale à une date précise.
// Retourne l'identifiant de la notification (pour annulation), ou null
// si la date est déjà passée.
export async function scheduleNotification(title, body, date) {
  if (!date || new Date(date) <= new Date()) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(date),
    },
  });
}

// Planifie les rappels du cycle : début des prochaines règles et ovulation.
export async function scheduleCycleNotifications(
  lastMenstruationDate,
  cycleDuration
) {
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  const nextMenstruationDate = moment(lastMenstruationDate)
    .add(cycleDuration, "days")
    .hour(8)
    .minute(0);
  const ovulationDate = moment(lastMenstruationDate)
    .add(Math.round(cycleDuration / 2), "days")
    .hour(8)
    .minute(0);

  await scheduleNotification(
    "Rappel de Menstruation",
    "Votre menstruation commence aujourd'hui.",
    nextMenstruationDate.toDate()
  );

  await scheduleNotification(
    "Rappel d'Ovulation",
    "Aujourd'hui est votre jour d'ovulation.",
    ovulationDate.toDate()
  );
}
