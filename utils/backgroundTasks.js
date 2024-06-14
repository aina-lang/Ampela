import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

TaskManager.defineTask('BACKGROUND_NOTIFICATION_TASK', async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  const { notificationDate, title, body } = data;
  
  
  const now = new Date();
  const notificationTime = new Date(notificationDate);

  if (notificationTime > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: { someData: 'goes here' },
      },
      trigger: { date: notificationTime },
    });
  }

  return BackgroundFetch.BackgroundFetchResult.NewData;
});
