import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { HeartPulseIcon } from './Icons';

export interface RecordCardProps extends Omit<PressableProps, 'style'> {
  systolic: number;
  diastolic: number;
  pulse: number;
  time: string;
  style?: any;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  systolic,
  diastolic,
  pulse,
  time,
  style,
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

  const getStatusColor = () => {
    if (systolic >= 140 || diastolic >= 90) return colors.danger;
    if (systolic >= 130 || diastolic > 80) return colors.warning;
    if (systolic > 120) return '#F59E0B';
    return colors.success;
  };

  const getStatusLabel = () => {
    if (systolic >= 140 || diastolic >= 90) return 'High';
    if (systolic >= 130 || diastolic > 80) return 'Stage 1';
    if (systolic > 120) return 'Elevated';
    return 'Normal';
  };

  const handlePressIn = useCallback((e: any) => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPressIn) onPressIn(e);
  }, [onPressIn, scale]);

  const handlePressOut = useCallback((e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    if (onPressOut) onPressOut(e);
  }, [onPressOut, scale]);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        style={styles.card}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        {...props}
      >
      <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
      
      <View style={styles.timeSection}>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      <View style={styles.bpSection}>
        <Text style={[styles.bpNumber, { color: getStatusColor() }]} adjustsFontSizeToFit numberOfLines={1}>{systolic}</Text>
        <Text style={styles.bpSlash}>/</Text>
        <Text style={styles.bpDiastolic} adjustsFontSizeToFit numberOfLines={1}>{diastolic}</Text>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
      </View>

      <View style={styles.pulseSection}>
        <HeartPulseIcon size={14} color={colors.pulse} />
        <Text style={styles.pulseValue}>{pulse}</Text>
      </View>
      
      <Text style={styles.arrow}>›</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    marginBottom: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
    ...shadows.md,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  timeSection: {
    width: 75,
  },
  timeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textMedium,
  },
  bpSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 8,
  },
  bpNumber: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  bpSlash: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    color: colors.textLight,
    marginHorizontal: 2,
  },
  bpDiastolic: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    color: colors.textDark,
    letterSpacing: -0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 12,
  },
  statusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  pulseSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  pulseValue: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: colors.textDark,
  },
  arrow: {
    fontFamily: 'Inter_400Regular',
    fontSize: 22,
    color: colors.textLight,
    marginTop: -2,
  }
});
