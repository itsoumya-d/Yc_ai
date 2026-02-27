import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const SAVINGS = [
  { id: '1', bill: 'Medical Bill - ER Visit', saved: 847, status: 'won', date: '2025-01-15', error: 'Duplicate charge for blood panel' },
  { id: '2', bill: 'AT&T Phone Bill', saved: 45, status: 'won', date: '2025-01-08', error: 'Unauthorized premium service charge' },
  { id: '3', bill: 'Bank Overdraft Fees', saved: 105, status: 'pending', date: '2025-01-20', error: '3 overdraft fees during grace period' },
  { id: '4', bill: 'Insurance Premium', saved: 320, status: 'negotiating', date: '2025-01-22', error: 'Rate increase without disclosure' },
];

export default function DashboardScreen() {
  const totalSaved = SAVINGS.filter(s => s.status === 'won').reduce((a, s) => a + s.saved, 0);
  const pending = SAVINGS.filter(s => s.status !== 'won').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero savings card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Recovered</Text>
          <Text style={styles.heroAmount}>${totalSaved.toLocaleString()}</Text>
          <Text style={styles.heroSub}>{pending} disputes in progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statValue}>{SAVINGS.filter(s=>s.status==='won').length}</Text><Text style={styles.statLabel}>Won</Text></View>
            <View style={styles.statDiv} />
            <View style={styles.stat}><Text style={styles.statValue}>78%</Text><Text style={styles.statLabel}>Win Rate</Text></View>
            <View style={styles.statDiv} />
            <View style={styles.stat}><Text style={styles.statValue}>12d</Text><Text style={styles.statLabel}>Avg. Time</Text></View>
          </View>
        </View>

        {/* Scan button */}
        <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/scan')}>
          <Text style={styles.scanIcon}>📷</Text>
          <View>
            <Text style={styles.scanTitle}>Scan a Bill</Text>
            <Text style={styles.scanDesc}>AI analyzes for errors & overcharges</Text>
          </View>
          <Text style={styles.scanArrow}>→</Text>
        </TouchableOpacity>

        {/* Active disputes */}
        <Text style={styles.sectionTitle}>Active Disputes</Text>
        {SAVINGS.map((s) => (
          <TouchableOpacity key={s.id} style={styles.disputeCard} onPress={() => router.push(`/dispute/${s.id}`)}>
            <View style={styles.disputeHeader}>
              <Text style={styles.disputeName}>{s.bill}</Text>
              <View style={[styles.badge, s.status === 'won' ? styles.badgeWon : s.status === 'pending' ? styles.badgePending : styles.badgeNeg]}>
                <Text style={[styles.badgeText, s.status === 'won' ? styles.badgeTextWon : s.status === 'pending' ? styles.badgeTextPending : styles.badgeTextNeg]}>
                  {s.status === 'won' ? '✓ Won' : s.status === 'pending' ? '⏳ Pending' : '💬 Negotiating'}
                </Text>
              </View>
            </View>
            <Text style={styles.disputeError}>"{s.error}"</Text>
            <Text style={[styles.disputeAmount, s.status === 'won' ? styles.amountWon : styles.amountPending]}>
              {s.status === 'won' ? `+$${s.saved} recovered` : `$${s.saved} at stake`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 16, paddingBottom: 40 },
  heroCard: { backgroundColor: '#22D3EE', borderRadius: 20, padding: 20, marginBottom: 16 },
  heroLabel: { color: 'rgba(0,0,0,0.6)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroAmount: { color: '#0F172A', fontSize: 48, fontWeight: '900', letterSpacing: -2, marginVertical: 4 },
  heroSub: { color: 'rgba(0,0,0,0.5)', fontSize: 14, marginBottom: 16 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 12, padding: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 11, color: 'rgba(0,0,0,0.5)' },
  statDiv: { width: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  scanBtn: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  scanIcon: { fontSize: 28 },
  scanTitle: { color: '#F1F5F9', fontSize: 15, fontWeight: '700' },
  scanDesc: { color: '#475569', fontSize: 13 },
  scanArrow: { color: '#22D3EE', fontSize: 20, marginLeft: 'auto' },
  sectionTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  disputeCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 10 },
  disputeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  disputeName: { color: '#F1F5F9', fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  badge: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 },
  badgeWon: { backgroundColor: '#DCFCE7' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeNeg: { backgroundColor: '#EFF6FF' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextWon: { color: '#16A34A' },
  badgeTextPending: { color: '#D97706' },
  badgeTextNeg: { color: '#2563EB' },
  disputeError: { color: '#94A3B8', fontSize: 13, fontStyle: 'italic', marginBottom: 8 },
  disputeAmount: { fontSize: 15, fontWeight: '800' },
  amountWon: { color: '#22D3EE' },
  amountPending: { color: '#F59E0B' },
});
