import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OfferDetail'>;

// Simple Check Icon for features
const CheckIcon = () => (
  <View style={styles.checkCircle}>
    <Text style={styles.checkTick}>✓</Text>
  </View>
);

const FeatureCard = ({ title, desc }: { title: string, desc: string }) => (
  <View style={styles.featureCardWrapper}>
    <View style={styles.featureCard}>
      <CheckIcon />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

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
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 200, paddingTop: 16 }}>
        <View style={styles.content}>
          <LinearGradient 
            colors={['#34D399', '#059669']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.badgeContainer}
          >
            <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>LIMITED TIME OFFER</Text>
          </LinearGradient>
          
          <Text style={styles.title}>Unlock Your Full Heart Potential</Text>
          <Text style={styles.description}>
            Get access to advanced analytics, PDF exports, and deep health insights.
          </Text>

          <View style={styles.gridContainer}>
            <View style={styles.row}>
              <FeatureCard title="Blood Pressure Analysis" desc="Understand your trends." />
              <FeatureCard title="Export PDF" desc="Share with your doctor." />
            </View>
            <View style={styles.row}>
              <FeatureCard title="Secure Storage" desc="All your data is safe." />
              <FeatureCard title="Priority Support" desc="We are here to help." />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Area */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.blurBg} />
        
        <TouchableOpacity 
          style={styles.buttonWrapper} 
          onPress={handleContinue} 
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.premium.blueHover, colors.premium.blueMain]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>GET PREMIUM ACCESS</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.priceText}>$4.99 / week, cancel anytime</Text>
        
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
    backgroundColor: '#111827', 
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  badgeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: '#34D399',
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  gridContainer: {
    width: '100%',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureCardWrapper: {
    flex: 1,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkTick: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  featureDesc: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  blurBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    shadowColor: colors.premium.blueMain,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 8,
    borderRadius: 16,
    marginBottom: 16,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  buttonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  priceText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  linkText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#6B7280',
  },
});
