import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Alert, Modal, Pressable, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as shape from 'd3-shape';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, withDelay, FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { getRecords, BloodPressureRecord } from '../store/storage';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 88; // adjusting for padding
const GRAPH_HEIGHT = 160;
const PADDING_BOTTOM = 24;
const PADDING_TOP = 20;
const PADDING_LEFT = 40;
const PADDING_RIGHT = 10;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const AnalyticsScreen = () => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('week');
  const [records, setRecords] = useState<BloodPressureRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BloodPressureRecord[]>([]);
  
  const [exportVisible, setExportVisible] = useState(false);
  const [exportRange, setExportRange] = useState<'7' | '30' | 'all'>('7');

  const pathProgress = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [filter])
  );

  const loadData = async () => {
    const rawRecords = await getRecords();
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
    setRecords(currentFilteredRecords.slice(-14)); // for chart

    pathProgress.value = 0;
    pathProgress.value = withDelay(150, withTiming(1, { duration: 1500, easing: Easing.bezier(0.25, 1, 0.5, 1) }));
  };

  const getScales = () => {
    if (records.length === 0) return null;
    let minSys = 60; let maxSys = 140;
    if (records.length > 0) {
      const allValues = [...records.map(r => r.systolic), ...records.map(r => r.diastolic)];
      const actualMin = Math.min(...allValues);
      const actualMax = Math.max(...allValues);
      minSys = Math.max(40, actualMin - 20);
      maxSys = actualMax + 20;
      if (maxSys - minSys < 40) {
        const mid = (minSys + maxSys) / 2;
        minSys = mid - 20; maxSys = mid + 20;
      }
    }

    const rangeY = maxSys - minSys;
    const drawableHeight = GRAPH_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const drawableWidth = GRAPH_WIDTH - PADDING_LEFT - PADDING_RIGHT;

    const scaleY = (val: number) => GRAPH_HEIGHT - PADDING_BOTTOM - ((val - minSys) / rangeY) * drawableHeight;
    const scaleX = (index: number) => {
      if (records.length <= 1) return PADDING_LEFT + drawableWidth / 2;
      return PADDING_LEFT + (index / (records.length - 1)) * drawableWidth;
    };
    return { minSys, maxSys, scaleX, scaleY };
  };

  const scales = getScales();

  const generatePath = (data: BloodPressureRecord[], getValue: (r: BloodPressureRecord) => number) => {
    if (!scales) return '';
    if (data.length === 1) {
      const x = scales.scaleX(0); const y = scales.scaleY(getValue(data[0]));
      return `M ${x} ${y} L ${x + 1} ${y}`;
    }
    const points = data.map((r, i) => [scales.scaleX(i), scales.scaleY(getValue(r))] as [number, number]);
    const lineGenerator = shape.line().x(d => d[0]).y(d => d[1]).curve(shape.curveMonotoneX);
    return lineGenerator(points) || '';
  };

  const animatedPropsSys = useAnimatedProps(() => ({ strokeDashoffset: 1000 - (pathProgress.value * 1000) }));
  const animatedPropsDia = useAnimatedProps(() => ({ strokeDashoffset: 1000 - (pathProgress.value * 1000) }));

  const getLatestAverage = () => {
    if (filteredRecords.length === 0) return { avgSys: 0, avgDia: 0, avgPulse: 0 };
    const avgSys = Math.round(filteredRecords.reduce((a, r) => a + r.systolic, 0) / filteredRecords.length);
    const avgDia = Math.round(filteredRecords.reduce((a, r) => a + r.diastolic, 0) / filteredRecords.length);
    const avgPulse = Math.round(filteredRecords.reduce((a, r) => a + r.pulse, 0) / filteredRecords.length);
    return { avgSys, avgDia, avgPulse };
  };

  const stats = getLatestAverage();

  const getStatusPercentages = () => {
    if (filteredRecords.length === 0) return { normal: 0, elevated: 0, high: 0 };
    let normal = 0, elevated = 0, high = 0;
    filteredRecords.forEach(r => {
      if (r.systolic < 120) normal++;
      else if (r.systolic < 130) elevated++;
      else high++;
    });
    const total = filteredRecords.length;
    return {
      normal: Math.round((normal / total) * 100),
      elevated: Math.round((elevated / total) * 100),
      high: Math.round((high / total) * 100),
    };
  };

  const percentages = getStatusPercentages();

  const getDynamicLabels = () => {
    const labels = [];
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (filter === 'week') {
      for (let i = 0; i < 4; i++) {
        const d = new Date(now - (3 - i) * 2 * msPerDay);
        labels.push(`${d.getDate()} ${shortMonths[d.getMonth()]}`);
      }
    } else if (filter === 'month') {
      for (let i = 0; i < 4; i++) {
        const d = new Date(now - (3 - i) * 10 * msPerDay);
        labels.push(`${d.getDate()} ${shortMonths[d.getMonth()]}`);
      }
    } else if (filter === 'year') {
      for (let i = 0; i < 4; i++) {
        const d = new Date(now - (3 - i) * 121 * msPerDay);
        labels.push(`${shortMonths[d.getMonth()]} '${d.getFullYear().toString().substring(2)}`);
      }
    }
    return labels;
  };
  const dynamicLabels = getDynamicLabels();

  const handleGeneratePdf = () => {
    setExportVisible(false);
    setTimeout(() => {
      Alert.alert("PDF Generated", "Your report is ready to be shared.");
    }, 500);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }]}>
        
        {/* Top Period Selector */}
        <View style={styles.periodSelectorWrapper}>
          <View style={styles.periodSelector}>
            {/* Background pill indicating active */}
            <View 
              style={[
                styles.periodActiveBg,
                filter === 'week' ? { left: '1%' } : filter === 'month' ? { left: '34%' } : { left: '66%' }
              ]} 
            />
            <TouchableOpacity style={styles.periodTab} onPress={() => setFilter('week')}>
              <Text style={[styles.periodText, filter === 'week' && styles.periodTextActive]}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.periodTab} onPress={() => setFilter('month')}>
              <Text style={[styles.periodText, filter === 'month' && styles.periodTextActive]}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.periodTab} onPress={() => setFilter('year')}>
              <Text style={[styles.periodText, filter === 'year' && styles.periodTextActive]}>Year</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Chart Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.chartCardWrapper}>
          <View style={styles.chartCard}>
            <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
              <Defs>
                <SvgLinearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.design2.redAction} stopOpacity="0.2"/>
                  <Stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                </SvgLinearGradient>
              </Defs>
              
              {scales && [0, 0.25, 0.5, 0.75, 1].map((factor, idx) => {
                const val = Math.round(scales.minSys + (scales.maxSys - scales.minSys) * factor);
                const y = scales.scaleY(val);
                return (
                  <React.Fragment key={'grid' + idx}>
                    <Line x1={PADDING_LEFT} y1={y} x2={GRAPH_WIDTH} y2={y} stroke="#E5E7EB" strokeWidth={1} />
                    <SvgText x={PADDING_LEFT - 8} y={y + 4} fontSize={10} fill="#9CA3AF" textAnchor="end" fontFamily="Inter_700Bold">{val}</SvgText>
                  </React.Fragment>
                );
              })}
              
              {records.length >= 2 && scales && (
                <>
                  <AnimatedPath 
                    d={generatePath(records, r => r.systolic)} 
                    fill="none" 
                    stroke={colors.design2.redAction} 
                    strokeWidth={2.5} 
                    strokeDasharray={1000} 
                    animatedProps={animatedPropsSys} 
                    strokeLinejoin="round" 
                  />
                  <AnimatedPath 
                    d={generatePath(records, r => r.diastolic)} 
                    fill="none" 
                    stroke={colors.design2.redAction} 
                    strokeWidth={2.5} 
                    strokeDasharray={1000} 
                    animatedProps={animatedPropsDia} 
                    strokeLinejoin="round" 
                  />
                  {/* Fill under systolic (simplified) */}
                  <AnimatedPath 
                    d={`${generatePath(records, r => r.systolic)} L ${scales.scaleX(records.length - 1)} ${GRAPH_HEIGHT - PADDING_BOTTOM} L ${scales.scaleX(0)} ${GRAPH_HEIGHT - PADDING_BOTTOM} Z`} 
                    fill="url(#redGrad)" 
                  />
                </>
              )}
            </Svg>
            <View style={styles.xLabels}>
               {dynamicLabels.map((label, idx) => (
                 <Text key={idx} style={styles.xLabelText}>{label}</Text>
               ))}
            </View>
          </View>
        </Animated.View>

        {/* Averages Cards */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.averagesRow}>
          {/* Avg BP */}
          <View style={styles.averageCard}>
            <View style={styles.avgCardHeader}>
              <View style={[styles.avgIconBox, { backgroundColor: '#FDF2F2' }]}>
                <MaterialIcons name="favorite-border" size={16} color={colors.design2.redAction} />
              </View>
              <Text style={styles.avgLabel}>Average BP</Text>
            </View>
            <View style={styles.avgValueRow}>
              <Text style={styles.avgValue}>{stats.avgSys}/{stats.avgDia}</Text>
              <MaterialIcons name="arrow-right-alt" size={18} color="#9CA3AF" />
            </View>
          </View>
          
          {/* Avg Pulse */}
          <View style={styles.averageCard}>
            <View style={styles.avgCardHeader}>
              <View style={[styles.avgIconBox, { backgroundColor: '#F0F5FA' }]}>
                <MaterialIcons name="show-chart" size={16} color="#2b64c0" />
              </View>
              <Text style={styles.avgLabel}>Average Pulse</Text>
            </View>
            <View style={styles.avgValueRow}>
              <Text style={styles.avgValue}>{stats.avgPulse}</Text>
              <Text style={styles.avgUnit}>bpm</Text>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <MaterialIcons name="trending-up" size={18} color="#2b64c0" />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Status Bars */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statusBarSection}>
          <View style={styles.statusLabels}>
            <View style={styles.statusLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.design2.greenMain }]} />
              <Text style={[styles.statusLabelText, { color: colors.design2.greenMain }]}>Normal</Text>
            </View>
            <View style={styles.statusLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: '#F5A623' }]} />
              <Text style={[styles.statusLabelText, { color: '#F5A623' }]}>Elevated</Text>
            </View>
            <View style={styles.statusLabelRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.design2.redAction }]} />
              <Text style={[styles.statusLabelText, { color: colors.design2.redAction }]}>High</Text>
            </View>
          </View>
          <View style={styles.statusBarContainer}>
            <View style={[styles.statusBarSegment, { backgroundColor: colors.design2.greenMain, width: `${Math.max(percentages.normal, 1)}%`, borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }]} />
            <View style={styles.statusBarDivider} />
            <View style={[styles.statusBarSegment, { backgroundColor: '#F5A623', width: `${Math.max(percentages.elevated, 1)}%` }]} />
            <View style={styles.statusBarDivider} />
            <View style={[styles.statusBarSegment, { backgroundColor: colors.design2.redAction, width: `${Math.max(percentages.high, 1)}%`, borderTopRightRadius: 5, borderBottomRightRadius: 5 }]} />
          </View>
          <View style={styles.statusLabels}>
            <Text style={[styles.statusValueText, { color: colors.design2.greenMain }]}>{percentages.normal}%</Text>
            <Text style={[styles.statusValueText, { color: '#F5A623' }]}>{percentages.elevated}%</Text>
            <Text style={[styles.statusValueText, { color: colors.design2.redAction }]}>{percentages.high}%</Text>
          </View>
        </Animated.View>

        {/* Export Button */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.exportSection}>
          <TouchableOpacity activeOpacity={0.9} style={styles.exportBtnWrapper} onPress={() => navigation.navigate('PdfExport' as any)}>
            <LinearGradient
              colors={['#6bd173', '#43a047']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.exportBtn}
            >
              <MaterialIcons name="description" size={22} color="#FFF" />
              <Text style={styles.exportBtnText}>Export PDF</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* PDF Export Modal */}
      <Modal visible={exportVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setExportVisible(false)} />
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.sheetHandle} />
            
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <MaterialIcons name="picture-as-pdf" size={32} color={colors.design2.redAction} />
              </View>
              <Text style={styles.modalTitle}>Export Medical Report</Text>
              <Text style={styles.modalDesc}>Generate a detailed PDF report for your doctor with your blood pressure history.</Text>
            </View>

            <View style={styles.optionsList}>
              <TouchableOpacity style={[styles.optionCard, exportRange === '7' && styles.optionCardActive]} onPress={() => setExportRange('7')} activeOpacity={0.8}>
                <View>
                  <Text style={[styles.optionTitle, exportRange === '7' && styles.optionTitleActive]}>Last 7 Days</Text>
                  <Text style={styles.optionDesc}>Quick weekly summary</Text>
                </View>
                <View style={[styles.radio, exportRange === '7' && styles.radioActive]}>
                  {exportRange === '7' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.optionCard, exportRange === '30' && styles.optionCardActive]} onPress={() => setExportRange('30')} activeOpacity={0.8}>
                <View>
                  <Text style={[styles.optionTitle, exportRange === '30' && styles.optionTitleActive]}>Last 30 Days</Text>
                  <Text style={styles.optionDesc}>Comprehensive monthly view</Text>
                </View>
                <View style={[styles.radio, exportRange === '30' && styles.radioActive]}>
                  {exportRange === '30' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.optionCard, exportRange === 'all' && styles.optionCardActive]} onPress={() => setExportRange('all')} activeOpacity={0.8}>
                <View>
                  <Text style={[styles.optionTitle, exportRange === 'all' && styles.optionTitleActive]}>All Time</Text>
                  <Text style={styles.optionDesc}>Complete medical history</Text>
                </View>
                <View style={[styles.radio, exportRange === 'all' && styles.radioActive]}>
                  {exportRange === 'all' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.buttonWrapper} onPress={handleGeneratePdf} activeOpacity={0.9}>
              <LinearGradient colors={['#DE5B5B', '#D32F2F']} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.buttonText}>GENERATE PDF REPORT</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.design2.bgLight },
  scrollContent: { paddingHorizontal: 0 },
  
  periodSelectorWrapper: {
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
    position: 'relative',
  },
  periodActiveBg: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '33%',
    backgroundColor: '#2b64c0',
    borderRadius: 24,
    zIndex: 0,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    zIndex: 1,
  },
  periodText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: colors.design2.textMuted,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },

  chartCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 35,
    elevation: 4,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: PADDING_LEFT,
    paddingRight: PADDING_RIGHT,
    marginTop: -8,
  },
  xLabelText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#9CA3AF',
  },

  averagesRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  averageCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 30,
    elevation: 3,
  },
  avgCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  avgIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avgLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.design2.textMuted,
  },
  avgValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  avgValue: {
    fontFamily: 'Inter_900Black',
    fontSize: 28,
    color: '#1E293B',
    letterSpacing: -1,
  },
  avgUnit: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#1E293B',
  },

  statusBarSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabelText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  statusBarContainer: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 6,
    alignItems: 'center',
  },
  statusBarSegment: {
    height: '100%',
  },
  statusBarDivider: {
    width: 2,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  statusValueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },

  exportSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  exportBtnWrapper: {
    width: '100%',
    maxWidth: 320,
    shadowColor: '#43a047',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 8,
    borderRadius: 24,
  },
  exportBtn: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    gap: 8,
  },
  exportBtnText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    color: '#FFF',
  },

  /* Modal Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(17,24,39,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 30, elevation: 24 },
  sheetHandle: { width: 48, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 32 },
  modalHeader: { alignItems: 'center', marginBottom: 32 },
  modalIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(211,47,47,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: 'Inter_800ExtraBold', fontSize: 24, color: colors.design2.textMain, marginBottom: 8 },
  modalDesc: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.design2.textMuted, textAlign: 'center', paddingHorizontal: 16 },
  
  optionsList: { gap: 12, marginBottom: 32 },
  optionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 2, borderColor: '#F3F4F6', backgroundColor: '#FFFFFF' },
  optionCardActive: { borderColor: colors.design2.redAction, backgroundColor: 'rgba(211,47,47,0.05)' },
  optionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: colors.design2.textMain, marginBottom: 4 },
  optionTitleActive: { color: colors.design2.redAction },
  optionDesc: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#9CA3AF' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: colors.design2.redAction },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.design2.redAction },

  buttonWrapper: { width: '100%', shadowColor: colors.design2.redAction, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 25, elevation: 8, borderRadius: 16 },
  buttonGradient: { paddingVertical: 18, alignItems: 'center', borderRadius: 16 },
  buttonText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFFFFF' },
});
