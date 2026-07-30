import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { HeartPulseIcon, GripIcon } from './Icons';

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
    if (systolic > 120) return '#F59E0B';
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
          {/* Status color vertical bar */}
          <View style={[styles.statusLine, { backgroundColor: getStatusColor() }]} />
          
          {/* Main content block */}
          <View style={styles.contentContainer}>
            <Text style={styles.timeText}>{time}</Text>
            
            <View style={styles.dataRow}>
              <View style={styles.bpRow}>
                <Text style={[styles.systolic, { color: getStatusColor() }]}>{systolic}</Text>
                <Text style={styles.slash}>/</Text>
                <Text style={styles.diastolic}>{diastolic}</Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              </View>

              {/* Pulse block */}
              <View style={styles.pulseContainer}>
                <HeartPulseIcon size={14} color={colors.pulse} />
                <Text style={styles.pulseValue}>{pulse}</Text>
              </View>
              
              {/* Swipe hint */}
              <View style={styles.dragHandle}>
                <GripIcon size={20} color="#D1D5DB" />
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
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 0,
    position: 'relative',
    ...shadows.sm,
  },
  statusLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#9CA3AF', // light gray
    marginBottom: 4,
    letterSpacing: 0.2,
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
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 30,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  slash: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 30,
    color: '#D1D5DB', // light gray slash
    marginHorizontal: 4,
  },
  diastolic: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 30,
    color: '#111827', // almost black
    fontVariant: ['tabular-nums'],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pulseValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: colors.pulse,
    fontVariant: ['tabular-nums'],
    marginLeft: 4,
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
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 12,
  },
  deleteText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
