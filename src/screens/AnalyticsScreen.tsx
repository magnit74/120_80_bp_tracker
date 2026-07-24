import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import * as shape from 'd3-shape';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, withDelay, FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getRecords, BloodPressureRecord } from '../store/storage';
import { PrimaryButton } from '../components/PrimaryButton';
import { RecordCard } from '../components/RecordCard';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 48;
const GRAPH_HEIGHT = 220;
const PADDING_BOTTOM = 30;
const PADDING_TOP = 20;
const PADDING_LEFT = 24;
const PADDING_RIGHT = 24;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const AnalyticsScreen = () => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('week');
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [records, setRecords] = useState<BloodPressureRecord[]>([]);
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
    setAllRecords(sorted.reverse()); // For the list view (newest first)
    
    const sortedAsc = [...rawRecords].sort((a, b) => a.timestamp - b.timestamp);
    const now = Date.now();
    let filteredRecords = sortedAsc;
    if (filter === 'week') {
      filteredRecords = sortedAsc.filter(r => r.timestamp >= now - 7 * 24 * 60 * 60 * 1000);
    } else if (filter === 'month') {
      filteredRecords = sortedAsc.filter(r => r.timestamp >= now - 30 * 24 * 60 * 60 * 1000);
    } else if (filter === 'year') {
      filteredRecords = sortedAsc.filter(r => r.timestamp >= now - 365 * 24 * 60 * 60 * 1000);
    }
    
    setRecords(filteredRecords.slice(-14)); // Show max 14 points for clarity

    pathProgress.value = 0;
    pathProgress.value = withDelay(200, withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }));
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

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 1000 - (pathProgress.value * 1000),
  }));

  const animatedPropsDia = useAnimatedProps(() => ({
    strokeDashoffset: 800 - (pathProgress.value * 800),
  }));

  const handleExportPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; padding: 40px; color: #111827; }
              h1 { color: #0F766E; font-size: 28px; margin-bottom: 8px; font-weight: 700; }
              .subtitle { color: #6B7280; font-size: 14px; margin-bottom: 32px; }
              table { width: 100%; border-collapse: collapse; margin-top: 24px; }
              th { background-color: #F9FAFB; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4B5563; border-bottom: 1px solid #E5E7EB; }
              td { padding: 16px; text-align: left; border-bottom: 1px solid #F3F4F6; font-size: 14px; }
              .normal { color: #10B981; font-weight: 500; }
              .elevated { color: #F59E0B; font-weight: 500; }
              .high { color: #EF4444; font-weight: 500; }
            </style>
          </head>
          <body>
            <h1>Blood Pressure Report</h1>
            <p class="subtitle">Generated by 120/80 BP Tracker • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <table>
              <tr><th>Date & Time</th><th>Systolic</th><th>Diastolic</th><th>Pulse</th><th>Status</th></tr>
              ${allRecords.map(r => {
                const status = r.systolic >= 140 || r.diastolic >= 90 ? 'high' : r.systolic >= 120 || r.diastolic >= 80 ? 'elevated' : 'normal';
                const statusLabel = status === 'high' ? 'High' : status === 'elevated' ? 'Elevated' : 'Normal';
                return `
                  <tr>
                    <td>${new Date(r.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                    <td>${r.systolic}</td>
                    <td>${r.diastolic}</td>
                    <td>${r.pulse}</td>
                    <td class="${status}">${statusLabel}</td>
                  </tr>
                `;
              }).join('')}
            </table>
            
            <div style="margin-top: 60px; padding: 24px; background-color: #F8FAFC; border-radius: 16px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <h3 style="color: #0F172A; margin: 0 0 8px 0; font-size: 18px;">Track your health with 120/80 BP Tracker</h3>
                <p style="color: #64748B; margin: 0; font-size: 14px;">Available on Android and iOS. Scan the code to download the app.</p>
              </div>
              <div style="background-color: #0F766E; padding: 12px; border-radius: 8px; text-align: center;">
                <span style="color: white; font-weight: bold; font-size: 16px;">12080bp.app/download</span>
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
      // analytics removed
    } catch (error) {
      console.error('Export error', error);
      alert('Error exporting PDF');
    }
  };

  const getLatestAverage = () => {
    if (records.length === 0) return null;
    const recent = records.slice(-7);
    const avgSys = Math.round(recent.reduce((a, r) => a + r.systolic, 0) / recent.length);
    const avgDia = Math.round(recent.reduce((a, r) => a + r.diastolic, 0) / recent.length);
    return { sys: avgSys, dia: avgDia };
  };

  const average = getLatestAverage();

  const renderChartMode = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      <View style={styles.filterContainer}>
        {(['week', 'month', 'year'] as const).map((f) => (
          <TouchableOpacity 
            key={f} 
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'week' ? 'Week' : f === 'month' ? 'Month' : 'Year'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {average && (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.summaryContainer}>
          <Text style={styles.summaryLabel}>Average ({filter})</Text>
          <View style={styles.summaryValuesRow}>
            <Text style={styles.summaryValue}>{average.sys}</Text>
            <Text style={styles.summarySlash}>/</Text>
            <Text style={styles.summaryValue}>{average.dia}</Text>
            <Text style={styles.summaryUnit}> mmHg</Text>
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
              <Defs>
                <LinearGradient id="gradientSys" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={colors.primaryLight} />
                  <Stop offset="100%" stopColor={colors.primary} />
                </LinearGradient>
                <LinearGradient id="gradientDia" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#2DD4BF" />
                  <Stop offset="100%" stopColor={colors.primaryLight} />
                </LinearGradient>
              </Defs>

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
                      stroke={colors.borderLight} 
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    <SvgText
                      x={GRAPH_WIDTH}
                      y={y - 4}
                      fontSize={10}
                      fill={colors.textLight}
                      textAnchor="end"
                      fontFamily="Inter_400Regular"
                    >
                      {val}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {scales && records.length > 1 && records.map((r, i) => {
                if (i % Math.max(1, Math.floor(records.length / 5)) !== 0 && i !== records.length - 1) return null;
                const d = new Date(r.timestamp);
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const dateStr = `${months[d.getMonth()]} ${d.getDate()}`;
                return (
                  <SvgText
                    key={'date' + i}
                    x={scales.scaleX(i)}
                    y={GRAPH_HEIGHT - 8}
                    fontSize={10}
                    fill={colors.textLight}
                    textAnchor="middle"
                    fontFamily="Inter_400Regular"
                  >
                    {dateStr}
                  </SvgText>
                );
              })}

              {records.length >= 2 && scales && (
                <>
                  <AnimatedPath
                    d={generatePath(records, r => r.diastolic)}
                    fill="none"
                    stroke="url(#gradientDia)"
                    strokeWidth={3}
                    strokeDasharray={800}
                    animatedProps={animatedPropsDia}
                    strokeLinecap="round"
                  />
                  <AnimatedPath
                    d={generatePath(records, r => r.systolic)}
                    fill="none"
                    stroke="url(#gradientSys)"
                    strokeWidth={3.5}
                    strokeDasharray={1000}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                  />
                </>
              )}

              {scales && records.map((r, i) => (
                <React.Fragment key={'points' + i}>
                  <Circle
                    cx={scales.scaleX(i)}
                    cy={scales.scaleY(r.systolic)}
                    r={4.5}
                    fill={colors.white}
                    stroke={colors.primary}
                    strokeWidth={2.5}
                  />
                  <Circle
                    cx={scales.scaleX(i)}
                    cy={scales.scaleY(r.diastolic)}
                    r={3.5}
                    fill={colors.white}
                    stroke={colors.primaryLight}
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
                time={`${dateStr} at ${timeStr}${record.tags.length > 0 ? ' · ' + record.tags[0] : ''}`} 
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
          <Text style={styles.title}>Your Trends</Text>
          <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity 
            style={[styles.segmentTab, viewMode === 'chart' && styles.segmentTabActive]}
            onPress={() => setViewMode('chart')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, viewMode === 'chart' && styles.segmentTextActive]}>Chart</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentTab, viewMode === 'list' && styles.segmentTabActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, viewMode === 'list' && styles.segmentTextActive]}>History</Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'chart' ? renderChartMode() : renderListMode()}

        <View style={styles.exportSection}>
          <PrimaryButton 
            title="Export PDF Report" 
            onPress={handleExportPDF} 
          />
        </View>
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
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.h2,
    color: colors.textDark,
  },
  headerDate: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.borderLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentTabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    ...typography.bodyMedium,
    color: colors.textMedium,
  },
  segmentTextActive: {
    color: colors.textDark,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardWarm,
    borderRadius: 10,
    padding: 4,
    marginBottom: 32,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    ...typography.caption,
    color: colors.textMedium,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.textDark,
    fontWeight: '600',
  },
  summaryContainer: {
    marginBottom: 32,
  },
  summaryLabel: {
    ...typography.label,
    color: colors.textLight,
    marginBottom: 8,
  },
  summaryValuesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  summaryValue: {
    ...typography.numberLarge,
    color: colors.textDark,
  },
  summarySlash: {
    ...typography.numberLarge,
    color: colors.border,
    marginHorizontal: 8,
  },
  summaryUnit: {
    ...typography.caption,
    color: colors.textLight,
  },
  graphSection: {
    marginBottom: 32,
  },
  listSection: {
    marginBottom: 24,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption,
    color: colors.textMedium,
  },
  graphWrapper: {
    alignItems: 'center',
    overflow: 'visible',
  },
  emptyGraph: {
    height: GRAPH_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardWarm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textDark,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  exportSection: {
    marginTop: 16,
  },
});
