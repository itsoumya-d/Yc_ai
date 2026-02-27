import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouteStore } from '../../store/route-store';

const ROUTE_BLUE = '#0369A1';
const GREEN = '#10B981';
const AMBER = '#F59E0B';
const BG = '#F0F7FF';
const CARD = '#FFFFFF';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';

const WEEKLY_DATA = [
  { day: 'Mon', earnings: 0, jobs: 0 },
  { day: 'Tue', earnings: 385, jobs: 4 },
  { day: 'Wed', earnings: 520, jobs: 5 },
  { day: 'Thu', earnings: 195, jobs: 3 },
  { day: 'Fri', earnings: 0, jobs: 0 },
  { day: 'Sat', earnings: 0, jobs: 0 },
  { day: 'Today', earnings: 0, jobs: 0 }, // will be filled
];

export default function EarningsScreen() {
  const { jobs } = useRouteStore();

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const todayEarnings = completedJobs.reduce((s, j) => s + j.earnings, 0);
  const totalEarningsToday = jobs.reduce((s, j) => s + j.earnings, 0);
  const allTimeEarnings = 4820 + todayEarnings;
  const avgRating = completedJobs.filter(j => j.rating > 0).reduce((s, j, _, a) => s + j.rating / a.length, 0);

  const weeklyDataWithToday = WEEKLY_DATA.map(d =>
    d.day === 'Today' ? { ...d, earnings: todayEarnings, jobs: completedJobs.length } : d
  );
  const maxEarnings = Math.max(...weeklyDataWithToday.map(d => d.earnings), 1);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Earnings</Text>
        <Text style={s.sub}>Your performance summary</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Today hero */}
        <View style={s.heroCard}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroLabel}>TODAY'S EARNINGS</Text>
              <Text style={s.heroAmount}>${todayEarnings.toFixed(2)}</Text>
              <Text style={s.heroSub}>of ${totalEarningsToday} potential ({completedJobs.length}/{jobs.length} jobs done)</Text>
            </View>
            <View style={s.heroStats}>
              <View style={s.heroStat}>
                <Text style={s.heroStatNum}>{completedJobs.length}</Text>
                <Text style={s.heroStatLabel}>Done</Text>
              </View>
              <View style={s.heroDivider} />
              <View style={s.heroStat}>
                <Text style={s.heroStatNum}>{jobs.filter(j => j.status === 'upcoming' || j.status === 'current').length}</Text>
                <Text style={s.heroStatLabel}>Left</Text>
              </View>
              <View style={s.heroDivider} />
              <View style={s.heroStat}>
                <Text style={[s.heroStatNum, { color: AMBER }]}>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</Text>
                <Text style={s.heroStatLabel}>⭐ Avg</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly chart */}
        <View style={s.chartCard}>
          <Text style={s.cardTitle}>This Week</Text>
          <View style={s.chart}>
            {weeklyDataWithToday.map(d => {
              const isToday = d.day === 'Today';
              const heightPct = (d.earnings / maxEarnings) * 100;
              return (
                <View key={d.day} style={s.chartBar}>
                  <Text style={s.chartVal}>{d.earnings > 0 ? `$${d.earnings}` : ''}</Text>
                  <View style={s.chartTrack}>
                    <View style={[
                      s.chartFill,
                      { height: `${heightPct}%` as any },
                      isToday && s.chartFillToday,
                    ]} />
                  </View>
                  <Text style={[s.chartDay, isToday && s.chartDayToday]}>{d.day}</Text>
                </View>
              );
            })}
          </View>
          <View style={s.weekTotal}>
            <Text style={s.weekTotalLabel}>Week Total</Text>
            <Text style={s.weekTotalNum}>
              ${(weeklyDataWithToday.reduce((s, d) => s + d.earnings, 0)).toFixed(0)}
            </Text>
          </View>
        </View>

        {/* Job breakdown */}
        <View style={s.breakdownCard}>
          <Text style={s.cardTitle}>Today's Job Breakdown</Text>
          {completedJobs.map(job => (
            <View key={job.id} style={s.jobRow}>
              <View style={s.jobLeft}>
                <Text style={s.jobCustomer}>{job.customer}</Text>
                <Text style={s.jobService}>{job.serviceType}</Text>
                <View style={s.jobMeta}>
                  <Ionicons name="time-outline" size={12} color={TEXT2} />
                  <Text style={s.jobTime}>{job.actualMinutes ?? job.estimatedMinutes} min</Text>
                  {job.rating > 0 && <Text style={s.jobRating}>{'⭐'.repeat(job.rating)}</Text>}
                </View>
              </View>
              <Text style={s.jobEarnings}>${job.earnings}</Text>
            </View>
          ))}
          {completedJobs.length === 0 && (
            <Text style={s.noJobs}>No completed jobs yet today</Text>
          )}
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Ionicons name="cash-outline" size={22} color={GREEN} />
            <Text style={[s.statNum, { color: GREEN }]}>${allTimeEarnings.toLocaleString()}</Text>
            <Text style={s.statLabel}>All Time</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="star" size={22} color={AMBER} />
            <Text style={[s.statNum, { color: AMBER }]}>{avgRating > 0 ? avgRating.toFixed(2) : '—'}</Text>
            <Text style={s.statLabel}>Rating</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="checkmark-circle-outline" size={22} color={ROUTE_BLUE} />
            <Text style={[s.statNum, { color: ROUTE_BLUE }]}>{completedJobs.length + 32}</Text>
            <Text style={s.statLabel}>Total Jobs</Text>
          </View>
        </View>

        {/* Payout */}
        <View style={s.payoutCard}>
          <View style={s.payoutRow}>
            <View>
              <Text style={s.payoutTitle}>Next Payout</Text>
              <Text style={s.payoutDate}>Friday, Jan 17 · Direct deposit</Text>
            </View>
            <View style={s.payoutAmt}>
              <Text style={s.payoutAmtLabel}>Estimated</Text>
              <Text style={s.payoutAmtNum}>${(weeklyDataWithToday.reduce((s, d) => s + d.earnings, 0)).toFixed(0)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={s.payoutBtn}
            onPress={() => Alert.alert('Payout Details', 'View full earnings breakdown and tax information.')}
          >
            <Text style={s.payoutBtnText}>View Payout Details</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 22, fontWeight: '800', color: TEXT },
  sub: { fontSize: 13, color: TEXT2, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 14 },

  heroCard: { backgroundColor: ROUTE_BLUE, borderRadius: 20, padding: 20, marginBottom: 14 },
  heroTop: { gap: 14 },
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  heroAmount: { fontSize: 48, fontWeight: '800', color: '#fff', lineHeight: 52 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 14 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },

  chartCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 14 },
  chart: { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 6 },
  chartBar: { flex: 1, alignItems: 'center', gap: 4 },
  chartVal: { fontSize: 9, color: TEXT2, fontWeight: '600', height: 12 },
  chartTrack: { flex: 1, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  chartFill: { width: '100%', backgroundColor: `${ROUTE_BLUE}80`, borderRadius: 6 },
  chartFillToday: { backgroundColor: ROUTE_BLUE },
  chartDay: { fontSize: 10, color: TEXT2, fontWeight: '600' },
  chartDayToday: { color: ROUTE_BLUE, fontWeight: '800' },
  weekTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  weekTotalLabel: { fontSize: 13, color: TEXT2 },
  weekTotalNum: { fontSize: 16, fontWeight: '800', color: GREEN },

  breakdownCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  jobRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  jobLeft: { flex: 1 },
  jobCustomer: { fontSize: 13, fontWeight: '700', color: TEXT },
  jobService: { fontSize: 11, color: TEXT2, marginTop: 2 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  jobTime: { fontSize: 11, color: TEXT2 },
  jobRating: { fontSize: 10 },
  jobEarnings: { fontSize: 18, fontWeight: '800', color: GREEN },
  noJobs: { fontSize: 13, color: TEXT2, textAlign: 'center', paddingVertical: 16 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, color: TEXT2 },

  payoutCard: { backgroundColor: CARD, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  payoutTitle: { fontSize: 15, fontWeight: '700', color: TEXT },
  payoutDate: { fontSize: 12, color: TEXT2, marginTop: 2 },
  payoutAmt: { alignItems: 'flex-end' },
  payoutAmtLabel: { fontSize: 11, color: TEXT2 },
  payoutAmtNum: { fontSize: 24, fontWeight: '800', color: GREEN },
  payoutBtn: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  payoutBtnText: { fontSize: 14, fontWeight: '700', color: ROUTE_BLUE },
});
