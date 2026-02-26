import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const CHECKS = [
  { id: '1', area: 'Left Cheek', date: '2 days ago', severity: 'clear', score: 94, change: '+2' },
  { id: '2', area: 'Forehead', date: '2 days ago', severity: 'watch', score: 71, change: '-5' },
  { id: '3', area: 'Right Shoulder (mole)', date: '7 days ago', severity: 'monitor', score: 58, change: '-3' },
  { id: '4', area: 'Neck (rash)', date: '14 days ago', severity: 'resolved', score: 95, change: '+24' },
];

const CORRELATIONS = [
  { factor: 'Sleep', value: '5.2 hrs avg', impact: 'negative', icon: '😴' },
  { factor: 'Hydration', value: '6 glasses/day', impact: 'neutral', icon: '💧' },
  { factor: 'Stress', value: 'High this week', impact: 'negative', icon: '😰' },
];

export default function HomeScreen() {
  const overallScore = 79;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Score card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreTitle}>Skin Health Score</Text>
            <Text style={styles.scoreValue}>{overallScore}</Text>
            <Text style={styles.scoreStatus}>Good · 2 areas to watch</Text>
          </View>
          <View style={styles.scoreRight}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreCircleText}>{overallScore}</Text>
            </View>
          </View>
        </View>

        {/* Scan CTA */}
        <TouchableOpacity style={styles.scanCard} onPress={() => router.push('/scan')}>
          <Text style={styles.scanEmoji}>📸</Text>
          <View>
            <Text style={styles.scanTitle}>Daily Skin Check</Text>
            <Text style={styles.scanDesc}>AI analysis · 30 seconds</Text>
          </View>
          <View style={styles.scanBadge}><Text style={styles.scanBadgeText}>Due Today</Text></View>
        </TouchableOpacity>

        {/* Recent checks */}
        <Text style={styles.sectionTitle}>Recent Checks</Text>
        {CHECKS.map((check) => (
          <TouchableOpacity key={check.id} style={styles.checkCard} onPress={() => router.push(`/analysis/${check.id}`)}>
            <View style={[styles.severityDot, check.severity === 'clear' ? styles.dotClear : check.severity === 'watch' ? styles.dotWatch : check.severity === 'monitor' ? styles.dotMonitor : styles.dotResolved]} />
            <View style={styles.checkContent}>
              <Text style={styles.checkArea}>{check.area}</Text>
              <Text style={styles.checkDate}>{check.date}</Text>
            </View>
            <View style={styles.checkRight}>
              <Text style={styles.checkScore}>{check.score}</Text>
              <Text style={[styles.checkChange, check.change.startsWith('+') ? styles.changePos : styles.changeNeg]}>{check.change}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Health correlations */}
        <Text style={styles.sectionTitle}>Health Correlations</Text>
        <View style={styles.correlCard}>
          <Text style={styles.correlTitle}>Factors affecting your skin today</Text>
          {CORRELATIONS.map((c) => (
            <View key={c.factor} style={styles.correlRow}>
              <Text style={styles.correlIcon}>{c.icon}</Text>
              <View style={styles.correlContent}>
                <Text style={styles.correlFactor}>{c.factor}</Text>
                <Text style={styles.correlValue}>{c.value}</Text>
              </View>
              <View style={[styles.impactBadge, c.impact === 'negative' ? styles.impactNeg : c.impact === 'neutral' ? styles.impactNeutral : styles.impactPos]}>
                <Text style={styles.impactText}>{c.impact}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>⚕️ AuraCheck is not a medical device. Consult a dermatologist for concerning skin changes.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF2F8' },
  scroll: { padding: 16, paddingBottom: 40 },
  scoreCard: { backgroundColor: '#A21CAF', borderRadius: 20, padding: 20, flexDirection: 'row', marginBottom: 16 },
  scoreLeft: { flex: 1 },
  scoreTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  scoreValue: { color: '#fff', fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  scoreStatus: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  scoreRight: { justifyContent: 'center' },
  scoreCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  scoreCircleText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  scanCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, shadowColor: '#A21CAF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  scanEmoji: { fontSize: 32 },
  scanTitle: { color: '#1C1917', fontSize: 15, fontWeight: '700' },
  scanDesc: { color: '#78716C', fontSize: 13 },
  scanBadge: { backgroundColor: '#FAE8FF', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 'auto' },
  scanBadgeText: { color: '#A21CAF', fontSize: 11, fontWeight: '700' },
  sectionTitle: { color: '#78716C', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  checkCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  severityDot: { width: 12, height: 12, borderRadius: 6 },
  dotClear: { backgroundColor: '#22C55E' },
  dotWatch: { backgroundColor: '#F59E0B' },
  dotMonitor: { backgroundColor: '#DC2626' },
  dotResolved: { backgroundColor: '#94A3B8' },
  checkContent: { flex: 1 },
  checkArea: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  checkDate: { color: '#94A3B8', fontSize: 12 },
  checkRight: { alignItems: 'flex-end' },
  checkScore: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  checkChange: { fontSize: 12, fontWeight: '600' },
  changePos: { color: '#22C55E' },
  changeNeg: { color: '#DC2626' },
  correlCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  correlTitle: { color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 12 },
  correlRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  correlIcon: { fontSize: 20 },
  correlContent: { flex: 1 },
  correlFactor: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  correlValue: { color: '#78716C', fontSize: 12 },
  impactBadge: { borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  impactNeg: { backgroundColor: '#FEF2F2' },
  impactNeutral: { backgroundColor: '#F1F5F9' },
  impactPos: { backgroundColor: '#F0FDF4' },
  impactText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  disclaimer: { color: '#94A3B8', fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 8 },
});
