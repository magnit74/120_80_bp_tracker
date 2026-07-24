import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { requestNotificationPermission, scheduleDailyReminder, cancelReminder } from '../services/notificationService';

import { HomeScreen } from '../screens/HomeScreen';
import { AddEntryScreen } from '../screens/AddEntryScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { OfferDetailScreen } from '../screens/OfferDetailScreen';
import { colors } from '../theme/colors';
import { HomeIcon, ChartIcon, PlusIcon, BellIcon, SunIcon, MoonIcon, CheckCircleIcon } from '../components/Icons';
// requestFCMPermission imported lazily in PushPermissionScreen

export type RootStackParamList = {
  Onboarding: undefined;
  PushPermission: undefined;
  Main: undefined;
  AddEntry: undefined;
  OfferDetail: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  AddDummy: undefined;
  Analytics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const AddTabBarButton = ({ children, onPress }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.addButtonContainer, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <View style={styles.addButton}>
        <PlusIcon size={32} color={colors.white} strokeWidth={3} />
      </View>
    </AnimatedTouchableOpacity>
  );
};

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: [
          styles.tabBar,
          { height: 64 + insets.bottom, paddingBottom: insets.bottom || 12 },
        ],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <HomeIcon size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="AddDummy" 
        component={View} 
        options={({ navigation }) => ({
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <AddTabBarButton 
              {...props} 
              onPress={() => (navigation as any).navigate('AddEntry')}
            />
          ),
        })}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color }) => (
            <ChartIcon size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const PushPermissionScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState(new Date(2024, 0, 1, 9, 0));
  const [eveningTime, setEveningTime] = useState(new Date(2024, 0, 1, 21, 0));
  const [showPicker, setShowPicker] = useState<'morning' | 'evening' | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(null);
      return;
    }
    if (selectedDate) {
      if (showPicker === 'morning') {
        setMorningTime(selectedDate);
      } else {
        setEveningTime(selectedDate);
      }
    }
    setShowPicker(null);
  };

  const handleContinue = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      
      await AsyncStorage.setItem('pushPermissionSeen', 'true');
      await AsyncStorage.setItem('morningReminder', morningEnabled.toString());
      await AsyncStorage.setItem('eveningReminder', eveningEnabled.toString());
      
      if (morningEnabled && granted) {
        await AsyncStorage.setItem('morningTime', morningTime.toISOString());
        await scheduleDailyReminder(morningTime, 'morning_reminder', 'Time for a check-up! 🩺', 'Good morning! Taking a quick blood pressure reading starts your day right.');
      } else {
        await cancelReminder('morning_reminder');
      }
      
      if (eveningEnabled && granted) {
        await AsyncStorage.setItem('eveningTime', eveningTime.toISOString());
        await scheduleDailyReminder(eveningTime, 'evening_reminder', 'Evening BP Check 🌙', 'Take a moment to record your evening blood pressure for better health tracking.');
      } else {
        await cancelReminder('evening_reminder');
      }

      if (granted) {
        await AsyncStorage.setItem('notificationsEnabled', 'true');
      } else {
        await AsyncStorage.setItem('notificationsEnabled', 'false');
      }

      navigation.replace('Main');
    } catch (error) {
      await AsyncStorage.setItem('pushPermissionSeen', 'true');
      await AsyncStorage.setItem('notificationsEnabled', 'false');
      navigation.replace('Main');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('pushPermissionSeen', 'true');
    await AsyncStorage.setItem('morningReminder', 'false');
    await AsyncStorage.setItem('eveningReminder', 'false');
    await AsyncStorage.setItem('notificationsEnabled', 'false');
    navigation.replace('Main');
  };

  return (
    <View style={[pushStyles.container, { paddingTop: insets.top }]}>
      <View style={pushStyles.content}>
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={pushStyles.iconContainer}>
          <BellIcon size={48} color={colors.primary} />
        </Animated.View>
        
        <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={pushStyles.title}>
          Don't Forget to Check Your Blood Pressure
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300).duration(400)} style={pushStyles.subtitle}>
          We'll remind you twice a day (9:00 AM & 8:00 PM) to help you keep a healthy routine.
        </Animated.Text>
      </View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={[pushStyles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={[pushStyles.button, isRequesting && pushStyles.buttonDisabled]} 
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={isRequesting}
        >
          <Text style={pushStyles.buttonText}>
            {isRequesting ? 'Setting up...' : 'Turn On Reminders'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={pushStyles.skipButton} 
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={pushStyles.skipText}>Not Now</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const AppNavigator = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const hasViewed = await AsyncStorage.getItem('hasViewedOnboarding');
        setIsFirstLaunch(hasViewed === null);
      } catch (error) {
        setIsFirstLaunch(false);
      }
    }
    checkOnboarding();
  }, []);

  if (isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isFirstLaunch ? "Onboarding" : "Main"}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="PushPermission" component={PushPermissionScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="AddEntry" 
          component={AddEntryScreen} 
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen 
          name="OfferDetail" 
          component={OfferDetailScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    marginTop: 4,
  },
  addButtonContainer: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const pushStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.textMedium,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    gap: 4,
  },
  optionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.textDark,
  },
  optionTime: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    color: colors.primary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: colors.white,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.textLight,
  },
});
