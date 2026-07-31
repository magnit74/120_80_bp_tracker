import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { requestNotificationPermission, scheduleDailyReminder, cancelReminder } from '../services/notificationService';

import { HomeScreen } from '../screens/HomeScreen';
import { AddEntryScreen } from '../screens/AddEntryScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import OfferPrelandScreen from '../screens/OfferPrelandScreen';
import PdfExportScreen from '../screens/PdfExportScreen';
import PushPermissionScreen from '../screens/PushPermissionScreen';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
// requestFCMPermission imported lazily in PushPermissionScreen

export type RootStackParamList = {
  Onboarding: undefined;
  PushPermission: undefined;
  Main: undefined;
  AddEntry: undefined;
  OfferPreland: undefined;
  PdfExport: undefined;
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
    <View style={styles.addButtonWrapper}>
      <AnimatedTouchableOpacity
        style={[styles.addButtonContainer, animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.addButton}>
          <MaterialIcons name="add" size={32} color={colors.white} />
        </View>
      </AnimatedTouchableOpacity>
    </View>
  );
};

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.design2.redAction,
        tabBarInactiveTintColor: colors.design2.textMuted,
        tabBarStyle: [
          styles.tabBar,
          { 
            height: 85 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: { paddingTop: 12 },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
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
            <MaterialIcons name="bar-chart" size={28} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function checkOnboarding() {
      try {
        const hasViewed = await AsyncStorage.getItem('hasViewedOnboarding');
        if (mounted) setIsFirstLaunch(hasViewed === null);
      } catch (error) {
        if (mounted) setIsFirstLaunch(false);
      }
    }
    checkOnboarding();
    const timeout = setTimeout(() => {
      if (mounted) setIsFirstLaunch((prev) => (prev === null ? false : prev));
    }, 1500);
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
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
          name="OfferPreland" 
          component={OfferPrelandScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="PdfExport" 
          component={PdfExportScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 10,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: -2,
    marginBottom: 4,
  },
  addButtonWrapper: {
    position: 'absolute',
    top: -28,
    left: '50%',
    transform: [{ translateX: -36 }], // half of the 72px total width
    width: 72,
    height: 72,
    backgroundColor: colors.white,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  addButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.design2.redAction,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.design2.redAction,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});

