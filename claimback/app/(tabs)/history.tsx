import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClaimsStore } from '../../store/claims-store';

const BLUE = '#2563EB';
const GREEN = '#10B981';
const ORANGE = '#F97316';
const BG = '#FAFBFC';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTHLY_DATA = [
  { month: 'Aug', savings: 0 },
  { month: 'Sep', savings: 125 },
  { month: 'Oct', savings: 0 },
  { month: 'Nov', savings: 450.50 },
  { month: 'Dec', savings: 84 },
  { month: 'Jan', savings: 400 },
];

const MAX_SAVINGS = Math.max(...MONTHLY_DATA.map(d => d.savings));

function SavingsBar({ month, savings, maxVal }: { month: string; savings: number; maxVal: number }) {
  const heightPct = maxVal > 0 ? (savings / maxVal) * 100 : 0;
  const isHighest = savings === maxVal && savings > 0;

  return (
    <View style={bar.wrap}>
      <Text style={bar.val}>{savings > 0 ? `$${savings.toFixed(0)}` : ''}</Text>
      <View style={bar.track}>
        <View
          style={[
            bar.fill,
            { height: `${heightPct}%` as any },
            isHighest && bar.fillHighest,
          ]}
        />
      </View>
      <Text style={bar.month}>{month}</Text>
    </View>
  );
}

const bar = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', gap: 4 },
  val: { fontSize: 10, color: '#6B7280', fontWeight: '600', height: 14 },
  track: { flex: 1, width: 32, backgroundColor: '#F3F4F6', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  fill: { width: '100%', backgroundColor: `${GREEN}90`, borderRadius: 6 },
  fillHighest: { backgroundColor: GREEN },
  month: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
});

function WinCard({ dispute }: { dispute: ReturnType<typeof useClaimsStore>['disputes'][0] }) {
  const resolvedAmt = dispute.resolvedAmount ?? dispute.amount;
  return (
    <View style={wc.card}>
      <View style={wc.left}>
        <View style={wc.iconWrap}>
          <Ionicons name="checkmark-circle" size={22} color={GREEN} />
        </View>
        <View>
          <Text style={wc.provider}>{dispute.provider}</Text>
          <Text style={wc.ref}>Ref: {dispute.referenceNumber}</Text>
          <Text style={wc.date}>{dispute.timeline[dispute.timeline.length - 1]?.date ?? ''}</Text>
        </View>
      </View>
      <Text style={wc.amt}>+${resolvedAmt.toFixed(2)}</Text>
    </View>
  );
}

const wc = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1, borderColor: `${GREEN}30` },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  provider: { fontSize: 14, fontWeight: '700', color: '#111827' },
  ref: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  date: { fontSize: 11, color: '#9CA3AF' },
  amt: { fontSize: 20, fontWeight: '800', color: GREEN },
});

export default function HistoryScreen() {
  const { disputes, totalSavings, bills } = useClaimsStore();
  const [activeTab, setActiveTab] = useState<'wins' | 'all'>('wins');

  const resolvedDisputes = disputes.filter(d => d.status === 'resolved');
  const rejectedDisputes = disputes.filter(d => d.status === 'rejected');
  const totalDisputed = disputes.reduce((sum, d) => sum + d.amount, 0);
  const winRate = disputes.length > 0 ? Math.round((resolvedDisputes.length / disputes.length) * 100) : 0;

  const displayDisputes = activeTab === 'wins'
    ? resolvedDisputes
    : disputes.filter(d => d.status === 'resolved' || d.status === 'rejected');

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Savings History</Text>
        <Text style={s.sub}>Your dispute track record</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* All-time stats */}
        <View style={s.heroCard}>
          <View style={s.heroRow}>
            <View style={s.heroStat}>
              <Text style={s.heroVal}>${totalSavings.toFixed(2)}</Text>
              <Text style={s.heroLabel}>Total Recovered</Text>
            </View>
            <View style={s.heroDiv} />
            <View style={s.heroStat}>
              <Text style={[s.heroVal, { color: ORANGE }]}>${totalDisputed.toFixed(0)}</Text>
              <Text style={s.heroLabel}>Total Disputed</Text>
            </View>
            <View style={s.heroDiv} />
            <View style={s.heroStat}>
              <Text style={[s.heroVal, { color: '#7C3AED' }]}>{winRate}%</Text>
              <Text style={s.heroLabel}>Win Rate</Text>
            </View>
          </View>
        </View>

        {/* Badges */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.badgesRow} contentContainerStyle={s.badges}>
          {totalSavings > 1000 && (
            <View style={[s.badge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={s.badgeIcon}>🏆</Text>
              <Text style={[s.badgeText, { color: '#92400E' }]}>$1K Club</Text>
            </View>
          )}
          {resolvedDisputes.length >= 1 && (
            <View style={[s.badge, { backgroundColor: '#ECFDF5' }]}>
              <Text style={s.badgeIcon}>⚖️</Text>
              <Text style={[s.badgeText, { color: '#065F46' }]}>First Win</Text>
            </View>
          )}
          {resolvedDisputes.length >= 3 && (
            <View style={[s.badge, { backgroundColor: '#EFF6FF' }]}>
              <Text style={s.badgeIcon}>🔥</Text>
              <Text style={[s.badgeText, { color: '#1E40AF' }]}>On a Roll</Text>
            </View>
          )}
          {winRate >= 75 && (
            <View style={[s.badge, { backgroundColor: '#F3E8FF' }]}>
              <Text style={s.badgeIcon}>💎</Text>
              <Text style={[s.badgeText, { color: '#6D28D9' }]}>75% Win Rate</Text>
            </View>
          )}
          {bills.length >= 3 && (
            <View style={[s.badge, { backgroundColor: '#FFF7ED' }]}>
              <Text style={s.badgeIcon}>🔍</Text>
              <Text style={[s.badgeText, { color: '#9A3412' }]}>Bill Scanner</Text>
            </View>
          )}
        </ScrollView>

        {/* Monthly savings chart */}
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>Monthly Savings</Text>
          <View style={s.chart}>
            {MONTHLY_DATA.map(d => (
              <SavingsBar key={d.month} month={d.month} savings={d.savings} maxVal={MAX_SAVINGS} />
            ))}
          </View>
          <View style={s.chartLegend}>
            <View style={s.legendDot} />
            <Text style={s.legendText}>Refunds recovered per month</Text>
          </View>
        </View>

        {/* Quick stats row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={GREEN} />
            <Text style={s.statBig}>{resolvedDisputes.length}</Text>
            <Text style={s.statLabel}>Disputes Won</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="close-circle" size={24} color="#EF4444" />
            <Text style={s.statBig}>{rejectedDisputes.length}</Text>
            <Text style={s.statLabel}>Disputes Lost</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="time" size={24} color={ORANGE} />
            <Text style={s.statBig}>{disputes.filter(d => ['pending','submitted','in_review'].includes(d.status)).length}</Text>
            <Text style={s.statLabel}>In Progress</Text>
          </View>
        </View>

        {/* Win history */}
        <View style={s.section}>
          <View style={s.tabRow}>
            <TouchableOpacity
              style={[s.tab, activeTab === 'wins' && s.tabActive]}
              onPress={() => setActiveTab('wins')}
            >
              <Text style={[s.tabText, activeTab === 'wins' && s.tabTextActive]}>
                ✅ Wins ({resolvedDisputes.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, activeTab === 'all' && s.tabActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[s.tabText, activeTab === 'all' && s.tabTextActive]}>
                All Closed
              </Text>
            </TouchableOpacity>
          </View>

          {displayDisputes.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🎯</Text>
              <Text style={s.emptyTitle}>No wins yet</Text>
              <Text style={s.emptySub}>Resolve your first dispute to see it here.</Text>
            </View>
          ) : (
            displayDisputes.map(d => <WinCard key={d.id} dispute={d} />)
          )}
        </View>

        {/* Tip */}
        <View style={s.tipCard}>
          <Text style={s.tipIcon}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.tipTitle}>Pro tip</Text>
            <Text style={s.tipText}>Medical bills have the highest dispute success rate — 78% of patients who dispute receive a reduction.</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 20 },

  heroCard: { backgroundColor: BLUE, borderRadius: 20, padding: 20, marginBottom: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroVal: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroDiv: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },

  badgesRow: { marginBottom: 16 },
  badges: { gap: 8, paddingRight: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  badgeIcon: { fontSize: 14 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  chartTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 16 },
  chart: { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 4 },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  legendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
  legendText: { fontSize: 11, color: '#9CA3AF' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  statBig: { fontSize: 24, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' },

  section: { marginBottom: 20 },
  tabRow: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#111827' },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#6B7280', textAlign: 'center' },

  tipCard: { backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: '#BFDBFE' },
  tipIcon: { fontSize: 18 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#1E40AF', marginBottom: 2 },
  tipText: { fontSize: 12, color: '#1E40AF', lineHeight: 17 },
});
