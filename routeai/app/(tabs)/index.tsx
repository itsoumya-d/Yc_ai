import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const JOBS = [
  {
    id: '1',
    customer: 'Sarah Johnson',
    address: '2847 Oak Ave, Portland',
    type: 'HVAC Repair',
    window: '8:00 – 10:00 AM',
    distance: '2.1 mi',
    status: 'en-route',
    priority: 'high',
  },
  {
    id: '2',
    customer: 'Mike Chen',
    address: '5102 Pine St, Beaverton',
    type: 'Plumbing',
    window: '10:30 AM – 12:30 PM',
    distance: '5.4 mi',
    status: 'pending',
    priority: 'normal',
  },
  {
    id: '3',
    customer: 'Linda Park',
    address: '891 Elm Blvd, Gresham',
    type: 'Electrical',
    window: '1:00 – 3:00 PM',
    distance: '8.7 mi',
    status: 'pending',
    priority: 'normal',
  },
  {
    id: '4',
    customer: 'Tom Davis',
    address: '1203 Maple Dr, Lake Oswego',
    type: 'HVAC Maintenance',
    window: '3:30 – 5:30 PM',
    distance: '12.1 mi',
    status: 'pending',
    priority: 'low',
  },
];

const STATUS_COLORS: Record<string, string> = {
  'en-route': '#3B82F6',
  pending: '#F59E0B',
  done: '#22C55E',
};

export default function RouteScreen() {
  const [optimized, setOptimized] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>RouteAI</Text>
            <Text style={styles.subtitle}>Jake Thompson · Field Tech</Text>
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/route')}>
            <Text style={styles.startBtnText}>▶ Start Route</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Jobs Today', value: '8', sub: '4 remaining' },
            { label: 'Miles', value: '47', sub: 'optimized' },
            { label: 'Est. Earnings', value: '$340', sub: 'today' },
            { label: 'On-Time', value: '94%', sub: 'this week' },
          ].map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statSub}>{stat.sub}</Text>
            </View>
          ))}
        </View>

        {/* Route Map */}
        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapHint}>Route Map</Text>
            <View style={styles.waypointLine} />
            {[
              { x: 60, y: 60, n: '1' },
              { x: 130, y: 80, n: '2' },
              { x: 200, y: 55, n: '3' },
              { x: 265, y: 95, n: '4' },
            ].map(w => (
              <View key={w.n} style={[styles.waypoint, { left: w.x, top: w.y }]}>
                <Text style={styles.waypointNum}>{w.n}</Text>
              </View>
            ))}
          </View>
          <View style={styles.mapFooter}>
            <View style={[styles.optimizeBadge, { backgroundColor: optimized ? '#D1FAE5' : '#FEF3C7' }]}>
              <Text style={[styles.optimizeText, { color: optimized ? '#065F46' : '#92400E' }]}>
                {optimized ? '✓ AI Optimized · Save 23 min' : 'Not Optimized'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setOptimized(true)}>
              <Text style={styles.reoptimize}>Re-optimize</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Job List */}
        <Text style={styles.sectionTitle}>Today's Jobs</Text>
        {JOBS.map((job, idx) => (
          <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => router.push('/jobs')}>
            <View style={styles.jobNum}>
              <Text style={styles.jobNumText}>{idx + 1}</Text>
            </View>
            <View style={styles.jobContent}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobCustomer}>{job.customer}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: (STATUS_COLORS[job.status] || '#94A3B8') + '20' },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: STATUS_COLORS[job.status] || '#94A3B8' }]}
                  >
                    {job.status.replace('-', ' ')}
                  </Text>
                </View>
              </View>
              <Text style={styles.jobType}>{job.type}</Text>
              <Text style={styles.jobAddress}>{job.address}</Text>
              <View style={styles.jobMeta}>
                <Text style={styles.jobMetaText}>{job.window}</Text>
                <Text style={styles.jobMetaDot}>·</Text>
                <Text style={styles.jobMetaText}>{job.distance}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* AI Footer */}
        <View style={styles.aiFooter}>
          <Text style={styles.aiFooterText}>
            AI route saves 47 min vs manual ordering. Accounts for traffic, job duration history, and customer windows.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4FF' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '900', color: '#1A1A2E', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  startBtn: { backgroundColor: '#4F46E5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  startBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  statValue: { fontSize: 24, fontWeight: '900', color: '#1A1A2E', marginBottom: 2 },
  statLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  statSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: '#EEF2FF',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHint: { color: '#6366F1', fontSize: 13, fontWeight: '600', opacity: 0.4 },
  waypointLine: {
    position: 'absolute',
    top: 70,
    left: 74,
    right: 56,
    height: 2,
    backgroundColor: '#6366F1',
    opacity: 0.4,
  },
  waypoint: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointNum: { color: '#fff', fontWeight: '800', fontSize: 13 },
  mapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  optimizeBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  optimizeText: { fontSize: 12, fontWeight: '700' },
  reoptimize: { fontSize: 12, color: '#4F46E5', fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  jobNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobNumText: { fontSize: 15, fontWeight: '800', color: '#4F46E5' },
  jobContent: { flex: 1 },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  jobCustomer: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  statusBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  jobType: { fontSize: 13, color: '#4F46E5', fontWeight: '600', marginBottom: 2 },
  jobAddress: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jobMetaText: { fontSize: 11, color: '#9CA3AF' },
  jobMetaDot: { color: '#D1D5DB', fontSize: 12 },
  aiFooter: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  aiFooterText: { fontSize: 12, color: '#4338CA', lineHeight: 18, textAlign: 'center' },
});
