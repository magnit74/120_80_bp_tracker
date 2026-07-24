import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors } from '../theme/colors';

export interface RecordCardProps extends TouchableOpacityProps {
  systolic: number;
  diastolic: number;
  pulse: number;
  time: string;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  systolic,
  diastolic,
  pulse,
  time,
  style,
  ...props
}) => {
  const getStatusColor = () => {
    // AHA 2017 guidelines
    if (systolic >= 140 || diastolic >= 90) return colors.danger;
    if (systolic >= 120 || diastolic >= 80) return colors.warning;
    return colors.success;
  };

  const getStatusLabel = () => {
    if (systolic >= 140 || diastolic >= 90) return 'High';
    if (systolic >= 120 || diastolic >= 80) return 'Elevated';
    return 'Normal';
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.topRow}>
        <View style={styles.bpSection}>
          <Text style={styles.bpNumber}>{systolic}</Text>
          <Text style={styles.bpSlash}>/</Text>
          <Text style={styles.bpDiastolic}>{diastolic}</Text>
          <Text style={styles.bpUnit}>mmHg</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.pulseSection}>
          <View style={styles.pulseIcon}>
            <Text style={styles.pulseIconText}>♥</Text>
          </View>
          <Text style={styles.pulseValue}>{pulse}</Text>
          <Text style={styles.pulseUnit}>bpm</Text>
        </View>

        <Text style={styles.timeText}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bpSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bpNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: colors.textDark,
    letterSpacing: -1,
  },
  bpSlash: {
    fontFamily: 'Inter_300Light',
    fontSize: 32,
    color: colors.textLight,
    marginHorizontal: 4,
  },
  bpDiastolic: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: colors.textDark,
    letterSpacing: -1,
  },
  bpUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textLight,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pulseSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseIconText: {
    fontSize: 12,
  },
  pulseValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.textDark,
  },
  pulseUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textLight,
  },
  timeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textLight,
  },
});
