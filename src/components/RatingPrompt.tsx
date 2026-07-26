import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { StarIcon, StarFilledIcon } from './Icons';
import { handlePositiveReview, handleNegativeReviewDismiss, sendFeedback } from '../services/reviewService';

interface RatingPromptProps {
  recordCount: number;
  onDismiss: () => void;
}

export const RatingPrompt: React.FC<RatingPromptProps> = ({ recordCount, onDismiss }) => {
  const [selectedStars, setSelectedStars] = useState(0);
  const [view, setView] = useState<'stars' | 'feedback'>('stars');
  const [feedbackText, setFeedbackText] = useState('');
  const [sent, setSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);

  // Auto-dismiss "Thank you" after 2.5 seconds
  useEffect(() => {
    if (sent) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [sent, onDismiss]);

  const handleStarPress = (stars: number) => {
    Haptics.selectionAsync();
    setSelectedStars(stars);
  };

  const handleSubmit = async () => {
    try {
      if (selectedStars >= 4) {
        await handlePositiveReview();
        onDismiss();
      } else {
        setView('feedback');
      }
    } catch (error) {
      console.error('Review submit error:', error);
      onDismiss();
    }
  };

  const handleSendFeedback = async () => {
    if (feedbackText.trim().length === 0) return;
    try {
      const result = await sendFeedback(feedbackText.trim());
      if (result) {
        setSent(true);
      } else {
        setFeedbackError(true);
      }
    } catch (error) {
      console.error('Feedback error:', error);
      setFeedbackError(true);
    }
  };

  const handleCancelFeedback = async () => {
    try {
      await handleNegativeReviewDismiss();
    } catch (error) {
      console.error('Cancel feedback error:', error);
    }
    onDismiss();
  };

  const handleNotNow = async () => {
    try {
      await handleNegativeReviewDismiss();
    } catch (error) {
      console.error('Not now error:', error);
    }
    onDismiss();
  };

  if (sent) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.card}>
        <View style={styles.sentContainer}>
          <Text style={styles.sentTitle}>Thank you!</Text>
          <Text style={styles.sentText}>Your feedback helps us improve.</Text>
        </View>
      </Animated.View>
    );
  }

  if (view === 'feedback') {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.card}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <Text style={styles.title}>We're sorry to hear that</Text>
          <Text style={styles.subtitle}>What can we improve?</Text>

          {feedbackError && (
            <Text style={styles.errorText}>
              Could not send feedback. Please try again later.
            </Text>
          )}

          <TextInput
            style={styles.textInput}
            placeholder="Tell us what's wrong..."
            placeholderTextColor={colors.textLight}
            value={feedbackText}
            onChangeText={(text) => {
              setFeedbackText(text);
              setFeedbackError(false);
            }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelFeedback}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sendButton, feedbackText.trim().length === 0 && styles.sendButtonDisabled]}
              onPress={handleSendFeedback}
              disabled={feedbackText.trim().length === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.sendText}>Send Feedback</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.card}>
      <Text style={styles.title}>You've logged {recordCount} readings!</Text>
      <Text style={styles.subtitle}>How's 120/80 working for you?</Text>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            activeOpacity={0.6}
            style={styles.starButton}
          >
            {star <= selectedStars ? (
              <StarFilledIcon size={40} color={colors.primary} />
            ) : (
              <StarIcon size={40} color={colors.border} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedStars > 0 && (
        <Animated.View entering={FadeIn.duration(200)}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.notNowButton}
        onPress={handleNotNow}
        activeOpacity={0.7}
      >
        <Text style={styles.notNowText}>Not now</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMedium,
    textAlign: 'center',
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.white,
  },
  notNowButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  notNowText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textLight,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.textDark,
    backgroundColor: colors.background,
    minHeight: 100,
    marginBottom: 16,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: colors.textMedium,
  },
  sendButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.white,
  },
  sentContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sentTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: colors.primary,
    marginBottom: 4,
  },
  sentText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMedium,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 12,
  },
});
