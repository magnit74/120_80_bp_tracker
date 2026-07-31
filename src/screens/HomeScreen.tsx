import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RecordCard } from '../components/RecordCard';
import { CallOfferCard } from '../components/CallOfferCard';
import { HeartPulseIcon } from '../components/Icons';
import { getRecords, BloodPressureRecord, deleteRecord } from '../store/storage';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

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
    } catch (error) {
      console.error('Load records error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRecords();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    Alert.alert("Delete Record", "Are you sure you want to delete this reading?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteRecord(id); await loadRecords(); } }
    ]);
  };

  const todayLatest = records.length > 0 ? records[0] : null;

  const formatFullDate = (timestamp: number) => {
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome Back</Text>
          <Text style={styles.dateText}>Your health dashboard</Text>
        </View>

        {todayLatest ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.heroSection}>
            <View style={styles.heroCard}>
              <Text style={styles.heroCardLabel}>LATEST READING</Text>
              <View style={styles.heroDataRow}>
                <Text style={styles.heroBpText}>{todayLatest.systolic}/{todayLatest.diastolic}</Text>
              </View>
              <View style={styles.heroSubRow}>
                <HeartPulseIcon size={16} color={colors.onPrimary} />
                <Text style={styles.heroPulseText}>{todayLatest.pulse} BPM</Text>
                <Text style={styles.heroTimeText}>• {formatFullDate(todayLatest.timestamp)}</Text>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.heroSection}>
            <View style={styles.heroCard}>
              <Text style={styles.heroCardLabel}>LATEST READING</Text>
              <Text style={styles.heroBpText}>--/--</Text>
              <Text style={styles.heroPulseText}>No data yet</Text>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <CallOfferCard />
        </Animated.View>

        {records.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentLabel}>Recent History</Text>
            {records.slice(0, 5).map((record, index) => (
              <Animated.View key={record.id} entering={FadeInDown.delay(300 + index * 50).duration(400)}>
                <RecordCard 
                  systolic={record.systolic} 
                  diastolic={record.diastolic} 
                  pulse={record.pulse} 
                  time={formatFullDate(record.timestamp)} 
                  onDelete={() => handleDeleteRecord(record.id)}
                />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    ...typography.headlineLg,
    color: colors.onBackground,
    marginBottom: 4,
  },
  dateText: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
  },
  heroCardLabel: {
    ...typography.labelLg,
    color: colors.onPrimaryContainer,
    marginBottom: 12,
  },
  heroDataRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroBpText: {
    ...typography.displayLg,
    color: colors.onPrimary,
    fontVariant: ['tabular-nums'],
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  heroPulseText: {
    ...typography.bodyLg,
    fontFamily: 'Inter_600SemiBold',
    color: colors.onPrimary,
    marginLeft: 6,
  },
  heroTimeText: {
    ...typography.bodyMd,
    color: colors.onPrimaryContainer,
    marginLeft: 8,
  },
  recentSection: {
    marginTop: 24,
  },
  recentLabel: {
    ...typography.headlineSm,
    color: colors.onBackground,
    marginBottom: 16,
  },
});
