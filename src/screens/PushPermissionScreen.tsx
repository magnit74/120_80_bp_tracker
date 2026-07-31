import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BellIcon } from '../components/Icons'; // Create or use an existing icon

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PushPermission'>;

export default function PushPermissionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const handleAllow = async () => {
    // In a real app, request push notification permissions here
    await AsyncStorage.setItem('pushPermissionAsked', 'true');
    navigation.replace('OfferDetail' as any); // Proceed to offer or main
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('pushPermissionAsked', 'true');
    navigation.replace('OfferDetail' as any);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <View style={styles.iconContainer}>
          <BellIcon size={48} color={colors.primary} />
        </View>
        
        <Text style={styles.title}>Never Miss a Reading</Text>
        <Text style={styles.description}>
          Enable notifications to get daily reminders for your blood pressure measurements and health tips.
        </Text>
      </View>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleAllow} activeOpacity={0.9}>
          <Text style={styles.primaryButtonText}>Allow Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip} activeOpacity={0.9}>
          <Text style={styles.secondaryButtonText}>Not Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 28,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    width: '100%',
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
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
  },
});
