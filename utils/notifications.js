import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import moment from 'moment';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

export async function scheduleNotification(title, body, date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: { date: date },
  });
}

export async function scheduleCycleNotifications(lastMenstruationDate, cycleDuration) {
  const ovulationDate = moment(lastMenstruationDate).add(cycleDuration - 14, 'days');
  const nextMenstruationDate = moment(lastMenstruationDate).add(cycleDuration, 'days');

  // Planifier notification pour l'ovulation
  await scheduleNotification('Ovulation Reminder', 'Today is your ovulation day!', ovulationDate.toDate());

  // Planifier notification pour la prise de pilule quotidienne
  for (let i = 1; i < cycleDuration; i++) {
    const pillReminderDate = moment(lastMenstruationDate).add(i, 'days');
    await scheduleNotification('Pill Reminder', 'Time to take your pill!', pillReminderDate.toDate());
  }

  // Planifier notification pour le début des règles
  await scheduleNotification('Menstruation Reminder', 'Your menstruation starts today!', nextMenstruationDate.toDate());
}
