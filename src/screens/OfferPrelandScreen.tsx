import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function OfferPrelandScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: 160 }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={26} color="#97202B" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.badgeWrapper}>
          <LinearGradient
            colors={['#1956B3', '#2B75E6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badge}
          >
            <MaterialIcons name="star" size={10} color="#FFF" />
            <Text style={styles.badgeText}>EXCLUSIVE OFFER</Text>
            <MaterialIcons name="star" size={10} color="#FFF" />
          </LinearGradient>
        </View>

        <View style={styles.headlineWrapper}>
          <Text style={styles.headline}>Your Blood Pressure May Qualify You for $150/Month</Text>
          <Text style={styles.subHeadline}>
            Many individuals managing High Blood pressure may be eligible for additional compensation due to qualifying health benefits. This program helps you understand your potential benefits with a simple call.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>WHAT YOU GET</Text>
            <View style={styles.grid}>
              
              <View style={styles.gridItem}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="monetization-on" size={22} color="#1956B3" />
                </View>
                <Text style={styles.itemTitle}>$150/mo{'\n'}cash back</Text>
                <Text style={styles.itemDesc}>Potential monthly compensation.</Text>
              </View>

              <View style={styles.gridItem}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="update" size={22} color="#1956B3" />
                </View>
                <Text style={styles.itemTitle}>3-5 min{'\n'}call</Text>
                <Text style={styles.itemDesc}>Quick and easy eligibility check.</Text>
              </View>

              <View style={styles.gridItem}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="verified-user" size={22} color="#1956B3" />
                </View>
                <Text style={styles.itemTitle}>FREE{'\n'}assessment</Text>
                <Text style={styles.itemDesc}>No obligation consultation.</Text>
              </View>

            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>HOW IT WORKS</Text>
            <View style={styles.stepList}>
              
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                <View style={styles.stepTextWrapper}>
                  <View style={styles.stepTitleRow}>
                    <MaterialIcons name="phone-in-talk" size={16} color="#1956B3" />
                    <Text style={styles.stepTitle}>Tap to Call</Text>
                  </View>
                  <Text style={styles.stepDesc}>Connect with our health benefit specialists directly.</Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                <View style={styles.stepTextWrapper}>
                  <View style={styles.stepTitleRow}>
                    <MaterialIcons name="help-outline" size={16} color="#1956B3" />
                    <Text style={styles.stepTitle}>Discuss Your BP</Text>
                  </View>
                  <Text style={styles.stepDesc}>Answer a few questions about your blood pressure management.</Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                <View style={styles.stepTextWrapper}>
                  <View style={styles.stepTitleRow}>
                    <MaterialIcons name="thumb-up-alt" size={16} color="#1956B3" />
                    <Text style={styles.stepTitle}>Claim Your Benefits</Text>
                  </View>
                  <Text style={styles.stepDesc}>If qualified, start receiving your monthly compensation.</Text>
                </View>
              </View>

            </View>
          </View>
        </View>

      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.scarcityBanner}>
          <View style={styles.scarcityLeft}>
            <MaterialIcons name="local-fire-department" size={24} color="#FFF" />
            <Text style={styles.scarcityTitle}>Scarcity</Text>
          </View>
          <View style={styles.scarcityRight}>
            <Text style={styles.scarcityText}>13 spots left in your area today.{'\n'}Act fast before they're gone!</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.callButtonWrapper} activeOpacity={0.9}>
          <View style={styles.callButton}>
            <MaterialIcons name="phone-in-talk" size={22} color="#FFF" />
            <Text style={styles.callButtonText}>Call Now to Claim</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA' },
  scrollContent: { },
  header: { paddingHorizontal: 8, paddingBottom: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  backBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#97202B' },
  badgeWrapper: { alignItems: 'center', marginTop: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  badgeText: { color: '#FFF', fontFamily: 'Inter_800ExtraBold', fontSize: 10, letterSpacing: 1 },
  headlineWrapper: { paddingHorizontal: 20, marginTop: 16, marginBottom: 24, alignItems: 'center' },
  headline: { fontFamily: 'Inter_900Black', fontSize: 26, color: '#97202B', textAlign: 'center', lineHeight: 28, letterSpacing: -0.5 },
  subHeadline: { fontFamily: 'Inter_500Medium', fontSize: 11.5, color: '#6B7280', textAlign: 'center', marginTop: 12, lineHeight: 16, paddingHorizontal: 8 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.03, shadowRadius: 30, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  sectionTitle: { fontFamily: 'Inter_900Black', fontSize: 11, color: '#374151', textAlign: 'center', letterSpacing: 1, marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 12 },
  gridItem: { flex: 1, backgroundColor: '#F4F7FA', borderRadius: 12, padding: 10, alignItems: 'center' },
  iconBox: { width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 8 },
  itemTitle: { fontFamily: 'Inter_800ExtraBold', fontSize: 12, color: '#111827', textAlign: 'center', lineHeight: 14 },
  itemDesc: { fontFamily: 'Inter_500Medium', fontSize: 9, color: '#6B7280', textAlign: 'center', marginTop: 6, lineHeight: 11 },
  stepList: { gap: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F0FE', justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontFamily: 'Inter_900Black', fontSize: 14, color: '#1956B3' },
  stepTextWrapper: { flex: 1, paddingTop: 2 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepTitle: { fontFamily: 'Inter_800ExtraBold', fontSize: 13, color: '#111827' },
  stepDesc: { fontFamily: 'Inter_500Medium', fontSize: 11.5, color: '#6B7280', marginTop: 4, lineHeight: 16 },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, paddingHorizontal: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.03, shadowRadius: 15, elevation: 10 },
  scarcityBanner: { backgroundColor: '#97202B', borderRadius: 8, padding: 10, flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 320, marginBottom: 12 },
  scarcityLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 12 },
  scarcityTitle: { fontFamily: 'Inter_900Black', fontSize: 15, color: '#FFF', letterSpacing: 0.5 },
  scarcityRight: { flex: 1, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)', paddingLeft: 12, justifyContent: 'center' },
  scarcityText: { fontFamily: 'Inter_500Medium', fontSize: 9.5, color: '#FFF', textAlign: 'center', lineHeight: 11 },
  callButtonWrapper: { width: '100%', maxWidth: 320, shadowColor: '#1956B3', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 25, elevation: 8, borderRadius: 99 },
  callButton: { backgroundColor: '#1956B3', borderRadius: 99, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  callButtonText: { fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: '#FFF' },
});
