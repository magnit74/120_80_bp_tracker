import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Take Control of Your Health',
    description: 'Track blood pressure with clinical precision.',
    image: require('../../assets/onboarding/slide1.png'),
  },
  {
    id: '2',
    title: 'Log Readings in Seconds',
    description: 'Quick, effortless entry for busy lives.',
    image: require('../../assets/onboarding/slide2.png'),
  },
  {
    id: '3',
    title: 'See Your Progress Over Time',
    description: 'Beautiful charts and PDF reports.',
    image: require('../../assets/onboarding/slide3.png'),
  }
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const SlideItem = ({ item, index, scrollX }: { item: typeof SLIDES[0], index: number, scrollX: SharedValue<number> }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  const blurOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [1, 0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.imageArea, imageStyle]}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <Animated.View style={[styles.blurOverlay, blurOverlayStyle]} pointerEvents="none">
          <BlurView intensity={8} style={StyleSheet.absoluteFill} tint="light" />
        </Animated.View>
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
      navigation.replace('PushPermission');
    }
  };

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const onScroll = (e: any) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
  };

  return (
    <View style={styles.container}>
      {/* Progress dots at top */}
      <View style={[styles.topArea, { paddingTop: insets.top + 16 }]}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const isActive = currentIndex === index;
            return (
              <View
                key={index}
                style={[styles.dot, isActive && styles.dotActive]}
              />
            );
          })}
        </View>
      </View>

      {/* Text content under dots */}
      <View style={[styles.contentArea, { top: insets.top + 52 }]}>
        <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
        <Text style={styles.description}>{SLIDES[currentIndex].description}</Text>
      </View>

      {/* Image slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} scrollX={scrollX} />
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

      {/* Button at bottom */}
      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.9}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topArea: {
    position: 'absolute',
    top: 0,
    left: 32,
    right: 32,
    zIndex: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dot: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  contentArea: {
    position: 'absolute',
    left: 32,
    right: 32,
    zIndex: 10,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
  },
  imageArea: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '85%',
    height: '85%',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 32,
    right: 32,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },
});
