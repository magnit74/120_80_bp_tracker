import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { HeartPulseIcon, GripIcon } from './Icons';
import { shadows } from '../theme/shadows';

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

  const getStatusColor = () => {
    if (systolic >= 140 || diastolic >= 90) return colors.danger;
    if (systolic >= 130 || diastolic > 80) return colors.warning;
    if (systolic > 120) return colors.warning; // Elevated
    return colors.success;
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
          <View style={[styles.statusLine, { backgroundColor: getStatusColor() }]} />
          
          <View style={styles.contentContainer}>
            <Text style={styles.timeText}>{time}</Text>
            
            <View style={styles.dataRow}>
              <View style={styles.bpRow}>
                <Text style={[styles.systolic, { color: getStatusColor() }]}>{systolic}</Text>
                <Text style={styles.slash}>/</Text>
                <Text style={styles.diastolic}>{diastolic}</Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              </View>

              <View style={styles.pulseContainer}>
                <HeartPulseIcon size={16} color={colors.pulse} />
                <Text style={styles.pulseValue}>{pulse}</Text>
              </View>
              
              <View style={styles.dragHandle}>
                <GripIcon size={20} color={colors.outlineVariant} />
              </View>
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 0,
    position: 'relative',
    ...shadows.sm, // Soft shadow from Stitch
  },
  statusLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  timeText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  systolic: {
    ...typography.headlineLg,
    fontVariant: ['tabular-nums'],
  },
  slash: {
    ...typography.headlineLg,
    color: colors.outlineVariant,
    marginHorizontal: 4,
  },
  diastolic: {
    ...typography.headlineLg,
    color: colors.onSurface,
    fontVariant: ['tabular-nums'],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pulseValue: {
    ...typography.bodyLg,
    fontFamily: 'Inter_600SemiBold',
    color: colors.tertiary,
    fontVariant: ['tabular-nums'],
    marginLeft: 6,
  },
  dragHandle: {
    width: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 16,
  },
  deleteText: {
    ...typography.labelLg,
    color: colors.onError,
  },
});
