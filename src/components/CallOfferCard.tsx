import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { PhoneIcon } from './Icons';

export const CallOfferCard = () => {
  const navigation = useNavigation<any>();

  const pulse = useSharedValue(1);
  const rotation = useSharedValue(0);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    rotation.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 100 }),
        withTiming(0, { duration: 1500 }) // pause
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulse.value },
      { rotateZ: `${rotation.value}deg` }
    ],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }]
  }));

  const handlePressIn = useCallback(() => {
    cardScale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [cardScale]);

  const handlePressOut = useCallback(() => {
    cardScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [cardScale]);

  const handlePress = () => {
    navigation.navigate('OfferDetail');
  };

  return (
    <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.card, cardAnimatedStyle]}>
      <LinearGradient
        colors={['#ECFDF5', '#F0FDFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <Pressable 
          style={styles.content}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
        >
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              <Text style={{ color: colors.success }}>Free </Text>
              Benefits Check
            </Text>
            <Text style={styles.subtitle}>Your BP readings may qualify you for <Text style={{fontFamily: 'Inter_700Bold', color: colors.success}}>up to $150/mo</Text>. Check now →</Text>
          </View>
          <Animated.View style={[styles.phoneContainer, animatedStyle]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.phoneGradient}
            >
              <PhoneIcon size={28} color={colors.white} />
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    ...shadows.lg,
  },
  cardGradient: {
    borderRadius: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 14,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
    color: colors.textDark,
    marginBottom: 6,
    lineHeight: 26,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: colors.textMedium,
    lineHeight: 22,
  },
  phoneContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow('#10B981', 0.4),
  },
  phoneGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
