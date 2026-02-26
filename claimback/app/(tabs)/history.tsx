import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

type Victory = {
  id: string;
  provider: string;
  amount: number;
  resolvedDate: string;
  daysToResolve: number;
  method: string;
  type: string;
};

const VICTORIES: Victory[] = [
  { id: '1', provider: 'Chase Bank', amount: 35.00, resolvedDate: 'Jan 30, 2025', daysToResolve: 2, method: 'Live Chat', type: 'ATM Fee' },
  { id: '2', provider: 'Verizon Wireless', amount: 184.50, resolvedDate: 'Jan 12, 2025', daysToResolve: 7, method: 'Retention Call', type: 'Overcharge' },
  { id: '3', provider: 'Netflix', amount: 45.96, resolvedDate: 'Dec 22, 2024', daysToResolve: 4, method: 'Email Dispute', type: 'Unauthorized Charges' },
  { id: '4', provider: 'OHSU Billing', amount: 612.00, resolvedDate: 'Dec 10, 2024', daysToResolve: 21, method: 'Patient Advocate', type: 'Coding Error' },
  { id: '5', provider: 'Comcast', amount: 89.99, resolvedDate: 'Nov 28, 2024', daysToResolve: 5, method: 'BBB Complaint', type: 'Rate Increase' },
  { id: '6', provider: 'Wells Fargo', amount: 75.00, resolvedDate: 'Nov 5, 2024', daysToResolve: 3, method: 'Secure Message', type: 'Overdraft Fees' },
  { id: '7', provider: 'Amazon Prime', amount: 139.00, resolvedDate: 'Oct 14, 2024', daysToResolve: 1, method: 'Live Chat', type: 'Accidental Renewal' },
  { id: '8', provider: 'Kaiser Insurance', amount: 425.00, resolvedDate: 'Sep 22, 2024', daysToResolve: 30, method: 'State Insurance Dept', type: 'Claim Denial' },
];

const totalSaved = VICTORIES.reduce((s, v) => s + v.amount, 0);
const avgDays = Math.round(VICTORIES.reduce((s, v) => s + v.daysToResolve, 0) / VICTORIES.length);

const MONTHLY: { month: string; amount: number; count: number }[] = [
  { month: 'Jan', amount: 219.50, count: 2 },
  { month: 'Dec', amount: 657.96, count: 2 },
  { month: 'Nov', amount: 164.99, count: 2 },
  { month: 'Oct', amount: 139.00, count: 1 },
  { month: 'Sep', amount: 425.00, count: 1 },
];
const maxAmount = Math.max(...MONTHLY.map(m => m.amount));

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Win History</Text>
          <Text style={styles.subtitle}>Every dollar recovered</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Recovered</Text>
          <Text style={styles.heroAmount}>${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{VICTORIES.length}</Text>
              <Text style={styles.heroStatLabel}>Won</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{avgDays}d</Text>
              <Text style={styles.heroStatLabel}>Avg. Time</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>100%</Text>
              <Text style={styles.heroStatLabel}>Success Rate</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Monthly Savings</Text>
        <View style={styles.chartCard}>
          {MONTHLY.map(m => (
            <View key={m.month} style={styles.barRow}>
              <Text style={styles.barMonth}>{m.month}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(m.amount / maxAmount) * 100}%` as any }]} />
              </View>
              <Text style={styles.barAmount}>${m.amount.toFixed(0)}</Text>
              <Text style={styles.barCount}>{m.count}W</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Victories</Text>
        {VICTORIES.map((v, idx) => (
          <View key={v.id} style={styles.victoryCard}>
            <View style={styles.victoryLeft}>
              <View style={styles.victoryNum}>
                <Text style={styles.victoryNumText}>{idx + 1}</Text>
              </View>
            </View>
            <View style={styles.victoryContent}>
              <View style={styles.victoryHeader}>
                <Text style={styles.victoryProvider}>{v.provider}</Text>
                <Text style={styles.victoryAmount}>+${v.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>
              <Text style={styles.victoryType}>{v.type}</Text>
              <View style={styles.victoryMeta}>
                <Text style={styles.victoryMetaText}>{v.resolvedDate}</Text>
                <Text style={styles.victoryMetaDot}>·</Text>
                <Text style={styles.victoryMetaText}>{v.daysToResolve} day{v.daysToResolve !== 1 ? 's' : ''}</Text>
                <Text style={styles.victoryMetaDot}>·</Text>
                <Text style={styles.victoryMethod}>{v.method}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            💪 You've recovered ${totalSaved.toFixed(2)} so far. Keep going — the average American overpays $1,200/year in disputable charges.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#F1F5F9', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#475569', marginTop: 2 },
  heroCard: { backgroundColor: '#131921', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#0E2030' },
  heroLabel: { fontSize: 12, color: '#475569', marginBottom: 6 },
  heroAmount: { fontSize: 36, fontWeight: '900', color: '#22D3EE', marginBottom: 16 },
  heroStats: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  heroStat: {},
  heroStatNum: { fontSize: 22, fontWeight: '800', color: '#F1F5F9' },
  heroStatLabel: { fontSize: 11, color: '#475569', marginTop: 2 },
  heroStatDiv: { width: 1, height: 32, backgroundColor: '#1E293B' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F1F5F9', marginBottom: 12 },
  chartCard: { backgroundColor: '#131921', borderRadius: 16, padding: 16, marginBottom: 20, gap: 12, borderWidth: 1, borderColor: '#1E293B' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barMonth: { width: 28, fontSize: 12, color: '#64748B', fontWeight: '600' },
  barTrack: { flex: 1, height: 8, backgroundColor: '#1E293B', borderRadius: 4 },
  barFill: { height: 8, backgroundColor: '#22D3EE', borderRadius: 4 },
  barAmount: { width: 50, fontSize: 12, color: '#94A3B8', textAlign: 'right', fontWeight: '700' },
  barCount: { width: 24, fontSize: 11, color: '#475569' },
  victoryCard: { backgroundColor: '#131921', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', gap: 12, borderWidth: 1, borderLeftWidth: 3, borderLeftColor: '#22D3EE', borderTopColor: '#1E293B', borderRightColor: '#1E293B', borderBottomColor: '#1E293B' },
  victoryLeft: {},
  victoryNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0C1A2A', alignItems: 'center', justifyContent: 'center' },
  victoryNumText: { fontSize: 12, fontWeight: '800', color: '#22D3EE' },
  victoryContent: { flex: 1 },
  victoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  victoryProvider: { fontSize: 14, fontWeight: '700', color: '#F1F5F9', flex: 1 },
  victoryAmount: { fontSize: 15, fontWeight: '800', color: '#34D399' },
  victoryType: { fontSize: 11, color: '#22D3EE', fontWeight: '600', marginBottom: 4 },
  victoryMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  victoryMetaText: { fontSize: 11, color: '#475569' },
  victoryMetaDot: { color: '#334155', fontSize: 10 },
  victoryMethod: { fontSize: 11, color: '#64748B', fontStyle: 'italic' },
  motivationCard: { backgroundColor: '#0C1A2A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#0E2030', marginTop: 4 },
  motivationText: { fontSize: 13, color: '#94A3B8', lineHeight: 20, textAlign: 'center' },
});
