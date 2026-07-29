import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldIcon, HeartPulseIcon, ClockIcon, SunIcon, CheckCircleIcon } from './Icons';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

const TIPS = [
  { title: "Hydration is Key", text: "Drink at least 8 glasses of water a day to help regulate your blood pressure.", Icon: ClockIcon, color: "#3B82F6" },
  { title: "Reduce Sodium", text: "Limit salty foods. Too much sodium causes your body to hold onto fluids, raising BP.", Icon: ShieldIcon, color: "#F59E0B" },
  { title: "Stay Active", text: "30 minutes of daily walking can significantly improve your cardiovascular health.", Icon: HeartPulseIcon, color: "#EF4444" },
  { title: "Morning Routine", text: "Measure your blood pressure at the same time every morning before coffee or exercise.", Icon: SunIcon, color: "#8B5CF6" },
  { title: "Stress Less", text: "Practice deep breathing or meditation for 5 minutes to instantly lower stress levels.", Icon: CheckCircleIcon, color: "#10B981" },
];

export const DailyHealthTip = () => {
  const todayTip = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return TIPS[dayOfYear % TIPS.length];
  }, []);

  const IconComponent = todayTip.Icon;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: todayTip.color + '15' }]}>
            <IconComponent size={24} color={todayTip.color} />
          </View>
          <Text style={styles.label}>Daily Health Tip</Text>
        </View>
        <Text style={styles.title}>{todayTip.title}</Text>
        <Text style={styles.text}>{todayTip.text}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.textLight,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 6,
  },
  text: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMedium,
    lineHeight: 22,
  },
});
