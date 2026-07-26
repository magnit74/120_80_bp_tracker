import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
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
      <LinearGradient
        colors={['#F0FDFA', '#E0F7FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <ShieldIcon size={22} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>HEALTH TIP</Text>
          <Text style={styles.text}>{BENEFITS[benefitIndex]}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.md,
  },
  gradient: {
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
  },
  text: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: colors.textDark,
    lineHeight: 22,
  },
});
