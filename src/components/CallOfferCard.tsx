import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence, withDelay } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { PhoneIcon } from './Icons';

export const CallOfferCard = () => {
  const navigation = useNavigation<any>();

  const pulse = useSharedValue(1);
  const shimmerTranslate = useSharedValue(-200);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    shimmerTranslate.value = withRepeat(
      withSequence(
        withTiming(400, { duration: 2500, easing: Easing.linear }),
        withDelay(3000, withTiming(-200, { duration: 0 }))
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  const handlePress = () => {
    Vibration.vibrate([0, 30, 20, 40]); // Heavy haptic pattern
    navigation.navigate('OfferDetail');
  };

  return (
    <Animated.View entering={FadeInDown.delay(300).duration(500)}>
      <TouchableOpacity 
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.shimmerContainer}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>

        <View style={styles.content}>
          <View style={styles.textContainer}>
            <View style={styles.badgeContainer}>
              <View style={styles.pulseDot} />
              <Text style={styles.badge}>PREMIUM BENEFIT</Text>
            </View>
            <Text style={styles.title}>Claim Your Cash Benefit</Text>
            <Text style={styles.subtitle}>Seniors 65+ may qualify for $100s in health rewards. Call now to verify.</Text>
          </View>
          <Animated.View style={[styles.phoneContainer, pulseStyle]}>
            <PhoneIcon size={26} color={colors.white} />
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmer: {
    width: 60,
    height: '200%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '25deg' }],
    position: 'absolute',
    top: -50,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 6,
  },
  badge: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#60A5FA',
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
    color: colors.white,
    marginBottom: 6,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  phoneContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
});
