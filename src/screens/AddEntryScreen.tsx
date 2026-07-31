import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming, Easing, withSpring } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { saveRecord } from '../store/storage';

const TAGS = ['Morning', 'Evening', 'Headache', 'Before Meds', 'Stress', 'After Exercise'];

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
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
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
          <MaterialIcons name="check" size={64} color={colors.design2.redAction} />
        </Animated.View>
        <Animated.Text style={[styles.savedText, { opacity: saveCheckOpacity }]}>
          Measurement Saved
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

  const renderDial = (label: string, value: number, field: 'sys'|'dia'|'pul', isPulse: boolean) => {
    const fromColor = isPulse ? '#2B75E6' : '#E44B55';
    const toColor = isPulse ? '#1956B3' : '#CC202C';
    const shadowColor = isPulse ? '#1956B3' : '#CC202C';
    const btnBorder = isPulse ? 'rgba(25,86,179,0.2)' : 'rgba(204,32,44,0.2)';
    const btnText = isPulse ? '#1956B3' : '#CC202C';

    return (
      <View style={styles.dialContainer}>
        <View style={styles.dialRow}>
          <TouchableOpacity 
            style={[styles.dialButton, { borderColor: btnBorder }]}
            onPressIn={() => handlePressIn(field, -1)}
            onPressOut={handlePressOut}
            activeOpacity={0.6}
          >
            <MaterialIcons name="remove" size={28} color={btnText} />
          </TouchableOpacity>
          
          <View style={[styles.dialCircleWrapper, { shadowColor }]}>
            <LinearGradient
              colors={[fromColor, toColor]}
              style={styles.dialCircleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.dialValue}>{value}</Text>
            </LinearGradient>
          </View>

          <TouchableOpacity 
            style={[styles.dialButton, { borderColor: btnBorder }]}
            onPressIn={() => handlePressIn(field, 1)}
            onPressOut={handlePressOut}
            activeOpacity={0.6}
          >
            <MaterialIcons name="add" size={28} color={btnText} />
          </TouchableOpacity>
        </View>
        <Text style={styles.dialLabel}>{label}</Text>
      </View>
    );
  };

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(250)}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtnLeft}>
          <MaterialIcons name="chevron-left" size={26} color={colors.design2.redAction} />
          <Text style={styles.headerBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Measurement</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtnRight}>
          <Text style={styles.headerBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 120 }]}>
        <View style={styles.card}>
          {renderDial('Systolic (mmHg)', systolic, 'sys', false)}
          {renderDial('Diastolic (mmHg)', diastolic, 'dia', false)}
          {renderDial('Pulse (bpm)', pulse, 'pul', true)}
        </View>

        <View style={styles.tagsCard}>
          <Text style={styles.tagsTitle}>Quick Tags</Text>
          <View style={styles.tagsGrid}>
            {TAGS.map(tag => {
              const isActive = selectedTags.includes(tag);
              return (
                <TouchableOpacity 
                  key={tag} 
                  style={[styles.tag, isActive && styles.tagActive]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <TouchableOpacity 
          style={styles.saveButtonWrapper}
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#E44B55', '#CC202C']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveButtonText}>Save Measurement</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.design2.bgLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    width: 80,
  },
  headerBtnRight: {
    padding: 8,
    width: 80,
    alignItems: 'flex-end',
  },
  headerBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.design2.redAction,
  },
  headerTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 16,
    color: colors.design2.textMain,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 40,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 24,
  },
  dialContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  dialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 24,
  },
  dialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dialCircleWrapper: {
    width: 112,
    height: 112,
    borderRadius: 56,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  dialCircleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialValue: {
    fontFamily: 'Inter_900Black',
    fontSize: 54,
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -1.5,
  },
  dialLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.design2.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
  },
  tagsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 30,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 32,
  },
  tagsTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    color: colors.design2.textMain,
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tagActive: {
    backgroundColor: '#FDF2F2',
    borderColor: '#FDF2F2',
  },
  tagText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.design2.textMuted,
  },
  tagTextActive: {
    color: colors.design2.redAction,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(243,244,246,0.5)',
    paddingTop: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  saveButtonWrapper: {
    width: '100%',
    maxWidth: 320,
    shadowColor: colors.design2.redAction,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 8,
    borderRadius: 24,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 24,
  },
  saveButtonText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  savedContainer: {
    flex: 1,
    backgroundColor: colors.design2.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(211,47,47,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  savedText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: colors.design2.textMain,
  },
});
