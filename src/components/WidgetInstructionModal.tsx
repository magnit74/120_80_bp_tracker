import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform, Dimensions, TouchableOpacity, Vibration } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { HeartPulseIcon, ShieldIcon, ChartIcon } from './Icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const WidgetInstructionModal = ({ visible, onClose }: Props) => {
  const [step, setStep] = useState(1);

  if (!visible) return null;

  const handleNext = () => {
    Vibration.vibrate(15);
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(1);
      onClose();
    }
  };

  const renderContent = () => {
    if (step === 1) {
      return (
        <Animated.View key="step1" entering={FadeIn} exiting={FadeOut} style={styles.stepContent}>
          <View style={styles.iconCircle}>
            <HeartPulseIcon size={40} color={colors.primary} />
          </View>
          <Text style={styles.stepTitle}>Long Press Home Screen</Text>
          <Text style={styles.stepDesc}>Go to your phone's home screen and long press on an empty space.</Text>
        </Animated.View>
      );
    }
    if (step === 2) {
      return (
        <Animated.View key="step2" entering={FadeIn} exiting={FadeOut} style={styles.stepContent}>
          <View style={styles.iconCircle}>
            <ChartIcon size={40} color={colors.primary} />
          </View>
          <Text style={styles.stepTitle}>Select "Widgets"</Text>
          <Text style={styles.stepDesc}>Look for the Widgets menu at the bottom of your screen.</Text>
        </Animated.View>
      );
    }
    return (
      <Animated.View key="step3" entering={FadeIn} exiting={FadeOut} style={styles.stepContent}>
        <View style={styles.iconCircle}>
          <ShieldIcon size={40} color={colors.primary} />
        </View>
        <Text style={styles.stepTitle}>Find 120/80 BP</Text>
        <Text style={styles.stepDesc}>Scroll down to 120/80 BP Tracker, hold the widget, and drag it to your screen.</Text>
      </Animated.View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View entering={SlideInDown.duration(300).springify()} exiting={SlideOutDown.duration(200)} style={styles.sheet}>
          
          <View style={styles.dragHandle} />
          
          <Text style={styles.title}>Add the Widget</Text>
          
          <View style={styles.stepsContainer}>
            {renderContent()}
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{step === 3 ? 'Got It!' : 'Next Step'}</Text>
          </TouchableOpacity>
          
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepsContainer: {
    alignItems: 'center',
    height: 180, // Fixed height to prevent jumping when content changes
    justifyContent: 'flex-start',
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
    position: 'absolute', // Allows smooth crossfading without pushing elements
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },
});
