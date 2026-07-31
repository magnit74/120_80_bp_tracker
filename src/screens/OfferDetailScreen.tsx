import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ShieldIcon, HeartPulseIcon } from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OfferDetail'>;

export default function OfferDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const handleContinue = async () => {
    await AsyncStorage.setItem('hasViewedOffer', 'true');
    navigation.replace('Main' as any);
  };

  const handleClose = async () => {
    await AsyncStorage.setItem('hasViewedOffer', 'true');
    navigation.replace('Main' as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/offer_header.png')} 
            style={styles.headerImage} 
            resizeMode="cover" 
          />
          <TouchableOpacity style={[styles.closeButton, { top: insets.top + 16 }]} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.badge}>PREMIUM ACCESS</Text>
          <Text style={styles.title}>Unlock Full Health Insights</Text>
          <Text style={styles.description}>
            Get personalized blood pressure analysis, unlimited history, and exportable PDF reports for your doctor.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <HeartPulseIcon size={20} color={colors.primary} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Advanced Analytics</Text>
                <Text style={styles.featureDesc}>Understand your trends</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <ShieldIcon size={20} color={colors.primary} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Secure PDF Export</Text>
                <Text style={styles.featureDesc}>Share with your doctor</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Text style={styles.priceText}>$4.99 / week, cancel anytime</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
        <View style={styles.linksRow}>
          <Text style={styles.linkText}>Terms</Text>
          <Text style={styles.linkText}>Privacy</Text>
          <Text style={styles.linkText}>Restore</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    padding: 24,
  },
  badge: {
    ...typography.labelLg,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
    marginBottom: 12,
  },
  description: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    marginBottom: 32,
  },
  featuresList: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  featureDesc: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  priceText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    ...typography.headlineSm,
    color: colors.onPrimary,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
  },
  linkText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
});
