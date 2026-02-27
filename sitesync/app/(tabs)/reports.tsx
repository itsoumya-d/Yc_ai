import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type Report = {
  id: string;
  title: string;
  project: string;
  type: 'weekly' | 'phase' | 'inspection' | 'incident';
  status: 'draft' | 'ready' | 'submitted' | 'approved';
  generatedDate: string;
  period: string;
  photoCount: number;
  pageCount: number;
  aiGenerated: boolean;
};

const REPORTS: Report[] = [
  { id: '1', title: 'Week 8 Progress Report', project: 'Eastside Tower', type: 'weekly', status: 'ready', generatedDate: 'Feb 21', period: 'Feb 15–21', photoCount: 47, pageCount: 12, aiGenerated: true },
  { id: '2', title: 'Foundation Phase Complete', project: 'Eastside Tower', type: 'phase', status: 'approved', generatedDate: 'Feb 14', period: 'Jan 6 – Feb 14', photoCount: 183, pageCount: 28, aiGenerated: true },
  { id: '3', title: 'Week 7 Progress Report', project: 'Eastside Tower', type: 'weekly', status: 'submitted', generatedDate: 'Feb 14', period: 'Feb 8–14', photoCount: 38, pageCount: 10, aiGenerated: true },
  { id: '4', title: 'Site Safety Inspection', project: 'Harbor View Condos', type: 'inspection', status: 'approved', generatedDate: 'Feb 10', period: 'Feb 10', photoCount: 22, pageCount: 6, aiGenerated: false },
  { id: '5', title: 'Week 12 Progress Report', project: 'Harbor View Condos', type: 'weekly', status: 'submitted', generatedDate: 'Feb 7', period: 'Feb 1–7', photoCount: 31, pageCount: 9, aiGenerated: true },
  { id: '6', title: 'Concrete Pour Incident Log', project: 'Eastside Tower', type: 'incident', status: 'submitted', generatedDate: 'Jan 28', period: 'Jan 28', photoCount: 8, pageCount: 3, aiGenerated: false },
  { id: '7', title: 'Week 6 Progress Report', project: 'Eastside Tower', type: 'weekly', status: 'approved', generatedDate: 'Feb 7', period: 'Feb 1–7', photoCount: 41, pageCount: 11, aiGenerated: true },
];

const STATUS_CONFIG = {
  draft: { label: 'Draft', bg: '#F1F5F9', text: '#475569' },
  ready: { label: 'Ready', bg: '#ECFDF5', text: '#065F46' },
  submitted: { label: 'Submitted', bg: '#EFF6FF', text: '#1D4ED8' },
  approved: { label: 'Approved', bg: '#F0FDF4', text: '#15803D' },
};

const TYPE_EMOJI = { weekly: '📆', phase: '🏗️', inspection: '🔍', incident: '⚠️' };
const TYPE_LABELS = { weekly: 'Weekly', phase: 'Phase', inspection: 'Inspection', incident: 'Incident' };

const FILTER_OPTIONS = ['All', 'Weekly', 'Phase', 'Inspection', 'Incident'];

export default function SiteSyncReportsScreen() {
  const [filter, setFilter] = useState('All');
  const [project, setProject] = useState('All Projects');

  const filtered = REPORTS.filter(r => {
    const matchFilter = filter === 'All' || TYPE_LABELS[r.type] === filter;
    const matchProject = project === 'All Projects' || r.project === project;
    return matchFilter && matchProject;
  });

  const approvedCount = REPORTS.filter(r => r.status === 'approved').length;
  const readyCount = REPORTS.filter(r => r.status === 'ready').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>AI-generated site documentation</Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryNum}>{REPORTS.length}</Text>
            <Text style={styles.summaryLabel}>Total Reports</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatNum, { color: '#15803D' }]}>{approvedCount}</Text>
              <Text style={styles.summaryStatLabel}>Approved</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatNum, { color: '#10B981' }]}>{readyCount}</Text>
              <Text style={styles.summaryStatLabel}>Ready to Send</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatNum, { color: '#A21CAF' }]}>{REPORTS.filter(r => r.aiGenerated).length}</Text>
              <Text style={styles.summaryStatLabel}>AI Generated</Text>
            </View>
          </View>
        </View>

        {/* Generate CTA */}
        <TouchableOpacity style={styles.generateCard} activeOpacity={0.85}>
          <View style={styles.generateLeft}>
            <Text style={styles.generateTitle}>🤖 Generate Weekly Report</Text>
            <Text style={styles.generateSub}>AI will compile this week's 47 photos into a professional progress report.</Text>
          </View>
          <View style={styles.generateBtn}>
            <Text style={styles.generateBtnText}>Generate</Text>
          </View>
        </TouchableOpacity>

        {/* Project filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
          {['All Projects', 'Eastside Tower', 'Harbor View Condos'].map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.projectPill, project === p && styles.projectPillActive]}
              onPress={() => setProject(p)}
            >
              <Text style={[styles.projectText, project === p && styles.projectTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Type filter */}
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

        {/* Reports list */}
        {filtered.map(report => {
          const sc = STATUS_CONFIG[report.status];
          return (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportTop}>
                <Text style={styles.reportEmoji}>{TYPE_EMOJI[report.type]}</Text>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportProject}>{report.project}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                </View>
              </View>
              <View style={styles.reportMeta}>
                <Text style={styles.reportMetaText}>📅 {report.period}</Text>
                <Text style={styles.reportMetaDot}>·</Text>
                <Text style={styles.reportMetaText}>📷 {report.photoCount} photos</Text>
                <Text style={styles.reportMetaDot}>·</Text>
                <Text style={styles.reportMetaText}>{report.pageCount}pp</Text>
                {report.aiGenerated && (
                  <>
                    <Text style={styles.reportMetaDot}>·</Text>
                    <Text style={styles.reportMetaAI}>🤖 AI</Text>
                  </>
                )}
              </View>
              <View style={styles.reportActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>📄 Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>⬇ PDF</Text>
                </TouchableOpacity>
                {report.status === 'ready' && (
                  <TouchableOpacity style={styles.submitBtn}>
                    <Text style={styles.submitBtnText}>Send to Client →</Text>
                  </TouchableOpacity>
                )}
                {report.status === 'approved' && (
                  <TouchableOpacity style={styles.shareBtn}>
                    <Text style={styles.shareBtnText}>🔗 Share Link</Text>
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
  title: { fontSize: 26, fontWeight: '900', color: '#0F2027', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },

  summaryCard: { backgroundColor: '#0F2027', borderRadius: 18, padding: 18, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryLeft: { alignItems: 'center' },
  summaryNum: { fontSize: 36, fontWeight: '900', color: '#FFF' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  summaryDivider: { width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.2)' },
  summaryStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  summaryStat: { alignItems: 'center' },
  summaryStatNum: { fontSize: 20, fontWeight: '800' },
  summaryStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2, textAlign: 'center' },

  generateCard: { backgroundColor: '#ECFDF5', borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  generateLeft: { flex: 1 },
  generateTitle: { fontSize: 14, fontWeight: '800', color: '#065F46', marginBottom: 4 },
  generateSub: { fontSize: 12, color: '#047857', lineHeight: 17 },
  generateBtn: { backgroundColor: '#0F2027', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  generateBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

  projectScroll: { marginBottom: 12 },
  projectPill: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1.5, borderColor: '#E2E8F0' },
  projectPillActive: { backgroundColor: '#0F2027', borderColor: '#0F2027' },
  projectText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  projectTextActive: { color: '#FFF' },

  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  filterBtn: { backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  filterBtnActive: { backgroundColor: '#0F2027', borderColor: '#0F2027' },
  filterBtnText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filterBtnTextActive: { color: '#FFF' },

  reportCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  reportTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reportEmoji: { fontSize: 24, marginTop: 1 },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
  reportProject: { fontSize: 12, color: '#64748B' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '800' },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  reportMetaText: { fontSize: 11, color: '#64748B' },
  reportMetaDot: { color: '#CBD5E1', fontSize: 10 },
  reportMetaAI: { fontSize: 11, color: '#7C3AED', fontWeight: '700' },
  reportActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  actionBtnText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  submitBtn: { backgroundColor: '#0F2027', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  submitBtnText: { fontSize: 12, color: '#FFF', fontWeight: '700' },
  shareBtn: { backgroundColor: '#ECFDF5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  shareBtnText: { fontSize: 12, color: '#065F46', fontWeight: '700' },
});
