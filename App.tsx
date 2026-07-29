import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import './src/services/notificationService';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Ignore splash hide errors
      }
    }
  }, [appReady]);

  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: '#FAF3E0' }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF3E0' }} onLayout={onLayoutRootView}>
      <ErrorBoundary>
        <AppNavigator />
      </ErrorBoundary>
    </View>
  );
}
