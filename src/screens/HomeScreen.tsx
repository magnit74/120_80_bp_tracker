import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { BloodPressureWidget } from '../../widgets/BloodPressureWidget';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { RecordCard } from '../components/RecordCard';
import { HealthBenefitCard } from '../components/HealthBenefitCard';
import { CallOfferCard } from '../components/CallOfferCard';
import { RatingPrompt } from '../components/RatingPrompt';
import { WidgetInstructionModal } from '../components/WidgetInstructionModal';
import { HeartPulseIcon, ClockIcon, ShieldIcon, ChartIcon } from '../components/Icons';
import { getRecords, BloodPressureRecord } from '../store/storage';
import { shouldShowReviewPrompt } from '../services/reviewService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const getBPStatus = (sys: number, dia: number) => {
  // AHA 2017 guidelines
  if (sys >= 140 || dia >= 90) return { label: 'High', color: colors.danger };
  if (sys >= 120 || dia >= 80) return { label: 'Elevated', color: colors.warning };
  return { label: 'Normal', color: colors.success };
};

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<BloodPressureRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [isWidgetModalVisible, setIsWidgetModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  useEffect(() => {
    if (todayLatest) {
      BloodPressureWidget.updateSnapshot({
        systolic: todayLatest.systolic,
        diastolic: todayLatest.diastolic,
        status: getBPStatus(todayLatest.systolic, todayLatest.diastolic).label
      });
    }
  }, [todayLatest]);

  const loadRecords = async () => {
    try {
      const data = await getRecords();
      setRecords(data);

      if (await shouldShowReviewPrompt(data.length)) {
        setShowRatingPrompt(true);
      }
    } catch (error) {
      console.error('Load records error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRecords();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const today = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

  const todayRecords = records.filter(r => {
    const recordDate = new Date(r.timestamp);
    return recordDate.toDateString() === today.toDateString();
  });
  const todayLatest = todayRecords.length > 0 ? todayRecords[0] : null;

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatFullDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${shortMonths[d.getMonth()]} ${d.getDate()}, ${formatTime(timestamp)}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 32 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Animated.Text entering={FadeIn.delay(100).duration(400)} style={styles.dateText}>
            {formattedDate}
          </Animated.Text>
        </View>

        {todayLatest ? (
          <Animated.View 
            entering={FadeInDown.delay(150).duration(500)}
            style={styles.heroSection}
          >
            <View style={styles.lastReadingLabel}>
              <Text style={styles.lastReadingText}>Last reading</Text>
              <Text style={styles.lastReadingTime}>{formatFullDate(todayLatest.timestamp)}</Text>
            </View>
            
            <View style={styles.heroCards}>
              <View style={styles.bpCard}>
                <View style={styles.bpRow}>
                  <Text style={styles.bpNumber}>{todayLatest.systolic}</Text>
                  <Text style={styles.bpSlash}>/</Text>
                  <Text style={styles.bpNumber}>{todayLatest.diastolic}</Text>
                </View>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: getBPStatus(todayLatest.systolic, todayLatest.diastolic).color }]} />
                  <Text style={[styles.statusText, { color: getBPStatus(todayLatest.systolic, todayLatest.diastolic).color }]}>
                    {getBPStatus(todayLatest.systolic, todayLatest.diastolic).label}
                  </Text>
                </View>
              </View>
              
              <View style={styles.hrCard}>
                <View style={styles.hrRow}>
                  <Text style={styles.hrNumber}>{todayLatest.pulse}</Text>
                  <Text style={styles.hrIcon}>♥</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.delay(150).duration(500)}
            style={styles.heroEmptySection}
          >
            <View style={styles.emptyIconCircle}>
              <HeartPulseIcon size={32} color={colors.primary} />
            </View>
            <Text style={styles.heroEmptyTitle}>Welcome to 120/80</Text>
            <Text style={styles.heroEmptyText}>
              Your blood pressure companion.
            </Text>

            <View style={styles.tipsRow}>
              <View style={styles.tipCard}>
                <View style={[styles.tipIconCircle, { backgroundColor: '#E8F5F3' }]}>
                  <ClockIcon size={18} color={colors.primary} />
                </View>
                <Text style={styles.tipTitle}>Track Daily</Text>
                <Text style={styles.tipText}>Log your{'\n'}readings</Text>
              </View>
              <View style={styles.tipCard}>
                <View style={[styles.tipIconCircle, { backgroundColor: '#FFF3E0' }]}>
                  <ShieldIcon size={18} color={colors.warning} />
                </View>
                <Text style={styles.tipTitle}>Stay Healthy</Text>
                <Text style={styles.tipText}>Get insights{'\n'}and tips</Text>
              </View>
              <View style={styles.tipCard}>
                <View style={[styles.tipIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <ChartIcon size={18} color="#8B5CF6" />
                </View>
                <Text style={styles.tipTitle}>See Progress</Text>
                <Text style={styles.tipText}>Track your{'\n'}improvement</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.startButton, pressed && { opacity: 0.85 }]}
              onPress={() => (navigation as any).navigate('AddEntry')}
            >
              <Text style={styles.startButtonText}>Start Tracking</Text>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ marginTop: 16 }}>
          <HealthBenefitCard />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: 16 }}>
          <CallOfferCard />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(400)} style={{ marginTop: 16 }}>
          <Pressable style={styles.widgetBanner} onPress={() => setIsWidgetModalVisible(true)}>
            <View style={styles.widgetIconContainer}>
              <HeartPulseIcon size={24} color={colors.primary} />
            </View>
            <View style={styles.widgetTextContainer}>
              <Text style={styles.widgetBannerTitle}>Home Screen Widget</Text>
              <Text style={styles.widgetBannerDesc}>Add our widget to your home screen for one-tap tracking.</Text>
            </View>
          </Pressable>
        </Animated.View>

        {showRatingPrompt && (
          <Animated.View entering={FadeInDown.delay(350).duration(400)} style={{ marginTop: 16 }}>
            <RatingPrompt
              recordCount={records.length}
              onDismiss={() => setShowRatingPrompt(false)}
            />
          </Animated.View>
        )}

        {records.length > 1 && (
          <View style={styles.recentSection}>
            <Animated.Text 
              entering={FadeInDown.delay(400).duration(400)}
              style={styles.recentLabel}
            >
              Recent History
            </Animated.Text>
            
            {records.slice(1, 6).map((record, index) => {
              const d = new Date(record.timestamp);
              let hours = d.getHours();
              const ampm = hours >= 12 ? 'PM' : 'AM';
              hours = hours % 12 || 12;
              const minutes = d.getMinutes().toString().padStart(2, '0');
              const timeStr = `${hours}:${minutes} ${ampm}`;
              
              const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const dateStr = `${shortMonths[d.getMonth()]} ${d.getDate()}`;
              
              return (
                <Animated.View 
                  key={record.id}
                  entering={FadeInDown.delay(450 + index * 60).duration(400)}
                >
                  <RecordCard 
                    systolic={record.systolic} 
                    diastolic={record.diastolic} 
                    pulse={record.pulse} 
                    time={`${dateStr}, ${timeStr}`} 
                  />
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <WidgetInstructionModal 
        visible={isWidgetModalVisible} 
        onClose={() => setIsWidgetModalVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 200,
  },
  header: {
    marginBottom: 20,
  },
  dateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.textLight,
  },
  heroSection: {
    marginBottom: 16,
  },
  lastReadingLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lastReadingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.textDark,
  },
  lastReadingTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textLight,
  },
  heroCards: {
    flexDirection: 'row',
    gap: 10,
  },
  bpCard: {
    flex: 1.8,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  hrCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  bpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  bpNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: colors.textDark,
    letterSpacing: -1.5,
  },
  bpSlash: {
    fontFamily: 'Inter_300Light',
    fontSize: 24,
    color: colors.textLight,
    marginHorizontal: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  hrRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    justifyContent: 'center',
  },
  hrNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: colors.textDark,
    letterSpacing: -1.5,
  },
  hrIcon: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  heroEmptySection: {
    marginBottom: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroEmptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroEmptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.textMedium,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  tipsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },
  tipCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tipIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  tipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 14,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.white,
  },
  recentSection: {
    marginTop: 16,
  },
  recentLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.textLight,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 12,
  },
  widgetBanner: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  widgetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  widgetTextContainer: {
    flex: 1,
  },
  widgetBannerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 4,
  },
  widgetBannerDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textMedium,
    lineHeight: 18,
  },
});
