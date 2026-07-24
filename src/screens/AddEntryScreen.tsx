import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';


import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { saveRecord } from '../store/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAGS = ['Morning', 'Afternoon', 'Evening', 'Headache', 'Before Medication', 'After Medication', 'Stress', 'After Exercise', 'Feeling Well'];

export const AddEntryScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [step, setStep] = useState<'sys' | 'dia' | 'pul'>('sys');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // 3-Minute Preparation Timer removed per user request
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const activePulse = useSharedValue(1);
  const saveCheckScale = useSharedValue(0);
  const saveCheckOpacity = useSharedValue(0);

  useEffect(() => {
    activePulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    return () => cancelAnimation(activePulse);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  useEffect(() => {
    if (saveState === 'saved') {
      saveCheckScale.value = 0;
      saveCheckOpacity.value = 0;
      saveCheckScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.back(2)) });
      saveCheckOpacity.value = withTiming(1, { duration: 200 });
      const timeout = setTimeout(() => navigation.goBack(), 1000);
      return () => clearTimeout(timeout);
    }
  }, [saveState, navigation]);

  const handleNumberPress = (num: string) => {
    if (step === 'sys') {
      if (systolic.length < 3) {
        const newVal = systolic + num;
        setSystolic(newVal);
        if (newVal.length === 3) setStep('dia');
      }
    } else if (step === 'dia') {
      if (diastolic.length < 3) {
        const newVal = diastolic + num;
        setDiastolic(newVal);
        if (newVal.length === 3) setStep('pul');
      }
    } else if (step === 'pul') {
      if (pulse.length < 3) setPulse(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    if (step === 'pul') {
      if (pulse.length > 0) setPulse(prev => prev.slice(0, -1));
      else setStep('dia');
    } else if (step === 'dia') {
      if (diastolic.length > 0) setDiastolic(prev => prev.slice(0, -1));
      else setStep('sys');
    } else if (step === 'sys') {
      if (systolic.length > 0) setSystolic(prev => prev.slice(0, -1));
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!systolic || !diastolic || !pulse) {
      Alert.alert('Incomplete', 'Please fill in all readings (SYS, DIA, PULSE).');
      return;
    }
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    const pul = parseInt(pulse, 10);
    if (sys < 60 || sys > 250 || dia < 40 || dia > 150 || pul < 30 || pul > 200) {
      Alert.alert('Check Readings', 'Values seem out of normal range. Please verify.');
      return;
    }
    setSaveState('saving');
    try {
      await saveRecord({ systolic: sys, diastolic: dia, pulse: pul, tags: selectedTags });
      // analytics removed
      setSaveState('saved');
    } catch (error) {
// Error logged
      setSaveState('idle');
      Alert.alert('Error', 'Error saving record. Please try again.');
    }
  };

  const getActiveFieldStyle = (field: 'sys' | 'dia' | 'pul') => {
    if (step !== field) return {};
    return { transform: [{ scale: activePulse }] };
  };

  const renderValue = (value: string, isActive: boolean) => {
    const displayValue = value || '--';
    return (
      <Text 
        style={[styles.displayValue, isActive && styles.displayValueActive, !value && styles.displayValuePlaceholder]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {displayValue}
      </Text>
    );
  };

  const checkMarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveCheckScale.value }],
    opacity: saveCheckOpacity.value,
  }));

  if (saveState === 'saved') {
    return (
      <View style={styles.savedContainer}>
        <Animated.View style={[styles.checkCircle, checkMarkStyle]}>
          <Text style={styles.checkMark}>{String.fromCharCode(10003)}</Text>
        </Animated.View>
        <Animated.Text style={[styles.savedText, { opacity: saveCheckOpacity }]}>
          Reading Logged
        </Animated.Text>
      </View>
    );
  }

  if (isTimerActive) {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    
    return (
      <Animated.View style={styles.timerContainer} entering={FadeIn.duration(300)}>
        <View style={styles.timerHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>X</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timerContent}>
          <Animated.View style={[styles.timerCircle, { transform: [{ scale: activePulse }] }]}>
            <Text style={styles.timerClock}>{minutes}:{seconds.toString().padStart(2, '0')}</Text>
          </Animated.View>
          <Text style={styles.timerTitle}>Rest & Breathe</Text>
          <Text style={styles.timerSubtitle}>AHA guidelines recommend resting for 3-5 minutes before taking your blood pressure for accurate results.</Text>
          
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => setIsTimerActive(false)}
          >
            <Text style={styles.skipButtonText}>Skip Preparation</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(250)}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>X</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log a Reading</Text>
        <View style={{ width: 52 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.displayContainer}>
          <Animated.View style={[styles.displayBlock, step === 'sys' && styles.displayBlockActive, getActiveFieldStyle('sys')]}>
            <TouchableOpacity onPress={() => setStep('sys')} style={styles.displayTouchable}>
              <Text style={styles.displayLabel}>SYS</Text>
              {renderValue(systolic, step === 'sys')}
              <Text style={styles.displayUnit}>mmHg</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.separator}>/</Text>
          
          <Animated.View style={[styles.displayBlock, step === 'dia' && styles.displayBlockActive, getActiveFieldStyle('dia')]}>
            <TouchableOpacity onPress={() => setStep('dia')} style={styles.displayTouchable}>
              <Text style={styles.displayLabel}>DIA</Text>
              {renderValue(diastolic, step === 'dia')}
              <Text style={styles.displayUnit}>mmHg</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.separatorSpacer} />
          
          <Animated.View style={[styles.displayBlock, step === 'pul' && styles.displayBlockActive, getActiveFieldStyle('pul')]}>
            <TouchableOpacity onPress={() => setStep('pul')} style={styles.displayTouchable}>
              <Text style={styles.displayLabel}>PULSE</Text>
              {renderValue(pulse, step === 'pul')}
              <Text style={styles.displayUnit}>bpm</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.tagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
            {TAGS.map(tag => {
              const isActive = selectedTags.includes(tag);
              return (
                <TouchableOpacity 
                  key={tag} 
                  style={[styles.tag, isActive && styles.tagActive]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.numpadContainer, { paddingBottom: Math.max(insets.bottom, 80) }]}>
          <View style={styles.numpad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <TouchableOpacity 
                key={num} 
                style={styles.numKey} 
                onPress={() => handleNumberPress(num.toString())}
                activeOpacity={0.6}
              >
                <Text style={styles.numKeyText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.numKey} onPress={handleBackspace} activeOpacity={0.6}>
              <Text style={styles.numKeyAction}>{String.fromCharCode(9003)}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.numKey} 
              onPress={() => handleNumberPress('0')}
              activeOpacity={0.6}
            >
              <Text style={styles.numKeyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.numKey, styles.numKeySave]} 
              onPress={handleSave}
              activeOpacity={0.6}
            >
              <Text style={styles.numKeySaveText}>{String.fromCharCode(10003)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardWarm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
  },
  backButton: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButtonText: {
    color: colors.textDark,
    ...typography.h3,
  },
  title: {
    ...typography.h3,
    color: colors.textDark,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 4,
  },
  displayContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  displayBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: (SCREEN_WIDTH - 100) / 3,
    paddingVertical: 16,
    borderRadius: 20,
  },
  displayBlockActive: {
    backgroundColor: colors.primary + '0A',
  },
  displayTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayLabel: {
    ...typography.label,
    color: colors.textLight,
    marginBottom: 8,
  },
  displayValue: {
    ...typography.numberLarge,
    color: colors.textMedium,
    minWidth: 80,
    textAlign: 'center',
  },
  displayValueActive: {
    color: colors.primary,
  },
  displayValuePlaceholder: {
    color: colors.border,
  },
  displayUnit: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 4,
  },
  separator: {
    ...typography.numberLarge,
    color: colors.borderLight,
    marginHorizontal: 4,
  },
  separatorSpacer: {
    width: 16,
  },
  tagsContainer: {
    marginBottom: 32,
  },
  tagsScroll: {
    paddingRight: 16,
    paddingLeft: 8,
  },
  tag: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.cardWarm,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.textMedium,
  },
  tagTextActive: {
    color: colors.white,
  },
  numpadContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  numKey: {
    width: (SCREEN_WIDTH - 76) / 3 - 8,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  numKeyText: {
    ...typography.h2,
    color: colors.textDark,
  },
  numKeyAction: {
    ...typography.h2,
    color: colors.textLight,
  },
  numKeySave: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  numKeySaveText: {
    ...typography.h2,
    color: colors.white,
  },
  savedContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  checkMark: {
    fontFamily: 'Inter_700Bold',
    fontSize: 56,
    color: colors.white,
  },
  savedText: {
    ...typography.h2,
    color: colors.textDark,
  },
  timerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  timerHeader: {
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  timerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  timerClock: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    color: '#60A5FA',
    letterSpacing: 2,
  },
  timerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  timerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  skipButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
  },
});
