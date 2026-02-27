import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type PayoutEntry = {
  id: string;
  date: string;
  amount: number;
  jobs: number;
  status: 'paid' | 'processing' | 'upcoming';
};

type DailyEarning = {
  day: string;
  amount: number;
  jobs: number;
};

const PERIOD_DATA = {
  today: { earnings: 600, jobs: 3, avgPerJob: 200 },
  week: { earnings: 2195, jobs: 9, avgPerJob: 244 },
  month: { earnings: 7840, jobs: 32, avgPerJob: 245 },
};

const WEEKLY_DAILY: DailyEarning[] = [
  { day: 'Mon', amount: 140, jobs: 1 },
  { day: 'Tue', amount: 660, jobs: 2 },
  { day: 'Wed', amount: 315, jobs: 2 },
  { day: 'Thu', amount: 0, jobs: 0 },
  { day: 'Fri', amount: 480, jobs: 2 },
  { day: 'Sat', amount: 0, jobs: 0 },
  { day: 'Sun', amount: 600, jobs: 3 },
];

const PAYOUTS: PayoutEntry[] = [
  { id: '1', date: 'Feb 22', amount: 600, jobs: 3, status: 'upcoming' },
  { id: '2', date: 'Feb 14', amount: 1560, jobs: 6, status: 'processing' },
  { id: '3', date: 'Feb 7', amount: 2340, jobs: 9, status: 'paid' },
  { id: '4', date: 'Jan 31', amount: 1820, jobs: 7, status: 'paid' },
  { id: '5', date: 'Jan 24', amount: 2080, jobs: 8, status: 'paid' },
  { id: '6', date: 'Jan 17', amount: 1560, jobs: 6, status: 'paid' },
];

const PAYOUT_CONFIG = {
  paid: { label: 'Paid', bg: '#ECFDF5', text: '#065F46' },
  processing: { label: 'Processing', bg: '#FEF9C3', text: '#713F12' },
  upcoming: { label: 'Upcoming', bg: '#EEF2FF', text: '#4338CA' },
};

const maxAmount = Math.max(...WEEKLY_DAILY.map(d => d.amount));

export default function RouteAIEarningsScreen() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const data = PERIOD_DATA[period];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Earnings</Text>
          <Text style={styles.subtitle}>Income dashboard</Text>
        </View>

        {/* Period selector */}
        <View style={styles.periodRow}>
          {(['today', 'week', 'month'] as const).map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hero earnings */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            {period === 'today' ? "Today's Earnings" : period === 'week' ? 'This Week' : 'This Month'}
          </Text>
          <Text style={styles.heroAmount}>${data.earnings.toLocaleString()}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{data.jobs}</Text>
              <Text style={styles.heroStatLabel}>Jobs</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>${data.avgPerJob}</Text>
              <Text style={styles.heroStatLabel}>Avg/Job</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>2.1h</Text>
              <Text style={styles.heroStatLabel}>Avg Duration</Text>
            </View>
          </View>
        </View>

        {/* Weekly bar chart */}
        <Text style={styles.sectionTitle}>This Week — Daily Breakdown</Text>
        <View style={styles.chartCard}>
          {WEEKLY_DAILY.map(d => (
            <View key={d.day} style={styles.chartCol}>
              <Text style={styles.chartAmount}>{d.amount > 0 ? `$${d.amount}` : ''}</Text>
              <View style={styles.chartBarTrack}>
                <View style={[styles.chartBarFill, {
                  height: maxAmount > 0 ? `${(d.amount / maxAmount) * 100}%` as any : '0%',
                  backgroundColor: d.amount > 0 ? '#4F46E5' : '#E0E7FF',
                }]} />
              </View>
              <Text style={styles.chartDay}>{d.day}</Text>
              {d.jobs > 0 && <Text style={styles.chartJobs}>{d.jobs}j</Text>}
            </View>
          ))}
        </View>

        {/* Job type breakdown */}
        <Text style={styles.sectionTitle}>By Service Type</Text>
        <View style={styles.breakdownCard}>
          {[
            { type: 'HVAC', amount: 895, pct: 41, color: '#4F46E5' },
            { type: 'Electrical', amount: 640, pct: 29, color: '#7C3AED' },
            { type: 'Plumbing', amount: 415, pct: 19, color: '#2563EB' },
            { type: 'Other', amount: 245, pct: 11, color: '#94A3B8' },
          ].map(item => (
            <View key={item.type} style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
              <Text style={styles.breakdownType}>{item.type}</Text>
              <View style={styles.breakdownBarTrack}>
                <View style={[styles.breakdownBarFill, { width: `${item.pct}%` as any, backgroundColor: item.color }]} />
              </View>
              <Text style={styles.breakdownAmt}>${item.amount}</Text>
              <Text style={styles.breakdownPct}>{item.pct}%</Text>
            </View>
          ))}
        </View>

        {/* Payout history */}
        <Text style={styles.sectionTitle}>Payout History</Text>
        {PAYOUTS.map(payout => {
          const pc = PAYOUT_CONFIG[payout.status];
          return (
            <View key={payout.id} style={styles.payoutRow}>
              <View>
                <Text style={styles.payoutDate}>{payout.date}</Text>
                <Text style={styles.payoutJobs}>{payout.jobs} jobs</Text>
              </View>
              <View style={styles.payoutRight}>
                <Text style={styles.payoutAmount}>${payout.amount.toLocaleString()}</Text>
                <View style={[styles.payoutBadge, { backgroundColor: pc.bg }]}>
                  <Text style={[styles.payoutBadgeText, { color: pc.text }]}>{pc.label}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Goal card */}
        <View style={styles.goalCard}>
          <Text style={styles.goalLabel}>Monthly Goal</Text>
          <View style={styles.goalRow}>
            <Text style={styles.goalCurrent}>$7,840</Text>
            <Text style={styles.goalOf}> / $10,000</Text>
          </View>
          <View style={styles.goalBarTrack}>
            <View style={[styles.goalBarFill, { width: '78.4%' }]} />
          </View>
          <Text style={styles.goalSub}>78% reached · $2,160 to go · 6 days left in February</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4FF' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 12 },

  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#E0E7FF' },
  periodBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  periodBtnText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  periodBtnTextActive: { color: '#FFF' },

  heroCard: { backgroundColor: '#4F46E5', borderRadius: 22, padding: 22, marginBottom: 20 },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  heroAmount: { fontSize: 44, fontWeight: '900', color: '#FFF', marginBottom: 18 },
  heroStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 14, gap: 8 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  chartCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, borderWidth: 1, borderColor: '#E0E7FF' },
  chartCol: { flex: 1, alignItems: 'center', gap: 4 },
  chartAmount: { fontSize: 8, color: '#4F46E5', fontWeight: '700', textAlign: 'center' },
  chartBarTrack: { flex: 1, width: 22, backgroundColor: '#EEF2FF', borderRadius: 5, overflow: 'hidden', justifyContent: 'flex-end' },
  chartBarFill: { width: '100%', borderRadius: 5 },
  chartDay: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  chartJobs: { fontSize: 9, color: '#94A3B8' },

  breakdownCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20, gap: 12, borderWidth: 1, borderColor: '#E0E7FF' },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownType: { width: 70, fontSize: 12, color: '#1E1B4B', fontWeight: '600' },
  breakdownBarTrack: { flex: 1, height: 6, backgroundColor: '#EEF2FF', borderRadius: 3 },
  breakdownBarFill: { height: 6, borderRadius: 3 },
  breakdownAmt: { width: 44, fontSize: 12, color: '#1E1B4B', fontWeight: '700', textAlign: 'right' },
  breakdownPct: { width: 30, fontSize: 11, color: '#94A3B8', textAlign: 'right' },

  payoutRow: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E0E7FF' },
  payoutDate: { fontSize: 13, fontWeight: '700', color: '#1E1B4B' },
  payoutJobs: { fontSize: 11, color: '#64748B', marginTop: 2 },
  payoutRight: { alignItems: 'flex-end', gap: 5 },
  payoutAmount: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },
  payoutBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  payoutBadgeText: { fontSize: 10, fontWeight: '700' },

  goalCard: { backgroundColor: '#EEF2FF', borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#C7D2FE', gap: 8 },
  goalLabel: { fontSize: 12, color: '#4338CA', fontWeight: '700', textTransform: 'uppercase' },
  goalRow: { flexDirection: 'row', alignItems: 'baseline' },
  goalCurrent: { fontSize: 28, fontWeight: '900', color: '#4F46E5' },
  goalOf: { fontSize: 16, color: '#6366F1' },
  goalBarTrack: { height: 8, backgroundColor: '#C7D2FE', borderRadius: 4 },
  goalBarFill: { height: 8, backgroundColor: '#4F46E5', borderRadius: 4 },
  goalSub: { fontSize: 12, color: '#4338CA' },
});
