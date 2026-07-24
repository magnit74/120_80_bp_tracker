import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { PhoneIcon } from './Icons';

export const CallOfferCard = () => {
  const navigation = useNavigation<any>();

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handlePress = () => {
    navigation.navigate('OfferDetail');
  };

  return (
    <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.card}>
      <TouchableOpacity 
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          <Text style={styles.badge}>HEALTH BENEFITS</Text>
          <Text style={styles.title}>Your Readings May Qualify You</Text>
          <Text style={styles.subtitle}>Special health plans with cash benefits. Check eligibility now.</Text>
        </View>
        <Animated.View style={[styles.phoneContainer, pulseStyle]}>
          <PhoneIcon size={24} color={colors.white} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 14,
  },
  badge: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 4,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textMedium,
    lineHeight: 18,
  },
  phoneContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});
