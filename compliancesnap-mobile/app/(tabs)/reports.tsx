import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInspectionStore } from '../../store/inspection-store';

const SAFETY_YELLOW = '#FFC107';
const ALERT_RED = '#FF3B30';
const ORANGE = '#FF9800';
const GREEN = '#4CAF50';
const DARK_BG = '#1A1E1F';
const CARD_BG = '#242B2E';
const CHARCOAL = '#2D3436';
const TEXT = '#ECEFF1';
const TEXT2 = '#90A4AE';

export default function ReportsScreen() {
  const { inspections } = useInspectionStore();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const allViolations = inspections.flatMap(i => i.violations);
  const open = allViolations.filter(v => !v.corrected);
  const corrected = allViolations.filter(v => v.corrected);

  const bySeverity = {
    critical: open.filter(v => v.severity === 'critical').length,
    high: open.filter(v => v.severity === 'high').length,
    medium: open.filter(v => v.severity === 'medium').length,
    low: open.filter(v => v.severity === 'low').length,
  };

  const byCategory = ['fall_protection', 'electrical', 'ppe', 'hazmat', 'equipment', 'housekeeping', 'fire', 'other'].map(cat => ({
    category: cat,
    count: allViolations.filter(v => v.category === cat).length,
    label: cat.replace('_', ' '),
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  const avgScore = inspections.length > 0
    ? Math.round(inspections.reduce((s, i) => s + i.complianceScore, 0) / inspections.length)
    : 100;

  const reportTypes = [
    { id: 'summary', icon: '📊', title: 'Summary Report', desc: 'Overview of all inspections and violations' },
    { id: 'osha', icon: '⚠️', title: 'OSHA Compliance', desc: 'Violations by OSHA code and severity' },
    { id: 'corrective', icon: '✅', title: 'Corrective Actions', desc: 'Open action items with due dates' },
    { id: 'trend', icon: '📈', title: 'Trend Analysis', desc: 'Compliance scores over time' },
  ];

  const generateReport = (reportId: string) => {
    Alert.alert(
      'Generate Report',
      `Generating PDF compliance report: ${reportTypes.find(r => r.id === reportId)?.title}\n\nReport will be available to share or email.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate PDF', onPress: () => Alert.alert('Success', 'Compliance report generated and ready to share.') },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Reports</Text>
        <Text style={s.sub}>Compliance analytics & export</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Key metrics */}
        <View style={s.metricsGrid}>
          <View style={[s.metricCard, { borderTopColor: avgScore >= 90 ? GREEN : avgScore >= 70 ? SAFETY_YELLOW : ALERT_RED }]}>
            <Text style={[s.metricNum, { color: avgScore >= 90 ? GREEN : avgScore >= 70 ? SAFETY_YELLOW : ALERT_RED }]}>{avgScore}</Text>
            <Text style={s.metricLabel}>Avg. Score</Text>
          </View>
          <View style={[s.metricCard, { borderTopColor: bySeverity.critical > 0 ? ALERT_RED : GREEN }]}>
            <Text style={[s.metricNum, { color: bySeverity.critical > 0 ? ALERT_RED : GREEN }]}>{bySeverity.critical}</Text>
            <Text style={s.metricLabel}>Critical Open</Text>
          </View>
          <View style={[s.metricCard, { borderTopColor: SAFETY_YELLOW }]}>
            <Text style={[s.metricNum, { color: SAFETY_YELLOW }]}>{open.length}</Text>
            <Text style={s.metricLabel}>Total Open</Text>
          </View>
          <View style={[s.metricCard, { borderTopColor: GREEN }]}>
            <Text style={[s.metricNum, { color: GREEN }]}>{corrected.length}</Text>
            <Text style={s.metricLabel}>Corrected</Text>
          </View>
        </View>

        {/* Severity breakdown bars */}
        <View style={s.sevCard}>
          <Text style={s.cardTitle}>Open Violations by Severity</Text>
          {[
            { sev: 'Critical', count: bySeverity.critical, color: ALERT_RED },
            { sev: 'High', count: bySeverity.high, color: ORANGE },
            { sev: 'Medium', count: bySeverity.medium, color: SAFETY_YELLOW },
            { sev: 'Low', count: bySeverity.low, color: '#78909C' },
          ].map(item => {
            const maxCount = Math.max(...Object.values(bySeverity), 1);
            const pct = (item.count / maxCount) * 100;
            return (
              <View key={item.sev} style={s.barRow}>
                <Text style={[s.barLabel, { color: item.color }]}>{item.sev}</Text>
                <View style={s.barTrack}>
                  <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: item.color }]} />
                </View>
                <Text style={[s.barCount, { color: item.color }]}>{item.count}</Text>
              </View>
            );
          })}
        </View>

        {/* Top violation categories */}
        {byCategory.length > 0 && (
          <View style={s.catCard}>
            <Text style={s.cardTitle}>Top Violation Categories</Text>
            {byCategory.slice(0, 5).map((cat, i) => (
              <View key={cat.category} style={s.catRow}>
                <Text style={s.catRank}>#{i + 1}</Text>
                <Text style={s.catLabel}>{cat.label.replace(/\b\w/g, l => l.toUpperCase())}</Text>
                <View style={s.catBarWrap}>
                  <View style={[s.catBar, { width: `${(cat.count / byCategory[0].count) * 100}%` as any }]} />
                </View>
                <Text style={s.catCount}>{cat.count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Per-facility scores */}
        <View style={s.facilityCard}>
          <Text style={s.cardTitle}>Facility Compliance Scores</Text>
          {inspections.map(insp => {
            const scoreColor = insp.complianceScore >= 90 ? GREEN : insp.complianceScore >= 70 ? SAFETY_YELLOW : ALERT_RED;
            const pct = insp.complianceScore;
            return (
              <View key={insp.id} style={s.facilityRow}>
                <View style={s.facilityLeft}>
                  <Text style={s.facilityName} numberOfLines={1}>{insp.facilityName}</Text>
                  <Text style={s.facilityDate}>{insp.date}</Text>
                </View>
                <View style={s.facilityBarWrap}>
                  <View style={[s.facilityBar, { width: `${pct}%` as any, backgroundColor: scoreColor }]} />
                </View>
                <Text style={[s.facilityScore, { color: scoreColor }]}>{pct}</Text>
              </View>
            );
          })}
        </View>

        {/* Report generation */}
        <Text style={s.sectionTitle}>Generate Reports</Text>
        {reportTypes.map(report => (
          <TouchableOpacity key={report.id} style={s.reportCard} onPress={() => generateReport(report.id)}>
            <Text style={s.reportIcon}>{report.icon}</Text>
            <View style={s.reportInfo}>
              <Text style={s.reportTitle}>{report.title}</Text>
              <Text style={s.reportDesc}>{report.desc}</Text>
            </View>
            <View style={s.reportBtn}>
              <Ionicons name="download-outline" size={16} color={SAFETY_YELLOW} />
              <Text style={s.reportBtnText}>PDF</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Compliance period */}
        <View style={s.periodCard}>
          <Ionicons name="calendar-outline" size={18} color={SAFETY_YELLOW} />
          <View style={{ flex: 1 }}>
            <Text style={s.periodTitle}>Reporting Period</Text>
            <Text style={s.periodText}>Jan 1 – Jan 31, 2025 · 3 inspections completed</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK_BG },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#1E272E', borderBottomWidth: 1, borderBottomColor: CHARCOAL },
  title: { fontSize: 22, fontWeight: '800', color: TEXT },
  sub: { fontSize: 13, color: TEXT2, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 16 },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  metricCard: { width: '48%', backgroundColor: CARD_BG, borderRadius: 12, padding: 14, borderTopWidth: 3 },
  metricNum: { fontSize: 28, fontWeight: '800' },
  metricLabel: { fontSize: 12, color: TEXT2, marginTop: 2 },

  sevCard: { backgroundColor: CARD_BG, borderRadius: 14, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 14 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel: { width: 60, fontSize: 12, fontWeight: '700' },
  barTrack: { flex: 1, height: 8, backgroundColor: CHARCOAL, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barCount: { width: 24, fontSize: 13, fontWeight: '800', textAlign: 'right' },

  catCard: { backgroundColor: CARD_BG, borderRadius: 14, padding: 16, marginBottom: 16 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  catRank: { fontSize: 11, color: TEXT2, width: 20, fontWeight: '700' },
  catLabel: { width: 100, fontSize: 12, color: TEXT, textTransform: 'capitalize' },
  catBarWrap: { flex: 1, height: 6, backgroundColor: CHARCOAL, borderRadius: 3, overflow: 'hidden' },
  catBar: { height: '100%', backgroundColor: SAFETY_YELLOW, borderRadius: 3 },
  catCount: { width: 20, fontSize: 12, color: SAFETY_YELLOW, fontWeight: '700', textAlign: 'right' },

  facilityCard: { backgroundColor: CARD_BG, borderRadius: 14, padding: 16, marginBottom: 16 },
  facilityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  facilityLeft: { width: 120 },
  facilityName: { fontSize: 12, color: TEXT, fontWeight: '600' },
  facilityDate: { fontSize: 10, color: TEXT2 },
  facilityBarWrap: { flex: 1, height: 6, backgroundColor: CHARCOAL, borderRadius: 3, overflow: 'hidden' },
  facilityBar: { height: '100%', borderRadius: 3 },
  facilityScore: { width: 28, fontSize: 12, fontWeight: '800', textAlign: 'right' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 10 },
  reportCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD_BG, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: CHARCOAL },
  reportIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  reportDesc: { fontSize: 12, color: TEXT2, marginTop: 2 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${SAFETY_YELLOW}15`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  reportBtnText: { fontSize: 12, color: SAFETY_YELLOW, fontWeight: '700' },

  periodCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: `${SAFETY_YELLOW}10`, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: `${SAFETY_YELLOW}30` },
  periodTitle: { fontSize: 13, fontWeight: '700', color: SAFETY_YELLOW, marginBottom: 2 },
  periodText: { fontSize: 12, color: TEXT2 },
});
