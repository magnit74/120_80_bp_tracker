import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface SecondaryButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  style?: StyleProp<ViewStyle>;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ 
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
    backgroundColor: colors.background,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  disabled: {
    borderColor: colors.borderLight,
    backgroundColor: colors.cardWarm,
  },
  text: {
    ...typography.button,
    color: colors.textDark,
  },
  textDisabled: {
    color: colors.textLight,
  },
});
