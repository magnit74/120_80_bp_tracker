import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as StoreReview from 'expo-store-review';
import * as MailComposer from 'expo-mail-composer';

const REVIEW_SHOWN_KEY = 'reviewShown';
const FEEDBACK_EMAIL = 'magnitik74@gmail.com';

export const shouldShowReviewPrompt = async (recordCount: number): Promise<boolean> => {
  try {
    const shown = await AsyncStorage.getItem(REVIEW_SHOWN_KEY);
    // if (shown === 'true') return false; // Disabled for testing
    if (recordCount < 0) return false; // Changed to 0 for immediate testing
    return true;
  } catch {
    return false;
  }
};

export const handlePositiveReview = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(REVIEW_SHOWN_KEY, 'true');
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      if (Platform.OS === 'android') {
        // Fallback for testing, since Play Store won't show it for sideloaded APKs
        Alert.alert("Store Review", "Native prompt would appear here (if installed from Play Store).");
      }
      await StoreReview.requestReview();
    }
  } catch (error) {
    console.error('Store review error:', error);
  }
};

export const handleNegativeReviewDismiss = async (): Promise<void> => {
  await AsyncStorage.setItem(REVIEW_SHOWN_KEY, 'true');
};

export const sendFeedback = async (message: string): Promise<boolean> => {
  try {
    const available = await MailComposer.isAvailableAsync();
    if (!available) return false;

    await MailComposer.composeAsync({
      recipients: [FEEDBACK_EMAIL],
      subject: '120/80 BP Tracker - User Feedback',
      body: `User Feedback:\n\n${message}\n\n---\nSent from 120/80 BP Tracker ${Platform.OS === 'ios' ? 'iOS' : 'Android'} app`,
    });
    await AsyncStorage.setItem(REVIEW_SHOWN_KEY, 'true');
    return true;
  } catch {
    return false;
  }
};
