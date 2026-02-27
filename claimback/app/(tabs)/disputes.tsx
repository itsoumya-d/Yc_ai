import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useClaimsStore, Dispute, DisputeStatus } from '../../store/claims-store';

const BLUE = '#2563EB';
const GREEN = '#10B981';
const ORANGE = '#F97316';
const BG = '#FAFBFC';

const STATUS_CONFIG: Record<DisputeStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { label: 'Pending', color: ORANGE, icon: 'time-outline' },
  submitted: { label: 'Submitted', color: BLUE, icon: 'send-outline' },
  in_review: { label: 'In Review', color: '#7C3AED', icon: 'search-outline' },
  resolved: { label: 'Resolved ✓', color: GREEN, icon: 'checkmark-circle-outline' },
  rejected: { label: 'Rejected', color: '#EF4444', icon: 'close-circle-outline' },
};

function Timeline({ events }: { events: Dispute['timeline'] }) {
  return (
    <View style={tl.wrap}>
      {events.map((ev, i) => (
        <View key={i} style={tl.row}>
          <View style={tl.left}>
            <View style={[tl.dot, i === events.length - 1 && tl.dotActive]} />
            {i < events.length - 1 && <View style={tl.line} />}
          </View>
          <View style={tl.content}>
            <Text style={tl.date}>{ev.date}</Text>
            <Text style={tl.event}>{ev.event}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const tl = StyleSheet.create({
  wrap: { gap: 0 },
  row: { flexDirection: 'row', gap: 12 },
  left: { width: 16, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D1D5DB', marginTop: 4 },
  dotActive: { backgroundColor: BLUE },
  line: { flex: 1, width: 2, backgroundColor: '#E5E7EB', marginVertical: 2 },
  content: { flex: 1, paddingBottom: 14 },
  date: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 2 },
  event: { fontSize: 13, color: '#374151', lineHeight: 18 },
});

function DisputeCard({ dispute }: { dispute: Dispute }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[dispute.status];

  return (
    <TouchableOpacity style={dc.card} onPress={() => setExpanded(!expanded)} activeOpacity={0.9}>
      <View style={dc.top}>
        <View style={{ flex: 1 }}>
          <Text style={dc.provider}>{dispute.provider}</Text>
          <Text style={dc.ref}>Ref: {dispute.referenceNumber}</Text>
        </View>
        <View style={[dc.statusBadge, { backgroundColor: `${config.color}15`, borderColor: config.color }]}>
          <Ionicons name={config.icon} size={12} color={config.color} />
          <Text style={[dc.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <View style={dc.amtRow}>
        <View>
          <Text style={dc.amtLabel}>Disputed Amount</Text>
          <Text style={[dc.amt, dispute.status === 'resolved' && { color: GREEN }]}>
            {dispute.status === 'resolved' ? '+' : '-'}${dispute.amount.toFixed(2)}
          </Text>
        </View>
        {dispute.resolvedAmount && (
          <View style={dc.resolved}>
            <Text style={dc.resolvedLabel}>Refunded</Text>
            <Text style={dc.resolvedAmt}>+${dispute.resolvedAmount.toFixed(2)}</Text>
          </View>
        )}
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#9CA3AF" />
      </View>

      {expanded && (
        <View style={dc.timeline}>
          <Text style={dc.timelineTitle}>Timeline</Text>
          <Timeline events={dispute.timeline} />
          {dispute.status === 'pending' && (
            <TouchableOpacity style={dc.sendBtn} onPress={() => Alert.alert('Send Dispute', 'Dispute letter will be sent to the provider.')}>
              <Ionicons name="send-outline" size={16} color="#fff" />
              <Text style={dc.sendBtnText}>Send Dispute Letter</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const dc = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  provider: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  ref: { fontSize: 12, color: '#9CA3AF' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },
  amtRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amtLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  amt: { fontSize: 26, fontWeight: '800', color: '#111827' },
  resolved: { alignItems: 'flex-end' },
  resolvedLabel: { fontSize: 12, color: GREEN },
  resolvedAmt: { fontSize: 22, fontWeight: '800', color: GREEN },
  timeline: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 12 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: BLUE, borderRadius: 12, padding: 14, justifyContent: 'center', marginTop: 8 },
  sendBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default function DisputesScreen() {
  const { disputes, totalSavings, activelySaving } = useClaimsStore();
  const router = useRouter();

  const statusGroups = {
    active: disputes.filter(d => ['pending', 'submitted', 'in_review'].includes(d.status)),
    resolved: disputes.filter(d => d.status === 'resolved'),
    rejected: disputes.filter(d => d.status === 'rejected'),
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>My Disputes</Text>
        <Text style={s.sub}>{disputes.length} total · ${totalSavings.toFixed(2)} recovered</Text>
      </View>

      {/* Stats bar */}
      <View style={s.statsBar}>
        <View style={s.stat}>
          <Text style={s.statVal}>{statusGroups.active.length}</Text>
          <Text style={s.statLabel}>Active</Text>
        </View>
        <View style={s.statDiv} />
        <View style={s.stat}>
          <Text style={[s.statVal, { color: GREEN }]}>${totalSavings.toFixed(0)}</Text>
          <Text style={s.statLabel}>Recovered</Text>
        </View>
        <View style={s.statDiv} />
        <View style={s.stat}>
          <Text style={[s.statVal, { color: ORANGE }]}>${activelySaving.toFixed(0)}</Text>
          <Text style={s.statLabel}>In Dispute</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {statusGroups.active.length > 0 && (
          <View style={s.group}>
            <Text style={s.groupTitle}>🔥 Active Disputes</Text>
            {statusGroups.active.map(d => <DisputeCard key={d.id} dispute={d} />)}
          </View>
        )}

        {statusGroups.resolved.length > 0 && (
          <View style={s.group}>
            <Text style={[s.groupTitle, { color: GREEN }]}>✅ Resolved</Text>
            {statusGroups.resolved.map(d => <DisputeCard key={d.id} dispute={d} />)}
          </View>
        )}

        {statusGroups.rejected.length > 0 && (
          <View style={s.group}>
            <Text style={[s.groupTitle, { color: '#EF4444' }]}>❌ Rejected</Text>
            {statusGroups.rejected.map(d => <DisputeCard key={d.id} dispute={d} />)}
          </View>
        )}

        {disputes.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🛡️</Text>
            <Text style={s.emptyTitle}>No disputes yet</Text>
            <Text style={s.emptySub}>Scan a bill to find overcharges and start your first dispute.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/(tabs)/scan')}>
              <Text style={s.emptyBtnText}>Scan a Bill</Text>
            </TouchableOpacity>
          </View>
        )}

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
  statsBar: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statDiv: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
  scroll: { flex: 1 },
  content: { padding: 20 },
  group: { marginBottom: 24 },
  groupTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, paddingHorizontal: 32 },
  emptyBtn: { backgroundColor: BLUE, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
