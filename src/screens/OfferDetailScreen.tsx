import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { PhoneIcon } from '../components/Icons';

export const OfferDetailScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [spotsLeft] = useState(13);

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleCall = () => {
    Linking.openURL('tel:+18882172735');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>X</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.delay(100).duration(400)}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTag}>EXCLUSIVE OFFER</Text>
            <Text style={styles.heroTitle}>Your Blood Pressure May Qualify You for $150/Month</Text>
            <Text style={styles.heroSubtitle}>
              People with high blood pressure often overpay for health insurance
              or have no coverage at all. Special plans exist that pay YOU back
              every month. A 3-minute call can tell you if you qualify.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Text style={styles.sectionTitle}>WHAT YOU GET</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>$150</Text>
            <Text style={styles.statLabel}>month cash back</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3-5</Text>
            <Text style={styles.statLabel}>minute call</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>FREE</Text>
            <Text style={styles.statLabel}>assessment</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionTitle}>HOW IT WORKS</Text>
        </Animated.View>

        {[
          { num: '1', title: 'Call for Free Assessment', desc: 'A licensed specialist reviews your profile and health needs at no cost to you.' },
          { num: '2', title: 'Get Matched to Plans', desc: 'Receive personalized options with lower premiums and cashback benefits.' },
          { num: '3', title: 'Start Saving', desc: 'Enroll in a plan and begin receiving monthly cash rewards.' },
        ].map((item, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(450 + index * 80).duration(400)}
            style={styles.stepCard}
          >
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{item.num}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDesc}>{item.desc}</Text>
            </View>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.urgencyBox}>
          <Text style={styles.urgencyText}>Only {spotsLeft} of 100 spots left today. Call now to secure yours.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(750).duration(400)} style={styles.trustSection}>
          <Text style={styles.trustText}>No spam. No selling your data. Just savings.</Text>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(800).duration(400)} style={[styles.floatingFooter, { paddingBottom: insets.bottom + 12 }]}>
        <Animated.View style={[styles.floatingCallButton, pulseStyle]}>
          <TouchableOpacity style={styles.floatingButtonInner} onPress={handleCall} activeOpacity={0.8}>
            <PhoneIcon size={22} color={colors.white} />
            <Text style={styles.floatingButtonText}>Call Now - It's Free</Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.footerHint}>Mon-Fri, 9:30 AM - 7:00 PM ET</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 22,
  },
  backButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  heroSection: {
    marginBottom: 8,
  },
  heroTag: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: colors.accentAmber,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: colors.textPrimary,
    lineHeight: 36,
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumberText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  urgencyBox: {
    backgroundColor: colors.danger + '10',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.danger + '20',
  },
  urgencyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  trustSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  trustText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textTertiary,
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  floatingCallButton: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  floatingButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 18,
    gap: 10,
  },
  floatingButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: colors.white,
    letterSpacing: 0.3,
  },
  footerHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 0.5,
  },
});
