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
  const [showWidgetModal, setShowWidgetModal] = useState(false);

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

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ marginBottom: 16 }}>
          <CallOfferCard />
        </Animated.View>

        {todayLatest ? (
          <Animated.View 
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.heroSection}
          >
            <View style={styles.lastReadingLabel}>
              <Text style={styles.lastReadingText}>Latest Blood Pressure</Text>
              <Text style={styles.lastReadingTime}>{formatFullDate(todayLatest.timestamp)}</Text>
            </View>
            
            <View style={styles.bentoGrid}>
              <View style={[styles.bentoItem, styles.bpCardBento]}>
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
              
              <View style={styles.bentoRow}>
                <View style={[styles.bentoItem, styles.hrCardBento]}>
                  <Text style={styles.bentoSmallTitle}>PULSE</Text>
                  <View style={styles.hrRow}>
                    <Text style={styles.hrNumber}>{todayLatest.pulse}</Text>
                    <Text style={styles.hrIcon}>♥</Text>
                  </View>
                </View>

                <Pressable 
                  style={[styles.bentoItem, styles.widgetBento]} 
                  onPress={() => setShowWidgetModal(true)}
                >
                  <View style={styles.widgetIconContainerBento}>
                    <HeartPulseIcon size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.widgetBentoTitle}>Add Widget</Text>
                </Pressable>
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

        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ marginTop: 8 }}>
          <HealthBenefitCard />
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
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContainer}
            >
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
                    style={styles.carouselItem}
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
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <WidgetInstructionModal 
        visible={showWidgetModal} 
        onClose={() => setShowWidgetModal(false)} 
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
  bentoGrid: {
    gap: 12,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoItem: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  bpCardBento: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 28,
  },
  hrCardBento: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetBento: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  bentoSmallTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: colors.textLight,
    letterSpacing: 1,
    marginBottom: 8,
  },
  widgetIconContainerBento: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  widgetBentoTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.primary,
  },
  horizontalScrollContainer: {
    paddingRight: 20,
    gap: 12,
  },
  carouselItem: {
    width: 280,
  },
});
