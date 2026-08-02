import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as StoreReview from 'expo-store-review';
import analytics from '@react-native-firebase/analytics';

const LAST_REVIEW_COUNT_KEY = 'lastReviewAtCount';
const FEEDBACK_EMAIL = 'magnitik74@gmail.com';

export const shouldShowReviewPrompt = async (recordCount: number): Promise<boolean> => {
  try {
    if (recordCount < 3) return false;
    const lastStr = await AsyncStorage.getItem(LAST_REVIEW_COUNT_KEY);
    const lastCount = lastStr ? parseInt(lastStr, 10) : 0;
    return (recordCount - lastCount) >= 3;
  } catch {
    return false;
  }
};

export const showReviewDialog = (recordCount: number): void => {
  Alert.alert(
    'Rate Your Experience',
    'Are you enjoying 120/80 BP Tracker?',
    [
      { text: 'Cancel', style: 'cancel', onPress: () => markReviewShown(recordCount) },
      { text: 'Needs Work', onPress: () => handleRating(3, recordCount) },
      { text: 'Love it! ⭐', onPress: () => handleRating(5, recordCount) },
    ],
    { cancelable: true, onDismiss: () => markReviewShown(recordCount) }
  );
};

const markReviewShown = async (recordCount: number) => {
  await AsyncStorage.setItem(LAST_REVIEW_COUNT_KEY, recordCount.toString());
};

const handleRating = async (rating: number, recordCount: number) => {
  await markReviewShown(recordCount);
  
  if (rating <= 3) {
    // Low rating -> Firebase analytics event
    try {
      await analytics().logEvent('low_rating', { rating, platform: Platform.OS });
    } catch (e) {
      console.error('Analytics error:', e);
    }
    // Offer feedback
    Alert.alert(
      'We\'re Sorry',
      'Would you like to tell us how we can improve?',
      [
        { text: 'No Thanks', style: 'cancel' },
        { text: 'Send Feedback', onPress: () => sendFeedbackPrompt() },
      ]
    );
  } else {
    // High rating (4-5) -> native Store Review
    try {
      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
      }
    } catch (e) {
      console.error('Store review error:', e);
    }
  }
};

const sendFeedbackPrompt = () => {
  Alert.alert(
    'Send Feedback',
    `Please email us at ${FEEDBACK_EMAIL} with your suggestions. We read every message!`,
    [{ text: 'OK' }]
  );
};

// Legacy exports kept for compatibility
export const handlePositiveReview = async (): Promise<void> => {};
export const handleNegativeReviewDismiss = async (): Promise<void> => {};
export const sendFeedback = async (_message: string): Promise<boolean> => false;
