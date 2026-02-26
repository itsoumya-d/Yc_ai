import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

type Dispute = {
  id: string;
  provider: string;
  amount: number;
  stage: 'drafting' | 'sent' | 'in-review' | 'won' | 'lost' | 'escalated';
  aiDraftReady: boolean;
  submittedDate?: string;
  responseDeadline?: string;
  lastActivity: string;
  channel: string;
  notes: string;
};

const DISPUTES: Dispute[] = [
  { id: '1', provider: 'Providence Health — ER Duplicate', amount: 847.00, stage: 'drafting', aiDraftReady: true, lastActivity: 'Today', channel: 'Certified Mail', notes: 'AI identified duplicate line item. Letter ready to send.' },
  { id: '2', provider: 'Regence BlueCross — Premium Hike', amount: 1420.00, stage: 'sent', aiDraftReady: true, submittedDate: 'Mar 1, 2025', responseDeadline: 'Mar 31, 2025', lastActivity: '3 days ago', channel: 'Secure Portal', notes: 'Dispute submitted. Awaiting adjuster response.' },
  { id: '3', provider: 'Comcast — Undisclosed Rate Increase', amount: 189.99, stage: 'in-review', aiDraftReady: false, submittedDate: 'Feb 20, 2025', responseDeadline: 'Mar 20, 2025', lastActivity: '1 week ago', channel: 'Customer Retention', notes: 'Escalated to retention team. AI monitoring for response.' },
  { id: '4', provider: 'Adobe — Wrong Billing Tier', amount: 89.99, stage: 'escalated', aiDraftReady: true, submittedDate: 'Feb 10, 2025', lastActivity: '2 days ago', channel: 'CFPB Complaint', notes: 'Filed CFPB complaint. Company has 15 days to respond.' },
  { id: '5', provider: 'Chase — ATM Fee Refund', amount: 35.00, stage: 'won', submittedDate: 'Jan 22, 2025', aiDraftReady: false, lastActivity: 'Jan 30, 2025', channel: 'Live Chat', notes: 'Won! $35 credited to account within 3 business days.' },
  { id: '6', provider: 'OHSU — Coding Error', amount: 2340.00, stage: 'in-review', aiDraftReady: true, submittedDate: 'Feb 28, 2025', responseDeadline: 'Mar 28, 2025', lastActivity: '5 days ago', channel: 'Patient Advocate', notes: 'EOB mismatch referred to patient advocate office.' },
];

const STAGES: { key: Dispute['stage']; label: string; color: string; bg: string }[] = [
  { key: 'drafting', label: 'Drafting', color: '#94A3B8', bg: '#1E293B' },
  { key: 'sent', label: 'Sent', color: '#60A5FA', bg: '#0C1A30' },
  { key: 'in-review', label: 'In Review', color: '#FBBF24', bg: '#1C1810' },
  { key: 'escalated', label: 'Escalated', color: '#F87171', bg: '#1A0F0F' },
  { key: 'won', label: 'Won ✓', color: '#34D399', bg: '#091410' },
  { key: 'lost', label: 'Lost', color: '#6B7280', bg: '#1A1A1A' },
];

export default function DisputesScreen() {
  const [stageFilter, setStageFilter] = useState<string>('all');

  const filtered = stageFilter === 'all' ? DISPUTES : DISPUTES.filter(d => d.stage === stageFilter);
  const totalAtStake = DISPUTES.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((s, d) => s + d.amount, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Active Disputes</Text>
          <Text style={styles.subtitle}>{DISPUTES.filter(d => !['won', 'lost'].includes(d.stage)).length} disputes in progress</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statAmount}>${totalAtStake.toLocaleString('en-US', { minimumFractionDigits: 0 })}</Text>
            <Text style={styles.statLabel}>At Stake</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statAmount, { color: '#34D399' }]}>{DISPUTES.filter(d => d.stage === 'won').length}</Text>
            <Text style={styles.statLabel}>Won</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statAmount, { color: '#22D3EE' }]}>{DISPUTES.filter(d => d.aiDraftReady).length}</Text>
            <Text style={styles.statLabel}>AI Ready</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageScroll}>
          <TouchableOpacity
            style={[styles.stagePill, stageFilter === 'all' && styles.stagePillActive]}
            onPress={() => setStageFilter('all')}
          >
            <Text style={[styles.stagePillText, stageFilter === 'all' && styles.stagePillTextActive]}>All</Text>
          </TouchableOpacity>
          {STAGES.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.stagePill, stageFilter === s.key && { backgroundColor: s.bg, borderColor: s.color }]}
              onPress={() => setStageFilter(s.key)}
            >
              <Text style={[styles.stagePillText, stageFilter === s.key && { color: s.color }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.map(dispute => {
          const stage = STAGES.find(s => s.key === dispute.stage)!;
          return (
            <View key={dispute.id} style={[styles.disputeCard, { borderLeftColor: stage.color }]}>
              <View style={styles.disputeHeader}>
                <View style={styles.disputeLeft}>
                  <Text style={styles.disputeProvider}>{dispute.provider}</Text>
                  <Text style={styles.disputeChannel}>{dispute.channel}</Text>
                </View>
                <View style={styles.disputeRight}>
                  <Text style={[styles.disputeAmount, dispute.stage === 'won' && { color: '#34D399' }]}>
                    {dispute.stage === 'won' ? '+' : ''}${dispute.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                  <View style={[styles.stageBadge, { backgroundColor: stage.bg }]}>
                    <Text style={[styles.stageBadgeText, { color: stage.color }]}>{stage.label}</Text>
                  </View>
                </View>
              </View>

              {dispute.responseDeadline && (
                <View style={styles.deadlineRow}>
                  <Text style={styles.deadlineLabel}>Response deadline:</Text>
                  <Text style={styles.deadlineDate}>{dispute.responseDeadline}</Text>
                </View>
              )}

              <Text style={styles.disputeNotes}>{dispute.notes}</Text>
              <Text style={styles.disputeActivity}>Last activity: {dispute.lastActivity}</Text>

              <View style={styles.disputeActions}>
                {dispute.aiDraftReady && dispute.stage === 'drafting' && (
                  <TouchableOpacity style={styles.actionBtnPrimary}>
                    <Text style={styles.actionBtnPrimaryText}>🤖 Review AI Letter</Text>
                  </TouchableOpacity>
                )}
                {dispute.stage !== 'won' && dispute.stage !== 'lost' && dispute.stage !== 'drafting' && (
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>View Details</Text>
                  </TouchableOpacity>
                )}
                {dispute.stage === 'in-review' && (
                  <TouchableOpacity style={styles.actionBtnEscalate}>
                    <Text style={styles.actionBtnEscalateText}>Escalate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

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
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  statAmount: { fontSize: 20, fontWeight: '900', color: '#22D3EE', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#64748B' },
  stageScroll: { marginBottom: 16 },
  stagePill: { backgroundColor: '#1E293B', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  stagePillActive: { backgroundColor: '#0C1A2A', borderColor: '#22D3EE' },
  stagePillText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  stagePillTextActive: { color: '#22D3EE' },
  disputeCard: { backgroundColor: '#131921', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderTopColor: '#1E293B', borderRightColor: '#1E293B', borderBottomColor: '#1E293B' },
  disputeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  disputeLeft: { flex: 1 },
  disputeProvider: { fontSize: 14, fontWeight: '700', color: '#F1F5F9', marginBottom: 3 },
  disputeChannel: { fontSize: 11, color: '#475569' },
  disputeRight: { alignItems: 'flex-end', gap: 6 },
  disputeAmount: { fontSize: 18, fontWeight: '800', color: '#22D3EE' },
  stageBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  stageBadgeText: { fontSize: 10, fontWeight: '700' },
  deadlineRow: { flexDirection: 'row', gap: 6, marginBottom: 8, backgroundColor: '#1A1205', borderRadius: 8, padding: 8 },
  deadlineLabel: { fontSize: 12, color: '#78716C' },
  deadlineDate: { fontSize: 12, color: '#FBBF24', fontWeight: '700' },
  disputeNotes: { fontSize: 13, color: '#94A3B8', lineHeight: 17, marginBottom: 6 },
  disputeActivity: { fontSize: 11, color: '#475569', marginBottom: 12 },
  disputeActions: { flexDirection: 'row', gap: 8 },
  actionBtnPrimary: { flex: 1, backgroundColor: '#22D3EE', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionBtnPrimaryText: { color: '#0F172A', fontWeight: '800', fontSize: 13 },
  actionBtn: { flex: 1, backgroundColor: '#1E293B', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  actionBtnText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  actionBtnEscalate: { flex: 1, backgroundColor: '#1A0F0F', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F87171' },
  actionBtnEscalateText: { color: '#F87171', fontWeight: '700', fontSize: 13 },
});
