import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getRecords } from '../store/storage';

export default function PdfExportScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [selectedRange, setSelectedRange] = useState<'7'|'30'|'90'|'custom'>('7');

  const handleGeneratePdf = async () => {
    try {
      const records = await getRecords();
      let filtered = [...records].sort((a, b) => a.timestamp - b.timestamp);
      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;
      
      if (selectedRange === '7') {
        filtered = filtered.filter(r => r.timestamp >= now - 7 * msPerDay);
      } else if (selectedRange === '30') {
        filtered = filtered.filter(r => r.timestamp >= now - 30 * msPerDay);
      } else if (selectedRange === '90') {
        filtered = filtered.filter(r => r.timestamp >= now - 90 * msPerDay);
      }
      
      if (filtered.length === 0) {
        Alert.alert('No Data', 'No data available for the selected range.');
        return;
      }

      const avgSys = Math.round(filtered.reduce((a, r) => a + r.systolic, 0) / filtered.length);
      const avgDia = Math.round(filtered.reduce((a, r) => a + r.diastolic, 0) / filtered.length);
      const avgPulse = Math.round(filtered.reduce((a, r) => a + r.pulse, 0) / filtered.length);
      const maxSys = Math.max(...filtered.map(r => r.systolic));
      const minSys = Math.min(...filtered.map(r => r.systolic));
      const maxDia = Math.max(...filtered.map(r => r.diastolic));
      const minDia = Math.min(...filtered.map(r => r.diastolic));

      const tableRows = filtered.map(r => {
        const d = new Date(r.timestamp);
        const dateStr = `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
        const h = d.getHours(); const m = d.getMinutes().toString().padStart(2,'0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const timeStr = `${h % 12 || 12}:${m} ${ampm}`;
        const cat = r.systolic < 120 ? '#4CAF50' : r.systolic < 130 ? '#F5A623' : '#DC2626';
        return `<tr>
          <td>${dateStr} ${timeStr}</td>
          <td style="font-weight:bold;">${r.systolic}/${r.diastolic}</td>
          <td>${r.pulse}</td>
          <td><span style="display:inline-block;width:10px;height:10px;border-radius:5px;background:${cat};"></span></td>
        </tr>`;
      }).join('');

      const rangeLabel = selectedRange === '7' ? 'Last 7 Days' : selectedRange === '30' ? 'Last 30 Days' : selectedRange === '90' ? 'Last 90 Days' : 'All Time';

      const html = `<!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #333; background: #fff; }
            .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #97202B; padding-bottom: 16px; }
            .header h1 { color: #97202B; font-size: 22px; margin-bottom: 4px; }
            .header p { color: #666; font-size: 12px; }
            .stats-grid { display: flex; gap: 12px; margin-bottom: 24px; }
            .stat-card { flex: 1; background: #F8F9FA; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #E5E7EB; }
            .stat-value { font-size: 24px; font-weight: 900; color: #111; }
            .stat-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
            .stat-range { font-size: 9px; color: #AAA; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th { background: #97202B; color: #fff; padding: 10px 8px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { border-bottom: 1px solid #E5E7EB; padding: 10px 8px; text-align: center; }
            tr:nth-child(even) { background: #FAFAFA; }
            .footer { text-align: center; margin-top: 24px; font-size: 10px; color: #AAA; border-top: 1px solid #E5E7EB; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Blood Pressure Report</h1>
            <p>${rangeLabel} &bull; ${filtered.length} readings &bull; Generated ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${avgSys}/${avgDia}</div>
              <div class="stat-label">Avg BP (mmHg)</div>
              <div class="stat-range">${minSys}-${maxSys} / ${minDia}-${maxDia}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${avgPulse}</div>
              <div class="stat-label">Avg Pulse (bpm)</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${filtered.length}</div>
              <div class="stat-label">Total Readings</div>
            </div>
          </div>
          <table>
            <tr><th>Date & Time</th><th>BP (mmHg)</th><th>Pulse</th><th>Status</th></tr>
            ${tableRows}
          </table>
          <div class="footer">120/80 BP Tracker &bull; For informational purposes only</div>
        </body>
      </html>`;

      const { uri } = await Print.printToFileAsync({ 
        html,
        base64: false
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { 
          UTI: 'com.adobe.pdf', 
          mimeType: 'application/pdf',
          dialogTitle: 'Share your Blood Pressure Report'
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (e: any) {
      console.error('PDF generation error:', e);
      Alert.alert('Error', 'Failed to generate PDF: ' + (e.message || 'Unknown error'));
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={26} color={colors.design2.redAction} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="picture-as-pdf" size={80} color={colors.design2.redAction} />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Generate Your Report</Text>
        <Text style={styles.description}>
          Create a professional medical summary of your blood pressure and pulse trends to share with your doctor.
        </Text>
      </View>

      <View style={styles.optionsWrapper}>
        <View style={styles.optionsCard}>
          
          <TouchableOpacity style={[styles.optionRow, selectedRange === '7' && styles.optionRowActive]} onPress={() => setSelectedRange('7')} activeOpacity={0.7}>
            <Text style={[styles.optionText, selectedRange === '7' && styles.optionTextActive]}>Last 7 Days</Text>
            <View style={[styles.radio, selectedRange === '7' && styles.radioActive]}>
              {selectedRange === '7' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionRow, selectedRange === '30' && styles.optionRowActive]} onPress={() => setSelectedRange('30')} activeOpacity={0.7}>
            <Text style={[styles.optionText, selectedRange === '30' && styles.optionTextActive]}>Last 30 Days</Text>
            <View style={[styles.radio, selectedRange === '30' && styles.radioActive]}>
              {selectedRange === '30' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionRow, selectedRange === '90' && styles.optionRowActive]} onPress={() => setSelectedRange('90')} activeOpacity={0.7}>
            <Text style={[styles.optionText, selectedRange === '90' && styles.optionTextActive]}>Last 90 Days</Text>
            <View style={[styles.radio, selectedRange === '90' && styles.radioActive]}>
              {selectedRange === '90' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionRow, selectedRange === 'custom' && styles.optionRowActive]} onPress={() => setSelectedRange('custom')} activeOpacity={0.7}>
            <Text style={[styles.optionText, selectedRange === 'custom' && styles.optionTextActive]}>Custom Range...</Text>
            <MaterialIcons name="chevron-right" size={24} color={selectedRange === 'custom' ? '#4AA981' : '#9CA3AF'} />
          </TouchableOpacity>

        </View>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity style={styles.buttonWrapper} activeOpacity={0.9} onPress={handleGeneratePdf}>
          <LinearGradient
            colors={['#6bd173', '#43a047']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <MaterialIcons name="picture-as-pdf" size={22} color="#FFF" />
            <Text style={styles.buttonText}>Generate & Share PDF</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, width: 80 },
  backBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.design2.redAction },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: '#111827' },
  headerRight: { width: 80 },
  imageContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 24, paddingHorizontal: 32 },
  iconCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: colors.design2.redAction, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  textContainer: { paddingHorizontal: 32, alignItems: 'center', marginBottom: 24 },
  title: { fontFamily: 'Inter_800ExtraBold', fontSize: 26, color: '#111827', textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
  description: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  optionsWrapper: { paddingHorizontal: 20 },
  optionsCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 30, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: 'transparent' },
  optionRowActive: { backgroundColor: '#F0FDF4', borderColor: 'rgba(74,169,129,0.3)', borderWidth: 1 },
  optionText: { fontFamily: 'Inter_800ExtraBold', fontSize: 14.5, color: '#4B5563' },
  optionTextActive: { color: '#111827' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#4AA981', borderWidth: 2, backgroundColor: '#FFF' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4AA981' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(243,244,246,0.5)', paddingTop: 16, paddingHorizontal: 20, alignItems: 'center' },
  buttonWrapper: { width: '100%', maxWidth: 320, shadowColor: '#43a047', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 25, elevation: 8, borderRadius: 99 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, borderRadius: 99 },
  buttonText: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#FFF' },
});
