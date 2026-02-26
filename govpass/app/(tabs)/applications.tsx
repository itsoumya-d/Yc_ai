import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEligibilityStore, Application } from '../../store/eligibility-store';

const CIVIC_BLUE = '#1E40AF';
const CIVIC_GREEN = '#059669';
const AMBER = '#D97706';
const BG = '#F9FAFB';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', labelEs: 'No iniciada', color: '#6B7280', icon: 'ellipse-outline' as const, bg: '#F3F4F6' },
  in_progress: { label: 'In Progress', labelEs: 'En progreso', color: AMBER, icon: 'time-outline' as const, bg: '#FFFBEB' },
  submitted: { label: 'Submitted', labelEs: 'Enviada', color: CIVIC_BLUE, icon: 'send-outline' as const, bg: '#EFF6FF' },
  under_review: { label: 'Under Review', labelEs: 'En revisión', color: '#7C3AED', icon: 'search-outline' as const, bg: '#F5F3FF' },
  approved: { label: 'Approved ✓', labelEs: 'Aprobada ✓', color: CIVIC_GREEN, icon: 'checkmark-circle-outline' as const, bg: '#ECFDF5' },
  denied: { label: 'Denied', labelEs: 'Denegada', color: '#EF4444', icon: 'close-circle-outline' as const, bg: '#FEF2F2' },
};

const TIMELINE_STEPS = ['submitted', 'under_review', 'approved'];

function ApplicationCard({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[app.status];
  const stepIdx = TIMELINE_STEPS.indexOf(app.status);

  return (
    <TouchableOpacity style={ac.card} onPress={() => setExpanded(!expanded)} activeOpacity={0.9}>
      <View style={ac.top}>
        <View style={{ flex: 1 }}>
          <Text style={ac.name}>{app.programName}</Text>
          <Text style={ac.id}>ID: {app.applicationId}</Text>
        </View>
        <View style={[ac.badge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[ac.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={ac.dates}>
        <Text style={ac.dateText}>Submitted: {app.submittedAt ?? 'Not yet'}</Text>
        {app.estimatedDecisionDate && (
          <Text style={ac.dateText}>Est. decision: {app.estimatedDecisionDate}</Text>
        )}
      </View>

      {/* Progress bar */}
      {app.status !== 'not_started' && app.status !== 'denied' && (
        <View style={ac.progressRow}>
          {TIMELINE_STEPS.map((step, i) => {
            const active = i <= stepIdx && app.status !== 'denied';
            return (
              <React.Fragment key={step}>
                <View style={[ac.progDot, active && { backgroundColor: CIVIC_BLUE }]}>
                  {active && <Ionicons name="checkmark" size={10} color="#fff" />}
                </View>
                {i < TIMELINE_STEPS.length - 1 && (
                  <View style={[ac.progLine, active && i < stepIdx && { backgroundColor: CIVIC_BLUE }]} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      )}

      {expanded && (
        <View style={ac.detail}>
          {/* Checklist */}
          {app.requiredDocuments.length > 0 && (
            <View style={ac.docs}>
              <Text style={ac.docsTitle}>Required Documents / Documentos requeridos</Text>
              {app.requiredDocuments.map((doc, i) => (
                <View key={i} style={ac.docRow}>
                  <Ionicons name="document-attach-outline" size={16} color="#6B7280" />
                  <Text style={ac.docText}>{doc}</Text>
                </View>
              ))}
            </View>
          )}

          {app.notes && (
            <View style={ac.notes}>
              <Text style={ac.notesTitle}>Notes / Notas</Text>
              <Text style={ac.notesText}>{app.notes}</Text>
            </View>
          )}

          {app.status === 'in_progress' && (
            <TouchableOpacity
              style={ac.continueBtn}
              onPress={() => Alert.alert('Continue Application', 'Resume where you left off.\n\nContinuar donde lo dejó.')}
            >
              <Ionicons name="arrow-forward-circle" size={18} color="#fff" />
              <Text style={ac.continueBtnText}>Continue Application / Continuar</Text>
            </TouchableOpacity>
          )}

          {app.status === 'denied' && (
            <TouchableOpacity
              style={[ac.continueBtn, { backgroundColor: AMBER }]}
              onPress={() => Alert.alert('Appeal', 'You have the right to appeal this decision within 90 days.\n\nTiene derecho a apelar esta decisión dentro de 90 días.')}
            >
              <Ionicons name="document-text-outline" size={18} color="#fff" />
              <Text style={ac.continueBtnText}>File Appeal / Apelar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const ac = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  id: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  dates: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dateText: { fontSize: 12, color: '#9CA3AF' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  progDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  progLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 2 },
  detail: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  docs: { marginBottom: 12 },
  docsTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  docText: { fontSize: 13, color: '#374151' },
  notes: { backgroundColor: '#FFFBEB', borderRadius: 10, padding: 10, marginBottom: 12 },
  notesTitle: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  notesText: { fontSize: 13, color: '#78350F', lineHeight: 18 },
  continueBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CIVIC_BLUE, borderRadius: 12, padding: 13, justifyContent: 'center' },
  continueBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default function ApplicationsScreen() {
  const { applications } = useEligibilityStore();

  const activeApps = applications.filter(a => !['not_started', 'denied'].includes(a.status));
  const allApps = applications;

  const handleNewApp = () => {
    Alert.alert(
      'Start New Application',
      'Go to Benefits to find programs you qualify for, then start an application.\n\nVaya a Beneficios para encontrar programas.',
      [{ text: 'OK', style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>My Applications</Text>
        <Text style={s.titleEs}>Mis solicitudes</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: CIVIC_BLUE }]}>{activeApps.length}</Text>
            <Text style={s.statLabel}>Active</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: CIVIC_GREEN }]}>{applications.filter(a => a.status === 'approved').length}</Text>
            <Text style={s.statLabel}>Approved</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: '#EF4444' }]}>{applications.filter(a => a.status === 'denied').length}</Text>
            <Text style={s.statLabel}>Denied</Text>
          </View>
        </View>

        {/* Deadline alert */}
        {activeApps.some(a => a.estimatedDecisionDate) && (
          <View style={s.deadlineCard}>
            <Ionicons name="calendar-outline" size={20} color={AMBER} />
            <View style={{ flex: 1 }}>
              <Text style={s.deadlineTitle}>Upcoming Decision</Text>
              <Text style={s.deadlineSub}>{activeApps.find(a => a.estimatedDecisionDate)?.programName} — {activeApps.find(a => a.estimatedDecisionDate)?.estimatedDecisionDate}</Text>
            </View>
          </View>
        )}

        {/* Application list */}
        {allApps.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyTitle}>No applications yet</Text>
            <Text style={s.emptySub}>Go to Benefits to find programs and start applications.</Text>
            <Text style={s.emptySubEs}>Vaya a Beneficios para encontrar programas.</Text>
          </View>
        ) : (
          allApps.map(app => <ApplicationCard key={app.applicationId} app={app} />)
        )}

        <TouchableOpacity style={s.newBtn} onPress={handleNewApp}>
          <Ionicons name="add-circle-outline" size={20} color={CIVIC_BLUE} />
          <Text style={s.newBtnText}>Start New Application / Nueva solicitud</Text>
        </TouchableOpacity>

        {/* Help */}
        <View style={s.helpCard}>
          <Text style={s.helpTitle}>Need help? / ¿Necesita ayuda?</Text>
          <Text style={s.helpText}>Free assistance is available at local community service centers. Call 211 for referrals.</Text>
          <Text style={s.helpTextEs}>Asistencia gratuita disponible en centros comunitarios. Llame al 211.</Text>
          <TouchableOpacity style={s.helpBtn} onPress={() => Alert.alert('Help Resources', 'Call 211 for free local assistance.\n\nLlame al 211 para obtener asistencia local gratuita.')}>
            <Text style={s.helpBtnText}>📞 Call 211 / Llamar al 211</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  titleEs: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 16 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  deadlineCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
  deadlineTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  deadlineSub: { fontSize: 12, color: '#B45309', marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 4 },
  emptySubEs: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },

  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  newBtnText: { fontSize: 14, fontWeight: '700', color: CIVIC_BLUE },

  helpCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  helpTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8 },
  helpText: { fontSize: 13, color: '#374151', lineHeight: 18, marginBottom: 4 },
  helpTextEs: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  helpBtn: { backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0' },
  helpBtnText: { fontSize: 14, fontWeight: '700', color: CIVIC_GREEN },
});
