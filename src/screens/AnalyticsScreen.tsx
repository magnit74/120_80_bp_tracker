import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import * as shape from 'd3-shape';
import Animated, { useSharedValue, useAnimatedProps, useAnimatedStyle, withTiming, Easing, withDelay, FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';
import { getRecords, BloodPressureRecord, deleteRecord } from '../store/storage';
import { RecordCard } from '../components/RecordCard';
import { FileTextIcon } from '../components/Icons'; // Assuming this exists or we can use another icon

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 40;
const GRAPH_HEIGHT = 220;
const PADDING_BOTTOM = 30;
const PADDING_TOP = 20;
const PADDING_LEFT = 24;
const PADDING_RIGHT = 24;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const AnalyticsScreen = () => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('week');
  const [viewMode, setViewMode] = useState<'chart' | 'history'>('chart');
  const [records, setRecords] = useState<BloodPressureRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BloodPressureRecord[]>([]);
  const [allRecords, setAllRecords] = useState<BloodPressureRecord[]>([]);
  
  const pathProgress = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [filter])
  );

  const loadData = async () => {
    const rawRecords = await getRecords();
    const sorted = [...rawRecords].sort((a, b) => a.timestamp - b.timestamp);
    setAllRecords(sorted.reverse());
    
    const sortedAsc = [...rawRecords].sort((a, b) => a.timestamp - b.timestamp);
    const now = Date.now();
    let currentFilteredRecords = sortedAsc;
    if (filter === 'week') {
      currentFilteredRecords = sortedAsc.filter(r => r.timestamp >= now - 7 * 24 * 60 * 60 * 1000);
    } else if (filter === 'month') {
      currentFilteredRecords = sortedAsc.filter(r => r.timestamp >= now - 30 * 24 * 60 * 60 * 1000);
    } else if (filter === 'year') {
      currentFilteredRecords = sortedAsc.filter(r => r.timestamp >= now - 365 * 24 * 60 * 60 * 1000);
    }
    
    setFilteredRecords(currentFilteredRecords);
    setRecords(currentFilteredRecords.slice(-14));

    pathProgress.value = 0;
    pathProgress.value = withDelay(150, withTiming(1, { duration: 1500, easing: Easing.bezier(0.25, 1, 0.5, 1) }));
  };

  const handleDeleteRecord = (id: string) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this reading?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            await deleteRecord(id);
            await loadData();
          }
        }
      ]
    );
  };

  const getScales = () => {
    if (records.length === 0) return null;
    
    let minSys = 60;
    let maxSys = 180;

    if (records.length > 0) {
      const sysValues = records.map(r => r.systolic);
      const diaValues = records.map(r => r.diastolic);
      const allValues = [...sysValues, ...diaValues];
      const actualMin = Math.min(...allValues);
      const actualMax = Math.max(...allValues);
      minSys = Math.max(40, actualMin - 20);
      maxSys = actualMax + 20;
      
      if (maxSys - minSys < 40) {
        const mid = (minSys + maxSys) / 2;
        minSys = mid - 20;
        maxSys = mid + 20;
      }
    }

    const rangeY = maxSys - minSys;
    const drawableHeight = GRAPH_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const drawableWidth = GRAPH_WIDTH - PADDING_LEFT - PADDING_RIGHT;

    const scaleY = (val: number) => 
      GRAPH_HEIGHT - PADDING_BOTTOM - ((val - minSys) / rangeY) * drawableHeight;
    
    const scaleX = (index: number) => {
      if (records.length <= 1) return PADDING_LEFT + drawableWidth / 2;
      return PADDING_LEFT + (index / (records.length - 1)) * drawableWidth;
    };

    return { minSys, maxSys, scaleX, scaleY, rangeY, drawableHeight };
  };

  const scales = getScales();

  const generatePath = (data: BloodPressureRecord[], getValue: (r: BloodPressureRecord) => number) => {
    if (!scales) return '';
    if (data.length === 1) {
      const x = scales.scaleX(0);
      const y = scales.scaleY(getValue(data[0]));
      return `M ${x} ${y} L ${x + 1} ${y}`;
    }
    const points = data.map((r, i) => [scales.scaleX(i), scales.scaleY(getValue(r))] as [number, number]);
    const lineGenerator = shape.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(shape.curveMonotoneX);
    return lineGenerator(points) || '';
  };

  const animatedPropsSys = useAnimatedProps(() => ({
    strokeDashoffset: 1000 - (pathProgress.value * 1000),
  }));

  const animatedPropsDia = useAnimatedProps(() => ({
    strokeDashoffset: 800 - (pathProgress.value * 800),
  }));

  const getLatestAverage = () => {
    if (filteredRecords.length === 0) return null;
    const avgSys = Math.round(filteredRecords.reduce((a, r) => a + r.systolic, 0) / filteredRecords.length);
    const avgDia = Math.round(filteredRecords.reduce((a, r) => a + r.diastolic, 0) / filteredRecords.length);
    
    return { avgSys, avgDia };
  };

  const stats = getLatestAverage();

  const FILTER_OPTIONS = ['week', 'month', 'year'] as const;
  const [filterWidth, setFilterWidth] = useState(0);

  const indicatorStyle = useAnimatedStyle(() => {
    const index = FILTER_OPTIONS.indexOf(filter);
    const tabWidth = filterWidth / 3;
    return {
      transform: [{ translateX: withTiming(index * tabWidth, { duration: 250, easing: Easing.out(Easing.cubic) }) }]
    };
  });

  const renderChartMode = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      <View 
        style={styles.pillContainer} 
        onLayout={(e) => setFilterWidth(e.nativeEvent.layout.width)}
      >
        {filterWidth > 0 && (
          <Animated.View style={[styles.pillIndicator, indicatorStyle, { width: filterWidth / 3 }]} />
        )}
        {FILTER_OPTIONS.map((f) => (
          <TouchableOpacity 
            key={f} 
            onPress={() => setFilter(f)}
            style={styles.pillTab}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
              {f === 'week' ? 'Week' : f === 'month' ? 'Month' : 'Year'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {stats && (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.metricsCard}>
          <Text style={styles.metricLabel}>Average BP</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{stats.avgSys}/{stats.avgDia}</Text>
            <Text style={styles.metricUnit}> mmHg</Text>
          </View>
        </Animated.View>
      )}

      <View style={styles.graphSection}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.systolic }]} />
            <Text style={styles.legendText}>Systolic</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.diastolic }]} />
            <Text style={styles.legendText}>Diastolic</Text>
          </View>
        </View>
        
        {records.length === 0 ? (
          <View style={styles.emptyGraph}>
            <Text style={styles.emptyTitle}>No Data Available</Text>
            <Text style={styles.emptyText}>Add more readings to see your trends over time.</Text>
          </View>
        ) : (
          <View style={styles.graphWrapper}>
            <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
              {scales && [0, 0.25, 0.5, 0.75, 1].map((factor, idx) => {
                const val = Math.round(scales.minSys + (scales.maxSys - scales.minSys) * factor);
                const y = scales.scaleY(val);
                return (
                  <React.Fragment key={'grid' + idx}>
                    <Line 
                      x1={0} 
                      y1={y} 
                      x2={GRAPH_WIDTH} 
                      y2={y} 
                      stroke={colors.outlineVariant} 
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    <SvgText
                      x={GRAPH_WIDTH}
                      y={y - 4}
                      fontSize={10}
                      fill={colors.onSurfaceVariant}
                      textAnchor="end"
                      fontFamily="Inter_400Regular"
                    >
                      {val}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {records.length >= 2 && scales && (
                <>
                  <AnimatedPath
                    d={generatePath(records, r => r.diastolic)}
                    fill="none"
                    stroke={colors.diastolic}
                    strokeWidth={3}
                    strokeDasharray={800}
                    animatedProps={animatedPropsDia}
                    strokeLinecap="round"
                  />
                  <AnimatedPath
                    d={generatePath(records, r => r.systolic)}
                    fill="none"
                    stroke={colors.systolic}
                    strokeWidth={3.5}
                    strokeDasharray={1000}
                    animatedProps={animatedPropsSys}
                    strokeLinecap="round"
                  />
                </>
              )}

              {scales && records.map((r, i) => (
                <React.Fragment key={'points' + i}>
                  <Circle
                    cx={scales.scaleX(i)}
                    cy={scales.scaleY(r.systolic)}
                    r={5}
                    fill={colors.surfaceContainerLowest}
                    stroke={colors.systolic}
                    strokeWidth={2.5}
                  />
                  <Circle
                    cx={scales.scaleX(i)}
                    cy={scales.scaleY(r.diastolic)}
                    r={4}
                    fill={colors.surfaceContainerLowest}
                    stroke={colors.diastolic}
                    strokeWidth={2.5}
                  />
                </React.Fragment>
              ))}
            </Svg>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderListMode = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.listSection}>
      {allRecords.length === 0 ? (
        <View style={styles.emptyGraph}>
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptyText}>Your measurement history will appear here.</Text>
        </View>
      ) : (
        allRecords.map((record, index) => {
          const d = new Date(record.timestamp);
          let hours = d.getHours();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12 || 12;
          const minutes = d.getMinutes().toString().padStart(2, '0');
          const timeStr = `${hours}:${minutes} ${ampm}`;
          const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const dateStr = `${shortMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
          
          return (
            <Animated.View 
              key={record.id}
              entering={FadeInDown.delay(index * 40).duration(300)}
            >
              <RecordCard 
                systolic={record.systolic} 
                diastolic={record.diastolic} 
                pulse={record.pulse} 
                time={`${dateStr}, ${timeStr}`} 
                onDelete={() => handleDeleteRecord(record.id)}
              />
            </Animated.View>
          );
        })
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>

        <View style={styles.segmentContainer}>
          <TouchableOpacity 
            style={[styles.segmentTab, viewMode === 'chart' && styles.segmentTabActive]}
            onPress={() => setViewMode('chart')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, viewMode === 'chart' && styles.segmentTextActive]}>Trends</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentTab, viewMode === 'history' && styles.segmentTabActive]}
            onPress={() => setViewMode('history')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, viewMode === 'history' && styles.segmentTextActive]}>History</Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'chart' ? renderChartMode() : renderListMode()}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentTabActive: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.sm,
  },
  segmentText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
  },
  segmentTextActive: {
    color: colors.onSurface,
  },
  pillContainer: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    marginBottom: 32,
    position: 'relative',
  },
  pillIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    ...shadows.sm,
  },
  pillTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  pillText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  pillTextActive: {
    color: colors.onSurface,
  },
  metricsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    ...shadows.sm,
  },
  metricLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricValue: {
    ...typography.displayLg,
    color: colors.primary,
  },
  metricUnit: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  graphSection: {
    marginBottom: 32,
  },
  listSection: {
    marginBottom: 24,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  graphWrapper: {
    alignItems: 'center',
    overflow: 'visible',
    backgroundColor: colors.surfaceContainerLowest,
    padding: 20,
    borderRadius: 24,
    ...shadows.sm,
  },
  emptyGraph: {
    height: GRAPH_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    ...shadows.sm,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
