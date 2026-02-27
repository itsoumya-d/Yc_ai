import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const INSPECTIONS = [
  {
    id: '1',
    address: '1847 Maple Ave, Austin TX',
    type: 'Wind Damage',
    severity: 'Major',
    date: 'Today',
    photos: 24,
    estimate: '$18,400',
    status: 'in-review',
  },
  {
    id: '2',
    address: '392 Oak St, Round Rock TX',
    type: 'Hail Damage',
    severity: 'Moderate',
    date: 'Yesterday',
    photos: 18,
    estimate: '$7,200',
    status: 'submitted',
  },
  {
    id: '3',
    address: '5021 Pine Blvd, Pflugerville TX',
    type: 'Water Damage',
    severity: 'Minor',
    date: '3 days ago',
    photos: 31,
    estimate: '$3,100',
    status: 'approved',
  },
];

const DAMAGE_TYPES = [
  { type: 'Wind', count: 12 },
  { type: 'Hail', count: 8 },
  { type: 'Water', count: 15 },
  { type: 'Fire', count: 3 },
];

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  Major: { bg: '#FEE2E2', text: '#991B1B' },
  Moderate: { bg: '#FEF9C3', text: '#713F12' },
  Minor: { bg: '#DCFCE7', text: '#14532D' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'in-review': { bg: '#EFF6FF', text: '#1D4ED8' },
  submitted: { bg: '#FEF9C3', text: '#A16207' },
  approved: { bg: '#DCFCE7', text: '#15803D' },
};

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>InspectorAI</Text>
            <Text style={styles.subtitle}>Field Adjuster · Region 4</Text>
          </View>
          <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/capture')}>
            <Text style={styles.newBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>This Month's Assessed Damage</Text>
          <Text style={styles.heroValue}>$127,400</Text>
          <Text style={styles.heroSub}>Across 38 inspections · 29 approved</Text>
          <View style={styles.heroStats}>
            {[
              { label: 'Inspections', value: '38' },
              { label: 'Approved', value: '29' },
              { label: 'Avg Days', value: '2.1' },
            ].map(s => (
              <View key={s.label} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{s.value}</Text>
                <Text style={styles.heroStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Assessment CTA */}
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>🤖 AI Assessment</Text>
          <Text style={styles.aiDesc}>
            Point camera at damage. AI identifies damage type, severity, and generates Xactimate cost codes automatically.
          </Text>
          <TouchableOpacity style={styles.aiBtn} onPress={() => router.push('/capture')}>
            <Text style={styles.aiBtnText}>Start AI Assessment</Text>
          </TouchableOpacity>
        </View>

        {/* Damage Breakdown */}
        <Text style={styles.sectionTitle}>Damage Type Breakdown</Text>
        <View style={styles.damageGrid}>
          {DAMAGE_TYPES.map(d => (
            <View key={d.type} style={styles.damageCard}>
              <Text style={styles.damageCount}>{d.count}</Text>
              <Text style={styles.damageType}>{d.type}</Text>
            </View>
          ))}
        </View>

        {/* Recent Inspections */}
        <Text style={styles.sectionTitle}>Recent Inspections</Text>
        {INSPECTIONS.map(ins => (
          <TouchableOpacity
            key={ins.id}
            style={styles.inspCard}
            onPress={() => router.push('/inspect')}
          >
            <View style={styles.inspBadges}>
              <View style={[styles.badge, { backgroundColor: SEVERITY_COLORS[ins.severity].bg }]}>
                <Text style={[styles.badgeText, { color: SEVERITY_COLORS[ins.severity].text }]}>
                  {ins.severity}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[ins.status].bg }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[ins.status].text }]}>
                  {ins.status.replace('-', ' ')}
                </Text>
              </View>
            </View>
            <Text style={styles.inspAddress}>{ins.address}</Text>
            <Text style={styles.inspType}>{ins.type}</Text>
            <View style={styles.inspFooter}>
              <Text style={styles.inspMeta}>
                {ins.photos} photos · {ins.date}
              </Text>
              <Text style={styles.inspEstimate}>{ins.estimate}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '900', color: '#1E3A5F', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  newBtn: { backgroundColor: '#1E3A5F', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  newBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  heroCard: { backgroundColor: '#1E3A5F', borderRadius: 20, padding: 20, marginBottom: 16 },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  heroValue: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  heroStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 14,
    gap: 24,
  },
  heroStat: {},
  heroStatValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  aiCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  aiTitle: { fontSize: 15, fontWeight: '800', color: '#1E40AF', marginBottom: 6 },
  aiDesc: { fontSize: 13, color: '#1D4ED8', lineHeight: 19, marginBottom: 14 },
  aiBtn: { backgroundColor: '#1D4ED8', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  aiBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  damageGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  damageCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  damageCount: { fontSize: 24, fontWeight: '800', color: '#1E3A5F' },
  damageType: { fontSize: 11, color: '#64748B', marginTop: 2 },
  inspCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inspBadges: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  inspAddress: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  inspType: { fontSize: 13, color: '#1E3A5F', fontWeight: '600', marginBottom: 10 },
  inspFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inspMeta: { fontSize: 12, color: '#64748B' },
  inspEstimate: { fontSize: 16, fontWeight: '800', color: '#1E3A5F' },
});
