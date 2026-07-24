import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

export const scheduleDailyReminder = async (time: Date, identifier: string, title: string, body: string) => {
  await cancelReminder(identifier);
  
  const trigger: Notifications.CalendarTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    hour: time.getHours(),
    minute: time.getMinutes(),
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger,
    identifier,
  });
};

export const cancelReminder = async (identifier: string) => {
  await Notifications.cancelScheduledNotificationAsync(identifier);
};
