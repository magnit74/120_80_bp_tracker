import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Swipeable } from 'react-native-gesture-handler';

import { getRecords, BloodPressureRecord, deleteRecord } from '../store/storage';
import { shouldShowReviewPrompt, handlePositiveReview } from '../services/reviewService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const getCategoryColor = (systolic: number) => {
  if (systolic < 120) return { bg: '#D3EFD9', text: '#4AA981', label: 'Normal' };
  if (systolic < 130) return { bg: '#FEF08A', text: '#CA8A04', label: 'Elevated' };
  if (systolic < 140) return { bg: '#FFEDD5', text: '#F59E0B', label: 'Stage 1' };
  return { bg: '#FEE2E2', text: '#DC2626', label: 'Stage 2' };
};

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<BloodPressureRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const loadRecords = async () => {
    try {
      const data = await getRecords();
      setRecords(data);
      if (await shouldShowReviewPrompt(data.length)) {
        setTimeout(() => handlePositiveReview(), 1500);
      }
    } catch (error) {
      console.error('Load records error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  };

  const handleDeleteRecord = (id: string) => {
    Alert.alert("Delete Record", "Are you sure you want to delete this reading?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteRecord(id); await loadRecords(); } }
    ]);
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => handleDeleteRecord(id)}
      >
        <MaterialIcons name="delete" size={24} color="#FFF" />
      </TouchableOpacity>
    );
  };

  const latestRecord = records.length > 0 ? records[0] : null;
  const category = latestRecord ? getCategoryColor(latestRecord.systolic) : null;

  const formatShortTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${shortMonths[d.getMonth()]} ${d.getDate()}, ${hours}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.design2.red} />}
      >
        {/* Top Icons */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.topIcons}>
          <MaterialIcons name="favorite" size={28} color={colors.design2.red} />
          <MaterialIcons name="health-and-safety" size={28} color={colors.design2.red} />
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.headlineWrapper}>
          <Text style={styles.headline}>Welcome Back</Text>
        </Animated.View>

        {/* Last Reading Card */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.lastReadingCard}>
          <View style={styles.lastReadingTop}>
            <Text style={styles.lastReadingTitle}>Last Reading</Text>
          </View>
          <View style={styles.lastReadingBottom}>
            {latestRecord ? (
              <>
                <View>
                  <Text style={styles.bpText}>{latestRecord.systolic}/{latestRecord.diastolic}</Text>
                  <Text style={styles.bpUnit}>mmHg</Text>
                </View>
                <View style={styles.bpCategoryWrapper}>
                  <View style={[styles.pill, { backgroundColor: category?.bg }]}>
                    <Text style={[styles.pillText, { color: category?.text }]}>{category?.label}</Text>
                  </View>
                  {/* Mini Chart SVG */}
                  <Svg width={70} height={35} viewBox="0 0 70 35" fill="none">
                    <Path d="M0 30 C10 30, 15 25, 25 25 C35 25, 45 10, 55 15 L70 5" stroke="#A7DAB3" strokeWidth={3} strokeLinecap="round"/>
                    <Path d="M0 30 C10 30, 15 25, 25 25 C35 25, 45 10, 55 15 L70 5 L70 35 L0 35 Z" fill="#A7DAB3" fillOpacity={0.2}/>
                  </Svg>
                </View>
              </>
            ) : (
              <View style={styles.noDataWrapper}>
                <Text style={styles.noDataText}>No data yet. Tap + to add a reading.</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Free Benefits Check Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={styles.benefitsCardWrapper}
            onPress={() => navigation.navigate('OfferPreland')}
          >
            <LinearGradient
              colors={[colors.design2.greenGradientStart, colors.design2.greenGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.benefitsCard}
            >
              <View style={styles.benefitsTextWrapper}>
                <Text style={styles.benefitsTitle}>Free Benefits Check</Text>
                <Text style={styles.benefitsDesc}>Your BP readings may qualify you for up to $150/mo. Check now →</Text>
              </View>
              <View style={styles.benefitsIconWrapper}>
                <MaterialIcons name="phone-in-talk" size={24} color={colors.design2.greenMain} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent History */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent History</Text>
          <View style={styles.historyCard}>
            {records.length > 0 ? (
              records.slice(0, 5).map((record, index) => {
                const isLast = index === Math.min(records.length, 5) - 1;
                const recCategory = getCategoryColor(record.systolic);
                const isNormal = record.systolic < 120;
                return (
                  <Swipeable
                    key={record.id}
                    renderRightActions={() => renderRightActions(record.id)}
                    friction={2}
                  >
                    <View style={[styles.historyRow, isLast && styles.historyRowLast]}>
                      <Text style={styles.historyTime}>{formatShortTime(record.timestamp)}</Text>
                      <View style={styles.historyValues}>
                        <Text style={styles.historyBp}>{record.systolic}/{record.diastolic}</Text>
                        <View style={[styles.historyIconPill, { backgroundColor: recCategory.bg }]}>
                          <MaterialIcons 
                            name={isNormal ? "check" : "remove"} 
                            size={12} 
                            color={recCategory.text} 
                            style={{ fontWeight: 'bold' }}
                          />
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteRecord(record.id)} style={{ paddingLeft: 8 }}>
                          <MaterialIcons name="more-vert" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Swipeable>
                );
              })
            ) : (
              <Text style={styles.historyNoData}>No recent readings</Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.design2.bgLight,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  topIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headlineWrapper: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headline: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 32,
    color: colors.design2.textMain,
    letterSpacing: -0.5,
  },
  lastReadingCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(243,244,246,0.5)',
    shadowColor: colors.design2.red,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 6,
  },
  lastReadingTop: {
    backgroundColor: colors.design2.redLighter,
    paddingTop: 20,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  lastReadingTitle: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  lastReadingBottom: {
    backgroundColor: colors.white,
    borderRadius: 28,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
  },
  bpText: {
    color: colors.design2.redLight,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 52,
    lineHeight: 52,
    letterSpacing: -2,
  },
  bpUnit: {
    color: colors.design2.redLighter,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginTop: 4,
  },
  bpCategoryWrapper: {
    alignItems: 'flex-end',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  pillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  noDataWrapper: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  noDataText: {
    color: colors.design2.textMuted,
    fontFamily: 'Inter_500Medium',
  },
  benefitsCardWrapper: {
    marginHorizontal: 24,
    marginBottom: 32,
    shadowColor: colors.design2.greenMain,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
  },
  benefitsCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  benefitsTextWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  benefitsTitle: {
    color: colors.design2.textMain,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  benefitsDesc: {
    color: 'rgba(255,255,255,0.95)',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
    paddingRight: 16,
  },
  benefitsIconWrapper: {
    width: 48,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  historySection: {
    paddingHorizontal: 24,
  },
  historyTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 20,
    color: colors.design2.textMain,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 30,
    elevation: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  historyTime: {
    color: colors.design2.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  historyValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyBp: {
    color: colors.design2.textMain,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 15,
    letterSpacing: -0.5,
  },
  historyIconPill: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyNoData: {
    color: colors.design2.textMuted,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    paddingVertical: 8,
  },
  deleteAction: {
    backgroundColor: colors.design2.redAction,
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: '100%',
  }
});
