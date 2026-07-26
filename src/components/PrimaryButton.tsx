import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface PrimaryButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  style?: StyleProp<ViewStyle>;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  title, 
  style, 
  disabled, 
  onPress,
  onPressIn,
  onPressOut,
  ...props 
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = useCallback((e: any) => {
    if (!disabled) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onPressIn) onPressIn(e);
  }, [disabled, onPressIn, scale]);

  const handlePressOut = useCallback((e: any) => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
    if (onPressOut) onPressOut(e);
  }, [disabled, onPressOut, scale]);

  const handlePress = useCallback((e: any) => {
    if (!disabled && onPress) {
      onPress(e);
    }
  }, [disabled, onPress]);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable 
        style={[styles.button, disabled && styles.disabled]} 
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        {...props}
      >
        <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.border,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
  textDisabled: {
    color: colors.textLight,
  },
});
