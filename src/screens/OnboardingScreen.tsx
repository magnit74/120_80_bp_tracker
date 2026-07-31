import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Vital Heart Logic',
    description: 'Track your blood pressure with clinical precision and ease.',
    image: require('../../assets/onboarding/slide1.png'), // Need to ensure these exist or will be replaced
  },
  {
    id: '2',
    title: 'Fast & Simple',
    description: 'Log your readings in seconds without any distractions.',
    image: require('../../assets/onboarding/slide2.png'),
  },
  {
    id: '3',
    title: 'Insights & Analytics',
    description: 'Understand your heart health with beautiful charts and PDF reports.',
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

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.imageArea, imageStyle]}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
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
      // Navigate to PushPermission based on the redesign plan
      navigation.replace('PushPermission' as any);
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
      <View style={[styles.topArea, { paddingTop: insets.top + 24 }]}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const isFilled = index <= currentIndex;
            return (
              <Animated.View
                key={index}
                style={[styles.dot, isFilled && styles.dotActive]}
              />
            );
          })}
        </View>
      </View>

      <View style={[styles.contentArea, { top: insets.top + 72 }]}>
        <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
        <Text style={styles.description}>{SLIDES[currentIndex].description}</Text>
      </View>

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

      <View style={[styles.bottomButton, { paddingBottom: Math.max(insets.bottom, 24) }]}>
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
    backgroundColor: colors.surfaceContainerLowest,
  },
  topArea: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceContainerHigh,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  contentArea: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 10,
    alignItems: 'center',
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 16,
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
    bottom: 120,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  buttonText: {
    ...typography.headlineSm,
    color: colors.onPrimary,
  },
});
