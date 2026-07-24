import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ShieldIcon } from './Icons';

const BENEFITS = [
  "Your doctor will thank you for consistent tracking.",
  "Consistent timing = more accurate trends.",
  "Wait 30 min after coffee or exercise before measuring.",
  "Sit quietly for 5 minutes before measuring."
];

export const HealthBenefitCard = () => {
  const [benefitIndex, setBenefitIndex] = useState(0);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() / 86400000) % BENEFITS.length);
    setBenefitIndex(dayOfYear);
  }, []);

  return (
    <Animated.View entering={FadeIn.delay(300).duration(500)} style={styles.card}>
      <View style={styles.iconContainer}>
        <ShieldIcon size={18} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>HEALTH TIP</Text>
        <Text style={styles.text}>{BENEFITS[benefitIndex]}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
  },
  text: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textDark,
    lineHeight: 18,
  },
});
