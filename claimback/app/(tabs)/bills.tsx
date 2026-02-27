import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

type Bill = {
  id: string;
  provider: string;
  type: 'medical' | 'utility' | 'subscription' | 'insurance' | 'credit';
  amount: number;
  dueDate: string;
  status: 'disputable' | 'paid' | 'pending' | 'overdue';
  aiFlag?: string;
  date: string;
};

const BILLS: Bill[] = [
  { id: '1', provider: 'Providence Health', type: 'medical', amount: 847.00, dueDate: 'Mar 15', status: 'disputable', aiFlag: 'Possible duplicate charge — billed twice for ER visit on Jan 3.', date: 'Jan 15, 2025' },
  { id: '2', provider: 'Comcast Xfinity', type: 'utility', amount: 189.99, dueDate: 'Mar 22', status: 'disputable', aiFlag: 'Rate increased 34% without notice. Eligible for retention discount.', date: 'Feb 20, 2025' },
  { id: '3', provider: 'OHSU Medical Group', type: 'medical', amount: 2340.00, dueDate: 'Apr 1', status: 'pending', aiFlag: 'Verify insurance processed correctly. EOB mismatch detected.', date: 'Feb 5, 2025' },
  { id: '4', provider: 'Adobe Creative Cloud', type: 'subscription', amount: 89.99, dueDate: 'Mar 10', status: 'disputable', aiFlag: 'Subscribed to annual plan but being billed monthly rate.', date: 'Mar 1, 2025' },
  { id: '5', provider: 'Portland General Electric', type: 'utility', amount: 312.44, dueDate: 'Mar 18', status: 'pending', date: 'Mar 1, 2025' },
  { id: '6', provider: 'Chase Visa', type: 'credit', amount: 4200.00, dueDate: 'Mar 25', status: 'pending', date: 'Mar 1, 2025' },
  { id: '7', provider: 'Regence BlueCross', type: 'insurance', amount: 1420.00, dueDate: 'Mar 1', status: 'overdue', aiFlag: 'Premium increased without 30-day advance notice required by Oregon law.', date: 'Feb 28, 2025' },
  { id: '8', provider: 'Planet Fitness', type: 'subscription', amount: 24.99, dueDate: 'Paid', status: 'paid', date: 'Feb 15, 2025' },
];

const STATUS_CONFIG = {
  disputable: { label: '⚡ Disputable', bg: '#0C1A2A', text: '#22D3EE', border: '#0E2030' },
  pending: { label: 'Pending', bg: '#131921', text: '#94A3B8', border: '#1A2332' },
  overdue: { label: '⚠️ Overdue', bg: '#1A0A0A', text: '#F87171', border: '#2A1010' },
  paid: { label: '✓ Paid', bg: '#091410', text: '#34D399', border: '#0E2018' },
};

const TYPE_EMOJIS: Record<string, string> = { medical: '🏥', utility: '⚡', subscription: '📱', insurance: '🛡️', credit: '💳' };
const FILTERS = ['All', 'Disputable', 'Medical', 'Utilities', 'Subscriptions'];

export default function BillsScreen() {
  const [filter, setFilter] = useState('All');

  const filtered = BILLS.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Disputable') return b.status === 'disputable';
    if (filter === 'Medical') return b.type === 'medical';
    if (filter === 'Utilities') return b.type === 'utility';
    if (filter === 'Subscriptions') return b.type === 'subscription';
    return true;
  });

  const disputableTotal = BILLS.filter(b => b.status === 'disputable').reduce((s, b) => s + b.amount, 0);
  const disputableCount = BILLS.filter(b => b.status === 'disputable').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bills</Text>
          <Text style={styles.subtitle}>AI-scanned for overcharges</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>Potentially Recoverable</Text>
            <Text style={styles.heroAmount}>${disputableTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
            <Text style={styles.heroSub}>{disputableCount} bills flagged by AI</Text>
          </View>
          <TouchableOpacity style={styles.disputeAllBtn}>
            <Text style={styles.disputeAllBtnText}>Dispute All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, filter === f && styles.filterPillActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.map(bill => {
          const sc = STATUS_CONFIG[bill.status];
          return (
            <View key={bill.id} style={[styles.billCard, { borderColor: sc.border }]}>
              <View style={styles.billTop}>
                <View style={styles.billLeft}>
                  <Text style={styles.billEmoji}>{TYPE_EMOJIS[bill.type]}</Text>
                  <View>
                    <Text style={styles.billProvider}>{bill.provider}</Text>
                    <Text style={styles.billDate}>{bill.date}</Text>
                  </View>
                </View>
                <View style={styles.billRight}>
                  <Text style={styles.billAmount}>${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                  <Text style={styles.billDue}>Due {bill.dueDate}</Text>
                </View>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
              </View>

              {bill.aiFlag && (
                <View style={styles.aiFlag}>
                  <Text style={styles.aiFlagIcon}>🤖</Text>
                  <Text style={styles.aiFlagText}>{bill.aiFlag}</Text>
                </View>
              )}

              {bill.status === 'disputable' && (
                <TouchableOpacity style={styles.disputeBtn}>
                  <Text style={styles.disputeBtnText}>Start Dispute →</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <TouchableOpacity style={styles.addBillBtn}>
          <Text style={styles.addBillText}>+ Upload Bill or Statement</Text>
        </TouchableOpacity>
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
  heroCard: { backgroundColor: '#131921', borderRadius: 20, padding: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#0E2030' },
  heroLeft: {},
  heroLabel: { fontSize: 12, color: '#475569', marginBottom: 4 },
  heroAmount: { fontSize: 30, fontWeight: '900', color: '#22D3EE', marginBottom: 4 },
  heroSub: { fontSize: 12, color: '#64748B' },
  disputeAllBtn: { backgroundColor: '#22D3EE', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  disputeAllBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 13 },
  filterScroll: { marginBottom: 16 },
  filterPill: { backgroundColor: '#1E293B', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  filterPillActive: { backgroundColor: '#22D3EE', borderColor: '#22D3EE' },
  filterText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#0F172A' },
  billCard: { backgroundColor: '#131921', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1 },
  billTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  billLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  billEmoji: { fontSize: 24 },
  billProvider: { fontSize: 14, fontWeight: '700', color: '#F1F5F9', marginBottom: 2 },
  billDate: { fontSize: 11, color: '#475569' },
  billRight: { alignItems: 'flex-end' },
  billAmount: { fontSize: 18, fontWeight: '800', color: '#F1F5F9', marginBottom: 2 },
  billDue: { fontSize: 11, color: '#64748B' },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  aiFlag: { backgroundColor: '#0C1525', borderRadius: 10, padding: 10, flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 10, borderWidth: 1, borderColor: '#1E3045' },
  aiFlagIcon: { fontSize: 14 },
  aiFlagText: { flex: 1, fontSize: 12, color: '#94A3B8', lineHeight: 17 },
  disputeBtn: { backgroundColor: '#22D3EE', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  disputeBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 13 },
  addBillBtn: { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#22D3EE', borderStyle: 'dashed', marginTop: 4 },
  addBillText: { color: '#22D3EE', fontWeight: '700', fontSize: 14 },
});
