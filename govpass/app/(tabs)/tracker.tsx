import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

type Application = {
  id: string;
  benefit: string;
  agency: string;
  submittedDate: string;
  status: 'submitted' | 'in-review' | 'approved' | 'denied' | 'more-info';
  nextStep: string;
  nextDeadline?: string;
  refNumber: string;
  timeline: { date: string; event: string; done: boolean }[];
};

const APPLICATIONS: Application[] = [
  {
    id: '1',
    benefit: 'SNAP Benefits',
    agency: 'USDA / State DHS',
    submittedDate: 'Feb 10, 2025',
    status: 'approved',
    nextStep: 'Benefits loaded to EBT card monthly',
    refNumber: 'SNAP-2025-4821',
    timeline: [
      { date: 'Feb 10', event: 'Application submitted', done: true },
      { date: 'Feb 12', event: 'Identity verified', done: true },
      { date: 'Feb 18', event: 'Income reviewed', done: true },
      { date: 'Feb 22', event: 'Approved — $281/month', done: true },
    ],
  },
  {
    id: '2',
    benefit: 'SSI Disability',
    agency: 'Social Security Admin',
    submittedDate: 'Jan 28, 2025',
    status: 'in-review',
    nextStep: 'Medical records under review by SSA',
    nextDeadline: 'Response by Apr 15',
    refNumber: 'SSI-2025-0093',
    timeline: [
      { date: 'Jan 28', event: 'Application submitted', done: true },
      { date: 'Feb 5', event: 'Documents received', done: true },
      { date: 'Feb 20', event: 'Medical review started', done: true },
      { date: 'Apr 15', event: 'Decision expected', done: false },
    ],
  },
  {
    id: '3',
    benefit: 'LIHEAP Energy Assistance',
    agency: 'HHS / Local Agency',
    submittedDate: 'Mar 1, 2025',
    status: 'more-info',
    nextStep: 'Upload utility bill from last 60 days',
    nextDeadline: 'Submit by Mar 31',
    refNumber: 'LHE-2025-2211',
    timeline: [
      { date: 'Mar 1', event: 'Application submitted', done: true },
      { date: 'Mar 5', event: 'Additional documents requested', done: true },
      { date: 'Mar 31', event: 'Documents due', done: false },
      { date: 'Apr 10', event: 'Decision', done: false },
    ],
  },
];

const STATUS_CONFIG = {
  'submitted': { label: 'Submitted', color: '#3B82F6', bg: '#DBEAFE' },
  'in-review': { label: 'In Review', color: '#F59E0B', bg: '#FEF9C3' },
  'approved': { label: 'Approved', color: '#10B981', bg: '#D1FAE5' },
  'denied': { label: 'Denied', color: '#EF4444', bg: '#FEE2E2' },
  'more-info': { label: 'Info Needed', color: '#DC2626', bg: '#FEE2E2' },
};

export default function TrackerScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Application Tracker</Text>
          <Text style={styles.subtitle}>{APPLICATIONS.length} active applications</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Approved', count: APPLICATIONS.filter(a => a.status === 'approved').length, color: '#10B981' },
            { label: 'In Review', count: APPLICATIONS.filter(a => a.status === 'in-review').length, color: '#F59E0B' },
            { label: 'Action Needed', count: APPLICATIONS.filter(a => a.status === 'more-info').length, color: '#EF4444' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {APPLICATIONS.map(app => {
          const cfg = STATUS_CONFIG[app.status];
          return (
            <View key={app.id} style={styles.appCard}>
              <View style={styles.appHeader}>
                <View style={styles.appLeft}>
                  <Text style={styles.appName}>{app.benefit}</Text>
                  <Text style={styles.appAgency}>{app.agency}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              <Text style={styles.refNum}>Ref: {app.refNumber}</Text>

              {app.status === 'more-info' && (
                <View style={styles.actionAlert}>
                  <Text style={styles.actionAlertText}>⚠️ {app.nextStep}</Text>
                  {app.nextDeadline && <Text style={styles.actionDeadline}>Due: {app.nextDeadline}</Text>}
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Upload Documents</Text>
                  </TouchableOpacity>
                </View>
              )}

              {app.status !== 'more-info' && (
                <View style={styles.nextStepBox}>
                  <Text style={styles.nextStepLabel}>Next Step</Text>
                  <Text style={styles.nextStepText}>{app.nextStep}</Text>
                  {app.nextDeadline && <Text style={styles.nextDeadline}>{app.nextDeadline}</Text>}
                </View>
              )}

              <Text style={styles.timelineTitle}>Timeline</Text>
              {app.timeline.map((step, idx) => (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: step.done ? '#10B981' : '#D1D5DB' }]} />
                    {idx < app.timeline.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: step.done ? '#10B981' : '#E5E7EB' }]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineEvent, !step.done && styles.timelineEventPending]}>
                      {step.event}
                    </Text>
                    <Text style={styles.timelineDate}>{step.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4FF' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#1B4EDE', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E0E7FF' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 2 },
  appCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E0E7FF' },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  appLeft: { flex: 1 },
  appName: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  appAgency: { fontSize: 12, color: '#64748B' },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  refNum: { fontSize: 11, color: '#94A3B8', marginBottom: 12, fontFamily: 'monospace' },
  actionAlert: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FECACA' },
  actionAlertText: { fontSize: 13, color: '#991B1B', fontWeight: '600', marginBottom: 4 },
  actionDeadline: { fontSize: 12, color: '#DC2626', marginBottom: 10 },
  actionBtn: { backgroundColor: '#DC2626', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  nextStepBox: { backgroundColor: '#EEF2FF', borderRadius: 10, padding: 12, marginBottom: 14 },
  nextStepLabel: { fontSize: 11, color: '#4338CA', fontWeight: '700', marginBottom: 2 },
  nextStepText: { fontSize: 13, color: '#1E40AF', fontWeight: '500' },
  nextDeadline: { fontSize: 11, color: '#6366F1', marginTop: 4 },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  timelineRow: { flexDirection: 'row', gap: 12, marginBottom: 2 },
  timelineLeft: { width: 20, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 2 },
  timelineLine: { width: 2, flex: 1, marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: 14 },
  timelineEvent: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  timelineEventPending: { color: '#94A3B8' },
  timelineDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
});
