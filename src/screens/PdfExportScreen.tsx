import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
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
        alert("No data available for the selected range.");
        return;
      }

      const tableRows = filtered.map(r => {
        const d = new Date(r.timestamp);
        return `<tr>
          <td>${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
          <td>${r.systolic}/${r.diastolic}</td>
          <td>${r.pulse}</td>
        </tr>`;
      }).join('');

      const chartLabels = JSON.stringify(filtered.map(r => {
        const d = new Date(r.timestamp);
        return d.toLocaleDateString();
      }));
      const chartSys = JSON.stringify(filtered.map(r => r.systolic));
      const chartDia = JSON.stringify(filtered.map(r => r.diastolic));

      const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #97202B; text-align: center; }
            .chart-container { width: 100%; height: 300px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
            th { background-color: #F4F7FA; color: #111827; }
          </style>
        </head>
        <body>
          <h1>Blood Pressure Report</h1>
          <div class="chart-container">
            <canvas id="myChart"></canvas>
          </div>
          <table>
            <tr>
              <th>Date & Time</th>
              <th>BP (mmHg)</th>
              <th>Pulse (bpm)</th>
            </tr>
            ${tableRows}
          </table>
          <script>
            const ctx = document.getElementById('myChart');
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: ${chartLabels},
                datasets: [
                  {
                    label: 'Systolic',
                    data: ${chartSys},
                    borderColor: '#DC2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    tension: 0.3
                  },
                  {
                    label: 'Diastolic',
                    data: ${chartDia},
                    borderColor: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.3
                  }
                ]
              },
              options: { responsive: true, maintainAspectRatio: false }
            });
          </script>
        </body>
      </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF.");
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
        <Image source={require('../../assets/images/pdf_document.png')} style={styles.image} resizeMode="contain" />
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
  image: { width: 200, height: 200 },
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
