import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { requestNotificationPermission, scheduleDailyReminder } from '../services/notificationService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PushPermission'>;

export default function PushPermissionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [isRequesting, setIsRequesting] = useState(false);

  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      
      await AsyncStorage.setItem('pushPermissionSeen', 'true');
      
      if (granted) {
        await AsyncStorage.setItem('notificationsEnabled', 'true');
        // Schedule based on toggle state
        if (morningEnabled) {
          const morningTime = new Date(); morningTime.setHours(9,0,0,0);
          await AsyncStorage.setItem('morningTime', morningTime.toISOString());
          await scheduleDailyReminder(morningTime, 'morning_reminder', 'Time for a check-up! 🩺', 'Good morning! Taking a quick blood pressure reading starts your day right.');
        }
        if (eveningEnabled) {
          const eveningTime = new Date(); eveningTime.setHours(20,0,0,0);
          await AsyncStorage.setItem('eveningTime', eveningTime.toISOString());
          await scheduleDailyReminder(eveningTime, 'evening_reminder', 'Evening Check-in 🌙', 'Time for your evening blood pressure reading.');
        }
      } else {
        await AsyncStorage.setItem('notificationsEnabled', 'false');
      }

      navigation.replace('Main' as any);
    } catch (error) {
      await AsyncStorage.setItem('pushPermissionSeen', 'true');
      await AsyncStorage.setItem('notificationsEnabled', 'false');
      navigation.replace('Main' as any);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('pushPermissionSeen', 'true');
    await AsyncStorage.setItem('notificationsEnabled', 'false');
    navigation.replace('Main' as any);
  };

  return (
    <LinearGradient colors={['#ffffff', '#F4F7FA']} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 32 }]}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/images/push_bell.png')} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>
      </View>

      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Text style={styles.title}>Stay on Track</Text>
        <Text style={styles.description}>
          Get reminders to log your pressure twice a day for better accuracy.
        </Text>

        <View style={styles.cardsContainer}>
          <View style={styles.reminderCard}>
            <View style={styles.cardLeft}>
              <View style={styles.cardIconBox}>
                <MaterialIcons name="wb-sunny" size={20} color="#43A047" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Morning</Text>
                <Text style={styles.cardTime}>9:00 AM</Text>
              </View>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => setMorningEnabled(!morningEnabled)}
              style={[styles.toggleActive, !morningEnabled && styles.toggleInactive]}
            >
              <View style={[styles.toggleKnob, !morningEnabled && styles.toggleKnobInactive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.reminderCard}>
            <View style={styles.cardLeft}>
              <View style={styles.cardIconBox}>
                <MaterialIcons name="bedtime" size={20} color="#43A047" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Evening</Text>
                <Text style={styles.cardTime}>8:00 PM</Text>
              </View>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => setEveningEnabled(!eveningEnabled)}
              style={[styles.toggleActive, !eveningEnabled && styles.toggleInactive]}
            >
              <View style={[styles.toggleKnob, !eveningEnabled && styles.toggleKnobInactive]} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.buttonWrapper} 
          onPress={handleAllow} 
          activeOpacity={0.9}
          disabled={isRequesting}
        >
          <LinearGradient
            colors={['#74D680', '#43A047']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {isRequesting ? 'Setting up...' : 'Enable Notifications'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.04,
    shadowRadius: 40,
    elevation: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 28,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  cardsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
    marginBottom: 32,
  },
  reminderCard: {
    backgroundColor: '#F4F7FA',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(243,244,246,0.5)',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#111827',
  },
  cardTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  toggleActive: {
    width: 48,
    height: 24,
    backgroundColor: '#43A047',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleInactive: {
    backgroundColor: '#D1D5DB',
  },
  toggleKnob: {
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleKnobInactive: {
    alignSelf: 'flex-start',
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 320,
    shadowColor: '#4AA981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 8,
    borderRadius: 99,
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 99,
  },
  buttonText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#2b64c0',
  },
});
