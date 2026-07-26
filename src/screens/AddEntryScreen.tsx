import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { saveRecord } from '../store/storage';
import { SunIcon, MoonIcon, ShieldIcon, HeartPulseIcon } from '../components/Icons';
import { shadows } from '../theme/shadows';

const TAGS = ['Morning', 'Afternoon', 'Evening', 'Headache', 'Before Medication', 'After Medication', 'Stress', 'After Exercise', 'Feeling Well'];

export const AddEntryScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [pulse, setPulse] = useState<number>(60);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const saveCheckScale = useSharedValue(0);
  const saveCheckOpacity = useSharedValue(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (systolic < 60 || systolic > 250 || diastolic < 40 || diastolic > 200 || pulse < 30 || pulse > 220) {
      Alert.alert('Check Readings', 'Values seem out of normal range. Please verify.');
      return;
    }
    setSaveState('saving');
    try {
      await saveRecord({ systolic, diastolic, pulse, tags: selectedTags });
      setSaveState('saved');
    } catch (error) {
      setSaveState('idle');
      Alert.alert('Error', 'Error saving record. Please try again.');
    }
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

  const updateValue = (field: 'sys'|'dia'|'pul', delta: number) => {
    Haptics.selectionAsync();
    if (field === 'sys') setSystolic(p => Math.min(250, Math.max(60, p + delta)));
    if (field === 'dia') setDiastolic(p => Math.min(200, Math.max(40, p + delta)));
    if (field === 'pul') setPulse(p => Math.min(220, Math.max(30, p + delta)));
  };

  const handlePressIn = (field: 'sys'|'dia'|'pul', delta: number) => {
    updateValue(field, delta);
    timerRef.current = setTimeout(() => {
      timerRef.current = setInterval(() => {
        updateValue(field, delta);
      }, 100);
    }, 500);
  };

  const handlePressOut = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const renderStepper = (
    label: string, 
    value: number, 
    field: 'sys'|'dia'|'pul',
    color: string
  ) => {
    return (
      <View style={styles.stepperColumn}>
        <Text style={[styles.labelText, { color }]}>{label}</Text>
        
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color }]} adjustsFontSizeToFit numberOfLines={1}>{value}</Text>
        </View>

        <View style={styles.horizontalButtons}>
          <TouchableOpacity 
            style={styles.stepperButton}
            onPressIn={() => handlePressIn(field, -1)}
            onPressOut={handlePressOut}
            activeOpacity={0.6}
          >
            <Text style={[styles.stepperButtonText, { color }]}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.stepperButton}
            onPressIn={() => handlePressIn(field, 1)}
            onPressOut={handlePressOut}
            activeOpacity={0.6}
          >
            <Text style={[styles.stepperButtonText, { color }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(250)}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log a Reading</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.steppersRow}>
          {renderStepper('SYS', systolic, 'sys', colors.primary)}
          {renderStepper('DIA', diastolic, 'dia', '#6366F1')}
          {renderStepper('PULSE', pulse, 'pul', '#E85D75')}
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
                  {tag === 'Morning' && <SunIcon size={12} color={isActive ? colors.primary : colors.textMedium} />}
                  {tag === 'Evening' && <MoonIcon size={12} color={isActive ? colors.primary : colors.textMedium} />}
                  {tag === 'After Medication' && <ShieldIcon size={12} color={isActive ? colors.primary : colors.textMedium} />}
                  {tag === 'After Exercise' && <HeartPulseIcon size={12} color={isActive ? colors.primary : colors.textMedium} />}
                  <Text style={[styles.tagText, isActive && styles.tagTextActive, (tag === 'Morning' || tag === 'Evening' || tag === 'After Medication' || tag === 'After Exercise') && { marginLeft: 6 }]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateTimeLabel}>Measurement{'\n'}time</Text>
          <View style={styles.dateTimePills}>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </View>
            <View style={styles.timePill}>
              <Text style={styles.timePillText}>{new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.saveGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.saveButtonText}>Save Reading</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 18,
  },
  closeButtonText: {
    color: colors.textMedium,
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
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
    paddingTop: 40,
    ...shadows.lg,
  },
  steppersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  stepperColumn: {
    alignItems: 'center',
  },
  horizontalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonText: {
    fontSize: 24,
    fontFamily: 'Inter_500Medium',
  },
  valueContainer: {
    paddingVertical: 12,
    justifyContent: 'center',
  },
  valueText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 56,
    letterSpacing: -1.5,
  },
  labelText: {
    ...typography.overline,
    marginBottom: 4,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  dateTimeLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textDark,
  },
  dateTimePills: {
    flexDirection: 'row',
    gap: 8,
  },
  datePill: {
    backgroundColor: colors.cardWarm,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timePill: {
    backgroundColor: colors.cardWarm,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  datePillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textDark,
  },
  timePillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textDark,
  },
  tagsScroll: {
    paddingRight: 16,
    paddingLeft: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.cardWarm,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagActive: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.textMedium,
  },
  tagTextActive: {
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  saveButton: {
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  saveGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
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
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.primaryGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  checkMark: {
    fontFamily: 'Inter_700Bold',
    fontSize: 56,
    color: colors.primary,
  },
  savedText: {
    ...typography.h2,
    color: colors.textDark,
  },
});

