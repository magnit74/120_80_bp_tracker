import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { HeartPulseIcon } from './Icons';

export interface RecordCardProps extends Omit<PressableProps, 'style'> {
  systolic: number;
  diastolic: number;
  time: string;
  style?: any;
  onDelete?: () => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  systolic,
  diastolic,
  pulse,
  time,
  style,
  onPress,
  onPressOut,
  onDelete,
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

  const renderRightActions = () => {
    if (!onDelete) return null;
    return (
      <Pressable style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    );
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Swipeable renderRightActions={renderRightActions}>
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

        <View style={styles.statusBadge}>
          <View style={[styles.badgeDot, { backgroundColor: getStatusColor() }]} />
        </View>

        <View style={styles.pulseSection}>
          <HeartPulseIcon size={14} color={colors.pulse} />
          <Text style={styles.pulseValue}>{pulse}</Text>
        </View>
        
        <Text style={styles.arrow}>›</Text>
        </Pressable>
      </Swipeable>
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
  badgeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    width: 24,
    height: 24,
  },
  pulseSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  pulseValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.pulse,
    marginLeft: 6,
  },
  arrow: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
    color: colors.textMuted,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 10,
  },
  deleteText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
