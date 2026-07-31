import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Take Control of Your Health',
    description: 'Track blood pressure with clinical precision and get insights to manage your cardiovascular wellness effectively.',
    image: require('../../assets/images/onboarding_1_heart.png'),
  },
  {
    id: '2',
    title: 'Log Readings in Seconds',
    description: 'Quick, effortless entry for busy lives so you can focus on what matters most.',
    image: require('../../assets/images/onboarding_2_phone.png'),
  },
  {
    id: '3',
    title: 'See Your Progress',
    description: 'Beautiful charts and PDF reports you can easily share with your doctor.',
    image: require('../../assets/images/onboarding_3_chart.png'),
  }
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const SlideItem = ({ item, index, scrollX, insets }: { item: typeof SLIDES[0], index: number, scrollX: SharedValue<number>, insets: any }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [50, 0, 50], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY }], opacity };
  });

  const textStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollX.value, inputRange, [20, 0, 20], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    return { transform: [{ translateY }], opacity };
  });

  return (
    <View style={styles.slide}>
      {/* 3D Image Area */}
      <View style={styles.imageContainer}>
        <Animated.Image 
          source={item.image} 
          style={[styles.image, imageStyle]} 
          resizeMode="contain" 
        />
      </View>

      {/* Text Area (Sits inside the bottom sheet) */}
      <Animated.View style={[styles.textContainer, textStyle, { paddingBottom: insets.bottom + 140 }]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('hasViewedOnboarding', 'true');
      navigation.replace('PushPermission' as any);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasViewedOnboarding', 'true');
    navigation.replace('PushPermission' as any);
  };

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const onScroll = (e: any) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
  };

  return (
    <LinearGradient colors={['#ffffff', '#F4F7FA']} style={styles.container}>
      {/* Bottom Sheet Background */}
      <View style={styles.bottomSheetBg} />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} scrollX={scrollX} insets={insets} />
        )}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      <View style={[styles.bottomControls, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={styles.buttonWrapper} 
          onPress={handleNext} 
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#74D680', '#43A047']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            {currentIndex === SLIDES.length - 1 && (
              <MaterialIcons name="arrow-forward" size={22} color="#FFF" style={{ marginLeft: 8 }} />
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.paginationRow}>
          {currentIndex < SLIDES.length - 1 ? (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipBtnPlaceholder} />
          )}

          <View style={styles.pagination}>
            {SLIDES.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <Animated.View
                  key={index}
                  style={[styles.dot, isActive ? styles.dotActive : null]}
                />
              );
            })}
          </View>
          
          <View style={styles.skipBtnPlaceholder} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomSheetBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.48,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.04,
    shadowRadius: 40,
    elevation: 20,
  },
  flatList: {
    flex: 1,
    zIndex: 2,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  image: {
    width: 280,
    height: 280,
    zIndex: 2,
  },
  textContainer: {
    height: height * 0.48,
    paddingHorizontal: 32,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 28,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 10,
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
    marginBottom: 24,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
    flexDirection: 'row',
  },
  buttonText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginBottom: 24,
  },
  skipBtn: {
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#9CA3AF',
  },
  skipBtnPlaceholder: {
    width: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: '#E15858',
  },
});
