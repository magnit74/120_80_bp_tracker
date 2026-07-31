import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { HeartPulseIcon } from './Icons';

export interface RecordCardProps extends Omit<PressableProps, 'style'> {
  systolic: number;
  diastolic: number;
  pulse: number;
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
  onPressIn,
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

  const getStatusInfo = () => {
    if (systolic >= 140 || diastolic >= 90) return { label: 'High', color: colors.premium.redTo, bg: 'rgba(204,32,44,0.1)' };
    if (systolic >= 130 || diastolic > 80) return { label: 'Elevated', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
    if (systolic > 120) return { label: 'Elevated', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }; 
    return { label: 'Normal', color: colors.premium.greenTo, bg: 'rgba(116,214,128,0.2)' };
  };

  const status = getStatusInfo();

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
          <View style={styles.leftContent}>
            <View style={styles.iconBox}>
              <HeartPulseIcon size={24} color={colors.premium.redTo} />
            </View>
            <View>
              <View style={styles.bpRow}>
                <Text style={styles.bpVal}>{systolic}</Text>
                <Text style={styles.bpSlash}>/</Text>
                <Text style={styles.bpVal}>{diastolic}</Text>
              </View>
              <Text style={styles.timeText}>{time}</Text>
            </View>
          </View>

          <View style={styles.rightContent}>
            <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
            <View style={styles.pulseRow}>
              <HeartPulseIcon size={14} color={colors.premium.textMuted} />
              <Text style={styles.pulseVal}>{pulse}</Text>
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.premium.borderSolid,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(204, 32, 44, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  bpVal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: colors.premium.textMain,
    lineHeight: 20,
  },
  bpSlash: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 16,
    marginHorizontal: 4,
  },
  timeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.premium.textMuted,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pulseVal: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#4B5563',
  },
  deleteButton: {
    backgroundColor: colors.premium.redTo,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 24,
    marginBottom: 16,
    marginLeft: -20,
  },
  deleteText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.white,
  },
});
