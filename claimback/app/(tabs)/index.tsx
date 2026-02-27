import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClaimsStore } from '../../store/claims-store';

const BLUE = '#2563EB';
const GREEN = '#10B981';
const ORANGE = '#F97316';
const BG = '#FAFBFC';

function SavingsCounter({ amount }: { amount: number }) {
  return (
    <View style={sc.wrap}>
      <Text style={sc.label}>Total Saved</Text>
      <Text style={sc.amount}>${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
      <Text style={sc.sub}>across all disputes</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  wrap: { alignItems: 'center' },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  amount: { fontSize: 52, fontWeight: '800', color: '#FFFFFF', lineHeight: 60, marginVertical: 4 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
});

export default function HomeScreen() {
  const { bills, disputes, totalSavings, activelySaving } = useClaimsStore();
  const router = useRouter();

  const recentDisputes = disputes.slice(0, 3);
  const pendingBills = bills.filter(b => !disputes.find(d => d.billId === b.id));

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {/* Header Hero */}
        <View style={s.hero}>
          <View style={s.heroHeader}>
            <View>
              <Text style={s.heroTitle}>Claimback</Text>
              <Text style={s.heroSub}>Fight overcharges. Win refunds.</Text>
            </View>
            <TouchableOpacity style={s.scanBtn} onPress={() => router.push('/(tabs)/scan')}>
              <Ionicons name="camera" size={22} color="#fff" />
              <Text style={s.scanBtnText}>Scan Bill</Text>
            </TouchableOpacity>
          </View>
          <SavingsCounter amount={totalSavings} />
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>${activelySaving.toFixed(0)}</Text>
              <Text style={s.heroStatLabel}>In Dispute</Text>
            </View>
            <View style={s.heroStatDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>{disputes.length}</Text>
              <Text style={s.heroStatLabel}>Cases</Text>
            </View>
            <View style={s.heroStatDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>{disputes.filter(d => d.status === 'resolved').length}</Text>
              <Text style={s.heroStatLabel}>Won</Text>
            </View>
          </View>
        </View>

        {/* Pending Bills */}
        {pendingBills.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Bills to Review</Text>
            {pendingBills.map((bill) => (
              <TouchableOpacity key={bill.id} style={s.billCard} onPress={() => router.push(`/bill/${bill.id}` as any)}>
                <View style={s.billLeft}>
                  <View style={[s.billIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={s.billIconText}>{bill.type === 'medical' ? '🏥' : bill.type === 'telecom' ? '📱' : bill.type === 'insurance' ? '🛡️' : '📄'}</Text>
                  </View>
                  <View>
                    <Text style={s.billProvider}>{bill.provider}</Text>
                    <Text style={s.billAmount}>${bill.amount.toFixed(2)}</Text>
                  </View>
                </View>
                <View style={s.billRight}>
                  <View style={[s.overchargeBadge, { backgroundColor: '#FEF2F2' }]}>
                    <Text style={[s.overchargeText, { color: '#DC2626' }]}>-${bill.totalOvercharge.toFixed(0)} overcharge</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginTop: 4 }} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Disputes */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent Disputes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/disputes')}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentDisputes.map((dispute) => {
            const statusConfig = {
              pending: { color: ORANGE, label: 'Pending', icon: 'time-outline' },
              submitted: { color: BLUE, label: 'Submitted', icon: 'send-outline' },
              in_review: { color: '#7C3AED', label: 'In Review', icon: 'search-outline' },
              resolved: { color: GREEN, label: 'Resolved ✓', icon: 'checkmark-circle-outline' },
              rejected: { color: '#EF4444', label: 'Rejected', icon: 'close-circle-outline' },
            }[dispute.status];

            return (
              <TouchableOpacity key={dispute.id} style={s.disputeCard} onPress={() => router.push(`/dispute/${dispute.id}` as any)}>
                <View style={s.disputeTop}>
                  <Text style={s.disputeProvider}>{dispute.provider}</Text>
                  <View style={[s.statusBadge, { backgroundColor: `${statusConfig.color}15`, borderColor: statusConfig.color }]}>
                    <Text style={[s.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                  </View>
                </View>
                <View style={s.disputeBottom}>
                  <Text style={[s.disputeAmt, dispute.status === 'resolved' ? { color: GREEN } : {}]}>
                    {dispute.status === 'resolved' ? '+' : ''}${dispute.resolvedAmount?.toFixed(2) ?? dispute.amount.toFixed(2)}
                  </Text>
                  <Text style={s.disputeRef}>Ref: {dispute.referenceNumber}</Text>
                </View>
                {dispute.status !== 'pending' && (
                  <View style={s.disputeProgress}>
                    {['submitted', 'in_review', 'resolved'].map((step, i) => {
                      const stepIndex = ['submitted', 'in_review', 'resolved'].indexOf(dispute.status);
                      const active = i <= stepIndex && dispute.status !== 'rejected';
                      return (
                        <React.Fragment key={step}>
                          <View style={[s.progressDot, active && { backgroundColor: statusConfig.color }]} />
                          {i < 2 && <View style={[s.progressLine, active && i < stepIndex && { backgroundColor: statusConfig.color }]} />}
                        </React.Fragment>
                      );
                    })}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Scan CTA */}
        <TouchableOpacity style={s.ctaCard} onPress={() => router.push('/(tabs)/scan')}>
          <Text style={s.ctaIcon}>📄</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.ctaTitle}>Got a new bill?</Text>
            <Text style={s.ctaSub}>Scan it and we'll find hidden overcharges in seconds.</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color={BLUE} />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { paddingBottom: 24 },
  hero: { background: BLUE, backgroundColor: BLUE, margin: 0, padding: 24, paddingTop: 32, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 24 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  scanBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 16, padding: 16, marginTop: 24 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 14 },
  seeAll: { fontSize: 14, color: BLUE, fontWeight: '600' },
  billCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  billLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  billIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  billIconText: { fontSize: 22 },
  billProvider: { fontSize: 15, fontWeight: '700', color: '#111827' },
  billAmount: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  billRight: { alignItems: 'flex-end' },
  overchargeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FCA5A5' },
  overchargeText: { fontSize: 13, fontWeight: '700' },
  disputeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  disputeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  disputeProvider: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },
  disputeBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  disputeAmt: { fontSize: 22, fontWeight: '800', color: '#111827' },
  disputeRef: { fontSize: 12, color: '#9CA3AF' },
  disputeProgress: { flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB' },
  progressLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 2 },
  ctaCard: { marginHorizontal: 20, backgroundColor: '#EFF6FF', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  ctaIcon: { fontSize: 32 },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: '#1E3A8A' },
  ctaSub: { fontSize: 13, color: '#3B82F6', marginTop: 2 },
});
