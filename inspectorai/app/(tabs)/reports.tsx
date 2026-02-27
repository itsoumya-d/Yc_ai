import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type Report = {
  id: string;
  address: string;
  claimNum: string;
  insured: string;
  carrier: string;
  dateInspected: string;
  dateGenerated?: string;
  status: 'draft' | 'ai-review' | 'ready' | 'submitted' | 'approved' | 'supplemental';
  damageTypes: string[];
  totalEstimate: number;
  photoCount: number;
  xactimateLine: boolean;
};

const REPORTS: Report[] = [
  { id: '1', address: '1847 NE Burnside St', claimNum: 'CLM-2025-8841', insured: 'Robert & Amy Chen', carrier: 'State Farm', dateInspected: 'Feb 22', dateGenerated: undefined, status: 'draft', damageTypes: ['Wind', 'Hail'], totalEstimate: 0, photoCount: 16, xactimateLine: false },
  { id: '2', address: '503 Oak Grove Dr', claimNum: 'CLM-2025-7782', insured: 'Sandra Mitchell', carrier: 'Allstate', dateInspected: 'Feb 20', dateGenerated: 'Feb 20', status: 'ready', damageTypes: ['Hail', 'Water Intrusion'], totalEstimate: 28450, photoCount: 47, xactimateLine: true },
  { id: '3', address: '2211 SW Canyon Rd', claimNum: 'CLM-2025-6904', insured: 'Park Family Trust', carrier: 'USAA', dateInspected: 'Feb 18', dateGenerated: 'Feb 19', status: 'approved', damageTypes: ['Wind'], totalEstimate: 14200, photoCount: 31, xactimateLine: true },
  { id: '4', address: '901 NW 23rd Ave #4B', claimNum: 'CLM-2025-6210', insured: 'David Osei', carrier: 'Farmers', dateInspected: 'Feb 15', dateGenerated: 'Feb 15', status: 'supplemental', damageTypes: ['Wind', 'Hail', 'Structural'], totalEstimate: 67800, photoCount: 89, xactimateLine: true },
  { id: '5', address: '1420 SE Division St', claimNum: 'CLM-2025-5889', insured: 'Nguyen Family', carrier: 'Liberty Mutual', dateInspected: 'Feb 12', dateGenerated: 'Feb 13', status: 'submitted', damageTypes: ['Hail'], totalEstimate: 9200, photoCount: 28, xactimateLine: true },
  { id: '6', address: '743 NE Alberta Ave', claimNum: 'CLM-2025-5102', insured: 'Green Realty LLC', carrier: 'Travelers', dateInspected: 'Feb 8', dateGenerated: 'Feb 9', status: 'approved', damageTypes: ['Wind', 'Water Intrusion'], totalEstimate: 41600, photoCount: 64, xactimateLine: true },
];

const STATUS_CONFIG = {
  draft: { label: 'Draft', bg: '#F1F5F9', text: '#475569', icon: '📝' },
  'ai-review': { label: 'AI Review', bg: '#FAE8FF', text: '#701A75', icon: '🤖' },
  ready: { label: 'Ready', bg: '#ECFDF5', text: '#065F46', icon: '✅' },
  submitted: { label: 'Submitted', bg: '#EFF6FF', text: '#1D4ED8', icon: '📤' },
  approved: { label: 'Approved', bg: '#F0FDF4', text: '#15803D', icon: '✓' },
  supplemental: { label: 'Supplemental', bg: '#FEF9C3', text: '#713F12', icon: '📎' },
};

const FILTER_OPTIONS = ['All', 'Draft', 'Ready', 'Submitted', 'Approved'];

export default function InspectorAIReportsScreen() {
  const [filter, setFilter] = useState('All');

  const filtered = REPORTS.filter(r => {
    if (filter === 'All') return true;
    if (filter === 'Draft') return r.status === 'draft' || r.status === 'ai-review';
    return STATUS_CONFIG[r.status].label === filter;
  });

  const totalApproved = REPORTS.filter(r => r.status === 'approved').reduce((s, r) => s + r.totalEstimate, 0);
  const readyCount = REPORTS.filter(r => r.status === 'ready').length;
  const draftCount = REPORTS.filter(r => r.status === 'draft' || r.status === 'ai-review').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>Generated inspection reports</Text>
        </View>

        {/* Summary hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroMain}>
              <Text style={styles.heroLabel}>Total Approved Estimates</Text>
              <Text style={styles.heroAmount}>${totalApproved.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{REPORTS.length}</Text>
              <Text style={styles.heroStatLabel}>Total</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatVal, { color: '#10B981' }]}>{readyCount}</Text>
              <Text style={styles.heroStatLabel}>Ready to Send</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatVal, { color: '#94A3B8' }]}>{draftCount}</Text>
              <Text style={styles.heroStatLabel}>In Draft</Text>
            </View>
          </View>
        </View>

        {/* Filter */}
        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Report cards */}
        {filtered.map(report => {
          const sc = STATUS_CONFIG[report.status];
          return (
            <View key={report.id} style={styles.reportCard}>
              {/* Header */}
              <View style={styles.reportHeader}>
                <View style={styles.reportHeaderLeft}>
                  <Text style={styles.reportAddress}>{report.address}</Text>
                  <Text style={styles.reportClaim}>{report.claimNum} · {report.carrier}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={styles.statusIcon}>{sc.icon}</Text>
                  <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                </View>
              </View>

              {/* Meta */}
              <View style={styles.reportMeta}>
                <Text style={styles.metaItem}>👤 {report.insured}</Text>
                <Text style={styles.metaItem}>📷 {report.photoCount} photos</Text>
                <Text style={styles.metaItem}>🗓 {report.dateInspected}</Text>
              </View>

              {/* Damage tags */}
              <View style={styles.damageTags}>
                {report.damageTypes.map(d => (
                  <View key={d} style={styles.damageTag}>
                    <Text style={styles.damageTagText}>{d}</Text>
                  </View>
                ))}
                {report.xactimateLine && (
                  <View style={styles.xactimateTag}>
                    <Text style={styles.xactimateText}>Xactimate ✓</Text>
                  </View>
                )}
              </View>

              {/* Estimate */}
              {report.totalEstimate > 0 && (
                <View style={styles.estimateRow}>
                  <Text style={styles.estimateLabel}>Estimated Loss:</Text>
                  <Text style={styles.estimateVal}>${report.totalEstimate.toLocaleString()}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>👁 Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>⬇ PDF</Text>
                </TouchableOpacity>
                {report.xactimateLine && (
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>📊 Xactimate</Text>
                  </TouchableOpacity>
                )}
                {report.status === 'ready' && (
                  <TouchableOpacity style={styles.submitBtn}>
                    <Text style={styles.submitBtnText}>Submit →</Text>
                  </TouchableOpacity>
                )}
                {report.status === 'draft' && (
                  <TouchableOpacity style={styles.generateBtn}>
                    <Text style={styles.generateBtnText}>🤖 Generate</Text>
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
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#1E3A5F', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },

  heroCard: { backgroundColor: '#1E3A5F', borderRadius: 20, padding: 20, marginBottom: 16 },
  heroRow: { marginBottom: 16 },
  heroMain: {},
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  heroAmount: { fontSize: 36, fontWeight: '900', color: '#FFF' },
  heroStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 14 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  heroStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  filterBtn: { backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: '#E2E8F0' },
  filterBtnActive: { backgroundColor: '#1E3A5F', borderColor: '#1E3A5F' },
  filterBtnText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filterBtnTextActive: { color: '#FFF' },

  reportCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reportHeaderLeft: { flex: 1, marginRight: 10 },
  reportAddress: { fontSize: 14, fontWeight: '700', color: '#1E3A5F' },
  reportClaim: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  statusIcon: { fontSize: 11 },
  statusText: { fontSize: 10, fontWeight: '800' },
  reportMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaItem: { fontSize: 11, color: '#64748B' },
  damageTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  damageTag: { backgroundColor: '#EFF6FF', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  damageTagText: { fontSize: 11, color: '#1D4ED8', fontWeight: '600' },
  xactimateTag: { backgroundColor: '#F0FDF4', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  xactimateText: { fontSize: 11, color: '#15803D', fontWeight: '700' },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  estimateLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  estimateVal: { fontSize: 14, fontWeight: '800', color: '#1E3A5F' },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  actionBtnText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  submitBtn: { backgroundColor: '#1E3A5F', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  submitBtnText: { fontSize: 11, color: '#FFF', fontWeight: '700' },
  generateBtn: { backgroundColor: '#FAE8FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  generateBtnText: { fontSize: 11, color: '#701A75', fontWeight: '700' },
});
