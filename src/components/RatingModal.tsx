import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { colors } from '../theme/colors';

interface RatingModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (rating: number, feedback: string) => void;
}

const { width } = Dimensions.get('window');

export const RatingModal: React.FC<RatingModalProps> = ({ visible, onDismiss, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setRating(0);
      setFeedback('');
    }
  }, [visible]);

  const handleSubmit = () => {
    onSubmit(rating, feedback);
  };

  const showFeedbackInput = rating > 0 && rating <= 3;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />
        
        <Animated.View 
          entering={FadeInUp.duration(300)} 
          exiting={FadeOutDown.duration(200)}
          style={styles.card}
        >
          {/* Top Icon */}
          <View style={styles.iconCircle}>
            <MaterialIcons name="star" size={36} color="#F59E0B" />
          </View>
          
          <Text style={styles.title}>Are you enjoying 120/80 BP Tracker?</Text>
          <Text style={styles.subtitle}>Your opinion helps us get better every day.</Text>

          {/* Stars */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                style={styles.starBtn}
              >
                <MaterialIcons 
                  name={rating >= star ? 'star' : 'star-border'} 
                  size={42} 
                  color={rating >= star ? '#F59E0B' : '#E5E7EB'} 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback Input (1-3 stars) */}
          {showFeedbackInput && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>What can we improve?</Text>
              <TextInput
                style={styles.input}
                placeholder="Tell us what you didn't like..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={feedback}
                onChangeText={setFeedback}
                autoFocus
              />
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
            disabled={rating === 0}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={rating > 0 ? ['#EF4444', '#DC2626'] : ['#E5E7EB', '#E5E7EB']}
              style={styles.submitGradient}
            >
              <Text style={[styles.submitText, rating === 0 && styles.submitTextDisabled]}>
                {rating === 0 ? 'Rate App' : (showFeedbackInput ? 'Send Feedback' : 'Rate in App Store')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Not Now */}
          <TouchableOpacity style={styles.notNowBtn} onPress={onDismiss}>
            <Text style={styles.notNowText}>Not Now</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  starBtn: {
    padding: 4,
  },
  feedbackContainer: {
    width: '100%',
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitTextDisabled: {
    color: '#9CA3AF',
  },
  notNowBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  notNowText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});
