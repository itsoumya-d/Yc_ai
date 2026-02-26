import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRouteStore } from '../../store/route-store';

const ROUTE_BLUE = '#0369A1';
const SKY = '#0EA5E9';
const GREEN = '#10B981';
const AMBER = '#F59E0B';
const BG = '#F0F7FF';
const CARD = '#FFFFFF';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';

export default function RouteScreen() {
  const { jobs, currentJobId, startJob, skipJob } = useRouteStore();
  const router = useRouter();

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const upcomingJobs = jobs.filter(j => j.status === 'upcoming' || j.status === 'current');
  const currentJob = jobs.find(j => j.id === currentJobId);
  const totalEarnings = completedJobs.reduce((s, j) => s + j.earnings, 0);
  const totalEarningsToday = jobs.reduce((s, j) => s + j.earnings, 0);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logoRow}>
            <Ionicons name="navigate" size={22} color="#fff" />
            <Text style={s.logoText}>RouteAI</Text>
          </View>
          <Text style={s.headerSub}>Today's Route · {jobs.length} stops</Text>
        </View>
        <View style={s.earningsBadge}>
          <Text style={s.earningsLabel}>Today</Text>
          <Text style={s.earningsNum}>${totalEarningsToday}</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={s.progressCard}>
          <View style={s.progressTop}>
            <Text style={s.progressText}>{completedJobs.length} of {jobs.length} stops complete</Text>
            <Text style={s.progressPct}>{Math.round((completedJobs.length / jobs.length) * 100)}%</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${(completedJobs.length / jobs.length) * 100}%` as any }]} />
          </View>
          <View style={s.progressStats}>
            <Text style={s.progressStat}>${totalEarnings.toFixed(0)} earned</Text>
            <Text style={s.progressStat}>{completedJobs.reduce((s, j) => s + (j.actualMinutes ?? j.estimatedMinutes), 0)}m on jobs</Text>
            <Text style={s.progressStat}>{upcomingJobs.length} remaining</Text>
          </View>
        </View>

        {/* Current job */}
        {currentJob && (
          <View style={s.currentCard}>
            <View style={s.currentBadge}>
              <View style={s.currentDot} />
              <Text style={s.currentBadgeText}>CURRENT STOP #{currentJob.stopNumber}</Text>
            </View>
            <Text style={s.currentCustomer}>{currentJob.customer}</Text>
            <Text style={s.currentAddress}>{currentJob.address}</Text>
            <View style={s.currentMeta}>
              <View style={s.currentMetaItem}>
                <Ionicons name="construct-outline" size={14} color={TEXT2} />
                <Text style={s.currentMetaText}>{currentJob.serviceType}</Text>
              </View>
              <View style={s.currentMetaItem}>
                <Ionicons name="time-outline" size={14} color={TEXT2} />
                <Text style={s.currentMetaText}>{currentJob.timeWindow}</Text>
              </View>
              <View style={s.currentMetaItem}>
                <Ionicons name="cash-outline" size={14} color={GREEN} />
                <Text style={[s.currentMetaText, { color: GREEN }]}>${currentJob.earnings}</Text>
              </View>
            </View>
            <View style={s.currentActions}>
              <TouchableOpacity style={s.navigateBtn} onPress={() => Alert.alert('Navigate', `Opening navigation to:\n${currentJob.address}`)}>
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={s.navigateBtnText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.detailBtn} onPress={() => router.push('/(tabs)/jobs')}>
                <Text style={s.detailBtnText}>Job Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Route stops list */}
        <Text style={s.sectionTitle}>All Stops Today</Text>
        {jobs.map((job, idx) => {
          const statusColors = {
            completed: GREEN,
            current: ROUTE_BLUE,
            upcoming: TEXT2,
            skipped: '#EF4444',
          };
          const statusColor = statusColors[job.status];
          const isDone = job.status === 'completed';
          const isCurrent = job.status === 'current';

          return (
            <View key={job.id} style={s.stopRow}>
              {/* Connector line */}
              <View style={s.stopLeft}>
                <View style={[s.stopNumber, { backgroundColor: isDone ? GREEN : isCurrent ? ROUTE_BLUE : '#F1F5F9', borderColor: statusColor }]}>
                  {isDone ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : (
                    <Text style={[s.stopNum, { color: isCurrent ? '#fff' : TEXT2 }]}>{job.stopNumber}</Text>
                  )}
                </View>
                {idx < jobs.length - 1 && <View style={[s.connector, isDone && { backgroundColor: GREEN }]} />}
              </View>

              {/* Stop info */}
              <TouchableOpacity
                style={[s.stopCard, isCurrent && s.stopCardCurrent, isDone && s.stopCardDone, job.status === 'skipped' && s.stopCardSkipped]}
                onPress={() => isCurrent ? router.push('/(tabs)/jobs') : undefined}
              >
                <View style={s.stopInfo}>
                  <Text style={[s.stopCustomer, isDone && s.textMuted]}>{job.customer}</Text>
                  <Text style={s.stopService}>{job.serviceType}</Text>
                  <Text style={s.stopTime}>{job.timeWindow}</Text>
                </View>
                <View style={s.stopRight}>
                  <Text style={[s.stopEarnings, { color: isDone ? GREEN : TEXT }]}>${job.earnings}</Text>
                  {job.status === 'upcoming' && (
                    <TouchableOpacity style={s.startBtn} onPress={() => startJob(job.id)}>
                      <Text style={s.startBtnText}>Start</Text>
                    </TouchableOpacity>
                  )}
                  {isCurrent && (
                    <View style={s.currentIndicator}>
                      <Text style={s.currentIndicatorText}>▶ Now</Text>
                    </View>
                  )}
                  {isDone && job.rating > 0 && (
                    <Text style={s.starRating}>{'⭐'.repeat(job.rating)}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* AI optimization hint */}
        <View style={s.aiCard}>
          <Ionicons name="sparkles" size={18} color={ROUTE_BLUE} />
          <View style={{ flex: 1 }}>
            <Text style={s.aiTitle}>Route Optimized by AI</Text>
            <Text style={s.aiText}>Saved ~28 miles and 45 min vs. original order. Traffic accounted for 1:00 PM window.</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: ROUTE_BLUE },
  headerLeft: {},
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  logoText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  earningsBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10, alignItems: 'center' },
  earningsLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  earningsNum: { fontSize: 20, fontWeight: '800', color: '#fff' },

  scroll: { flex: 1 },
  content: { padding: 16 },

  progressCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 13, color: TEXT2 },
  progressPct: { fontSize: 13, fontWeight: '700', color: ROUTE_BLUE },
  progressBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: ROUTE_BLUE, borderRadius: 4 },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between' },
  progressStat: { fontSize: 12, color: TEXT2 },

  currentCard: { backgroundColor: ROUTE_BLUE, borderRadius: 18, padding: 18, marginBottom: 16 },
  currentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  currentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399' },
  currentBadgeText: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.5 },
  currentCustomer: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  currentAddress: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  currentMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  currentMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  currentMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  currentActions: { flexDirection: 'row', gap: 10 },
  navigateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, padding: 13, justifyContent: 'center' },
  navigateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  detailBtn: { paddingHorizontal: 18, paddingVertical: 13, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  detailBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 10 },
  stopRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  stopLeft: { width: 32, alignItems: 'center' },
  stopNumber: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  stopNum: { fontSize: 12, fontWeight: '700' },
  connector: { flex: 1, width: 2, backgroundColor: '#E2E8F0', marginVertical: 3 },
  stopCard: { flex: 1, flexDirection: 'row', backgroundColor: CARD, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'space-between', alignItems: 'center' },
  stopCardCurrent: { borderColor: ROUTE_BLUE, backgroundColor: '#EFF6FF' },
  stopCardDone: { opacity: 0.6 },
  stopCardSkipped: { opacity: 0.4 },
  stopInfo: { flex: 1 },
  stopCustomer: { fontSize: 13, fontWeight: '700', color: TEXT },
  textMuted: { textDecorationLine: 'line-through' },
  stopService: { fontSize: 11, color: TEXT2, marginTop: 2 },
  stopTime: { fontSize: 11, color: TEXT2 },
  stopRight: { alignItems: 'flex-end', gap: 4 },
  stopEarnings: { fontSize: 14, fontWeight: '700' },
  startBtn: { backgroundColor: ROUTE_BLUE, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  startBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  currentIndicator: { backgroundColor: `${ROUTE_BLUE}20`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  currentIndicatorText: { fontSize: 11, color: ROUTE_BLUE, fontWeight: '700' },
  starRating: { fontSize: 10 },

  aiCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  aiTitle: { fontSize: 13, fontWeight: '700', color: ROUTE_BLUE, marginBottom: 3 },
  aiText: { fontSize: 12, color: '#1E40AF', lineHeight: 17 },
});
