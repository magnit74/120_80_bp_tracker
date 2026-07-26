import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const WidgetInstructionModal = ({ visible, onClose }: Props) => {
  const scale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.backdropArea} onPress={onClose} />
        <View style={styles.sheet}>
          
          <View style={styles.dragHandle} />
          
          <Text style={styles.title}>Add Home Screen Widget</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>Long press on an empty space on your home screen.</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>Select <Text style={{fontFamily:'Inter_700Bold'}}>"Widgets"</Text> from the menu.</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>Find <Text style={{fontFamily:'Inter_700Bold'}}>120/80 BP Tracker</Text>, drag and drop it!</Text>
            </View>
          </View>

          <Animated.View style={buttonStyle}>
            <Pressable 
              style={styles.button}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Got It!</Text>
            </Pressable>
          </Animated.View>
          
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 64,
    paddingTop: 14,
  },
  dragHandle: {
    width: 44,
    height: 5,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 28,
  },
  stepsContainer: {
    paddingHorizontal: 4,
    marginBottom: 36,
    gap: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: colors.textDark,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.white,
  },
});
