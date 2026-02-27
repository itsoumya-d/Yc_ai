import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

type VaultDoc = {
  id: string;
  name: string;
  type: 'legal' | 'insurance' | 'medical' | 'financial' | 'personal';
  emoji: string;
  status: 'complete' | 'needs-update' | 'missing';
  lastUpdated?: string;
  attorney?: string;
  notes: string;
  urgency: 'critical' | 'important' | 'optional';
};

const VAULT_DOCS: VaultDoc[] = [
  { id: '1', name: 'Last Will & Testament', type: 'legal', emoji: '📜', status: 'complete', lastUpdated: 'Nov 12, 2024', attorney: 'James R. Whitfield', notes: 'Original with attorney. Copies in fireproof safe and this vault.', urgency: 'critical' },
  { id: '2', name: 'Revocable Living Trust', type: 'legal', emoji: '🔐', status: 'complete', lastUpdated: 'Nov 12, 2024', attorney: 'James R. Whitfield', notes: 'Holds primary residence and investment accounts. Sarah is successor trustee.', urgency: 'critical' },
  { id: '3', name: 'Healthcare Advance Directive', type: 'medical', emoji: '🏥', status: 'complete', lastUpdated: 'Sep 3, 2024', notes: 'Designates Dr. Priya Nair. Do not resuscitate conditions specified.', urgency: 'critical' },
  { id: '4', name: 'POLST Form', type: 'medical', emoji: '📋', status: 'needs-update', lastUpdated: 'Mar 2023', notes: 'Physician Orders for Life-Sustaining Treatment — needs annual review with Dr. Nair.', urgency: 'critical' },
  { id: '5', name: 'Life Insurance Policy', type: 'insurance', emoji: '🛡️', status: 'complete', lastUpdated: 'Jan 2024', notes: 'Northwestern Mutual. Policy #NM-2024-48821. $750K death benefit. Sarah beneficiary.', urgency: 'critical' },
  { id: '6', name: 'Power of Attorney', type: 'legal', emoji: '⚖️', status: 'complete', lastUpdated: 'Nov 12, 2024', attorney: 'James R. Whitfield', notes: 'Durable POA grants Sarah authority for financial and legal decisions.', urgency: 'important' },
  { id: '7', name: 'Digital Legacy Instructions', type: 'personal', emoji: '💻', status: 'complete', lastUpdated: 'Feb 2025', notes: 'Step-by-step guide for Robert Torres (digital executor). Account list and closure instructions.', urgency: 'important' },
  { id: '8', name: 'Safe Deposit Box Key', type: 'personal', emoji: '🗝️', status: 'needs-update', notes: 'Location of physical key not documented. Box at Chase Branch #4421.', urgency: 'important' },
  { id: '9', name: 'Funeral Pre-arrangements', type: 'personal', emoji: '🌿', status: 'missing', notes: 'Not yet documented. Preferences: cremation, no service, family gathering at home.', urgency: 'optional' },
  { id: '10', name: 'Letter to Family', type: 'personal', emoji: '💌', status: 'missing', notes: 'Personal final letter not yet written. Suggested: capture memories, gratitude, wishes.', urgency: 'optional' },
];

const STATUS_CONFIG = {
  complete: { label: 'Complete', bg: '#0F2010', text: '#4ADE80', dot: '#4ADE80' },
  'needs-update': { label: 'Needs Update', bg: '#1C1410', text: '#D97706', dot: '#D97706' },
  missing: { label: 'Missing', bg: '#1A0F0F', text: '#F87171', dot: '#F87171' },
};

const URGENCY_COLORS: Record<string, string> = { critical: '#EF4444', important: '#D97706', optional: '#78716C' };

export default function VaultScreen() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'needs-action'>('all');

  const filtered = VAULT_DOCS.filter(d => {
    if (filter === 'critical') return d.urgency === 'critical';
    if (filter === 'needs-action') return d.status !== 'complete';
    return true;
  });

  const completionPct = Math.round((VAULT_DOCS.filter(d => d.status === 'complete').length / VAULT_DOCS.length) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Document Vault</Text>
          <Text style={styles.subtitle}>Encrypted · AES-256</Text>
        </View>

        <View style={styles.completionCard}>
          <View style={styles.completionLeft}>
            <Text style={styles.completionPct}>{completionPct}%</Text>
            <Text style={styles.completionLabel}>Estate Ready</Text>
          </View>
          <View style={styles.completionRight}>
            <View style={styles.completionBarBg}>
              <View style={[styles.completionBarFill, { width: `${completionPct}%` as any }]} />
            </View>
            <View style={styles.completionStats}>
              <Text style={styles.completionStat}>{VAULT_DOCS.filter(d => d.status === 'complete').length} Complete</Text>
              <Text style={styles.completionStat}>{VAULT_DOCS.filter(d => d.status === 'needs-update').length} Needs Update</Text>
              <Text style={styles.completionStat}>{VAULT_DOCS.filter(d => d.status === 'missing').length} Missing</Text>
            </View>
          </View>
        </View>

        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'All Documents' },
            { key: 'critical', label: 'Critical Only' },
            { key: 'needs-action', label: 'Needs Action' },
          ].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => setFilter(f.key as any)}
            >
              <Text style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.map(doc => {
          const sc = STATUS_CONFIG[doc.status];
          return (
            <TouchableOpacity key={doc.id} style={styles.docCard} activeOpacity={0.8}>
              <View style={styles.docLeft}>
                <View style={styles.docIcon}>
                  <Text style={styles.docEmoji}>{doc.emoji}</Text>
                  <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
                </View>
              </View>
              <View style={styles.docContent}>
                <View style={styles.docHeader}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                </View>
                {doc.attorney && <Text style={styles.docAttorney}>Attorney: {doc.attorney}</Text>}
                {doc.lastUpdated && <Text style={styles.docUpdated}>Updated: {doc.lastUpdated}</Text>}
                <Text style={styles.docNotes}>{doc.notes}</Text>
                <View style={styles.urgencyRow}>
                  <View style={[styles.urgencyDot, { backgroundColor: URGENCY_COLORS[doc.urgency] }]} />
                  <Text style={[styles.urgencyText, { color: URGENCY_COLORS[doc.urgency] }]}>{doc.urgency}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.uploadBtn}>
          <Text style={styles.uploadBtnText}>+ Upload Document</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0A09' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#F5F5F4', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#78716C', marginTop: 2 },
  completionCard: { backgroundColor: '#1C1917', borderRadius: 16, padding: 18, marginBottom: 16, flexDirection: 'row', gap: 16, alignItems: 'center', borderWidth: 1, borderColor: '#292524' },
  completionLeft: { alignItems: 'center' },
  completionPct: { fontSize: 34, fontWeight: '900', color: '#D97706' },
  completionLabel: { fontSize: 11, color: '#78716C', marginTop: 2 },
  completionRight: { flex: 1 },
  completionBarBg: { height: 6, backgroundColor: '#292524', borderRadius: 3, marginBottom: 10 },
  completionBarFill: { height: 6, backgroundColor: '#D97706', borderRadius: 3 },
  completionStats: { gap: 4 },
  completionStat: { fontSize: 11, color: '#78716C' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { flex: 1, backgroundColor: '#1C1917', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#292524' },
  filterBtnActive: { backgroundColor: '#292010', borderColor: '#D97706' },
  filterBtnText: { fontSize: 11, color: '#78716C', fontWeight: '600' },
  filterBtnTextActive: { color: '#D97706' },
  docCard: { backgroundColor: '#1C1917', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#292524' },
  docLeft: { alignItems: 'center', paddingTop: 2 },
  docIcon: { position: 'relative' },
  docEmoji: { fontSize: 26 },
  statusDot: { position: 'absolute', bottom: 0, right: -2, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: '#1C1917' },
  docContent: { flex: 1 },
  docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 },
  docName: { fontSize: 14, fontWeight: '700', color: '#F5F5F4', flex: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  docAttorney: { fontSize: 11, color: '#78716C', marginBottom: 2 },
  docUpdated: { fontSize: 11, color: '#57534E', marginBottom: 6 },
  docNotes: { fontSize: 12, color: '#A8A29E', lineHeight: 17, marginBottom: 8 },
  urgencyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urgencyDot: { width: 6, height: 6, borderRadius: 3 },
  urgencyText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  uploadBtn: { backgroundColor: '#1C1917', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#D97706', borderStyle: 'dashed', marginTop: 4 },
  uploadBtnText: { color: '#D97706', fontWeight: '700', fontSize: 14 },
});
