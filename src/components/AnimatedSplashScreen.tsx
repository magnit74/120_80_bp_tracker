import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence,
  withRepeat,
  Easing
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

interface Props {
  onAnimationComplete: () => void;
}

export const AnimatedSplashScreen: React.FC<Props> = ({ onAnimationComplete }) => {
  const text145Opacity = useSharedValue(1);
  const text120Opacity = useSharedValue(0);
  const text120Y = useSharedValue(10);
  const heartbeatScale = useSharedValue(1);
  const containerOpacity = useSharedValue(1);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    text145Opacity.value = withDelay(500, withTiming(0, { duration: 150 }));
    text120Opacity.value = withDelay(500, withTiming(1, { duration: 200 }));
    text120Y.value = withDelay(500, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }));

    heartbeatScale.value = withDelay(
      800,
      withSequence(
        withTiming(1.08, { duration: 120, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 120, easing: Easing.inOut(Easing.ease) }),
        withDelay(200, withTiming(1.05, { duration: 100, easing: Easing.inOut(Easing.ease) })),
        withTiming(1, { duration: 100, easing: Easing.inOut(Easing.ease) })
      )
    );

    subtitleOpacity.value = withDelay(1000, withTiming(1, { duration: 300 }));
    containerOpacity.value = withDelay(1800, withTiming(0, { duration: 250 }));

    const timeoutId = setTimeout(() => {
      onAnimationComplete();
    }, 2100);

    return () => clearTimeout(timeoutId);
  }, [onAnimationComplete]);

  const style145 = useAnimatedStyle(() => ({
    opacity: text145Opacity.value,
    position: 'absolute',
  }));

  const style120 = useAnimatedStyle(() => ({
    opacity: text120Opacity.value,
    transform: [{ translateY: text120Y.value }],
    position: 'absolute',
  }));

  const heartbeatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartbeatScale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={heartbeatStyle}>
        <View style={styles.textWrapper}>
          <Animated.Text style={[styles.text, style145]}>
            145/95
          </Animated.Text>
          <Animated.Text style={[styles.text, style120]}>
            120/80
          </Animated.Text>
        </View>
      </Animated.View>
      
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        120/80 BP Tracker
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  textWrapper: {
    width: 200,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Inter_700Bold',
    fontSize: 56,
    color: colors.textDark,
    letterSpacing: -2,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textLight,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 16,
  },
});
