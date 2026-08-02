import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import analytics from '@react-native-firebase/analytics';

const LAST_REVIEW_COUNT_KEY = 'lastReviewAtCount';

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

export const markReviewShown = async (recordCount: number) => {
  await AsyncStorage.setItem(LAST_REVIEW_COUNT_KEY, recordCount.toString());
};

export const submitRating = async (rating: number, recordCount: number, feedback: string) => {
  await markReviewShown(recordCount);
  
  if (rating <= 3) {
    // Low rating -> Firebase analytics event with feedback
    try {
      await analytics().logEvent('low_rating', { 
        rating, 
        platform: Platform.OS,
        feedback: feedback 
      });
    } catch (e) {
      console.error('Analytics error:', e);
    }
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

// Legacy exports kept for compatibility just in case
export const handlePositiveReview = async (): Promise<void> => {};
export const handleNegativeReviewDismiss = async (): Promise<void> => {};
export const sendFeedback = async (_message: string): Promise<boolean> => false;
export const showReviewDialog = (recordCount: number): void => {};
