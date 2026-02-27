import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInspectionStore, SeverityLevel, Inspection } from '../../store/inspection-store';

const SAFETY_YELLOW = '#FFC107';
const ALERT_RED = '#FF3B30';
const ORANGE = '#FF9800';
const GREEN = '#4CAF50';
const DARK_BG = '#1A1E1F';
const CARD_BG = '#242B2E';
const CHARCOAL = '#2D3436';
const TEXT = '#ECEFF1';
const TEXT2 = '#90A4AE';

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: ALERT_RED,
  high: ORANGE,
  medium: SAFETY_YELLOW,
  low: '#78909C',
};

function ViolationRow({ v, onCorrect }: {
  v: ReturnType<typeof useInspectionStore>['inspections'][0]['violations'][0];
  onCorrect: () => void;
}) {
  const color = SEVERITY_COLORS[v.severity];
  return (
    <View style={[vr.row, { borderLeftColor: color }]}>
      <View style={vr.top}>
        <View style={[vr.badge, { backgroundColor: `${color}20` }]}>
          <Text style={[vr.badgeText, { color }]}>{v.severity.toUpperCase()}</Text>
        </View>
        <Text style={vr.category}>{v.category.replace('_', ' ')}</Text>
        {v.oshaCode && <Text style={vr.osha}>OSHA {v.oshaCode}</Text>}
      </View>
      <Text style={vr.desc}>{v.description}</Text>
      <Text style={vr.location}>📍 {v.location}</Text>
      <View style={vr.actions}>
        <Text style={vr.due}>Due: {v.dueDate}</Text>
        {!v.corrected ? (
          <TouchableOpacity style={vr.correctBtn} onPress={onCorrect}>
            <Ionicons name="checkmark-circle-outline" size={14} color={GREEN} />
            <Text style={vr.correctBtnText}>Mark Corrected</Text>
          </TouchableOpacity>
        ) : (
          <View style={vr.correctedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={GREEN} />
            <Text style={vr.correctedText}>Corrected</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const vr = StyleSheet.create({
  row: { backgroundColor: CARD_BG, borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 4 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  category: { fontSize: 12, color: TEXT2, textTransform: 'capitalize', flex: 1 },
  osha: { fontSize: 10, color: '#546E7A', fontFamily: 'monospace' },
  desc: { fontSize: 13, color: TEXT, lineHeight: 18, marginBottom: 4 },
  location: { fontSize: 11, color: TEXT2, marginBottom: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  due: { fontSize: 11, color: TEXT2 },
  correctBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${GREEN}15`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  correctBtnText: { fontSize: 12, color: GREEN, fontWeight: '600' },
  correctedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  correctedText: { fontSize: 12, color: GREEN, fontWeight: '600' },
});

function InspectionCard({ inspection }: { inspection: Inspection }) {
  const [expanded, setExpanded] = useState(false);
  const { markCorrected } = useInspectionStore();
  const openViolations = inspection.violations.filter(v => !v.corrected);
  const scoreColor = inspection.complianceScore >= 90 ? GREEN : inspection.complianceScore >= 70 ? SAFETY_YELLOW : ALERT_RED;

  return (
    <View style={ic.card}>
      <TouchableOpacity style={ic.header} onPress={() => setExpanded(!expanded)}>
        <View style={ic.headerLeft}>
          <Text style={ic.name}>{inspection.facilityName}</Text>
          <Text style={ic.meta}>{inspection.date} · {inspection.violations.length} violation{inspection.violations.length !== 1 ? 's' : ''}</Text>
          {inspection.workers_present && (
            <Text style={ic.workers}>👷 {inspection.workers_present} workers present</Text>
          )}
        </View>
        <View style={ic.headerRight}>
          <View style={[ic.score, { backgroundColor: `${scoreColor}20` }]}>
            <Text style={[ic.scoreNum, { color: scoreColor }]}>{inspection.complianceScore}</Text>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={TEXT2} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={ic.body}>
          {inspection.notes && (
            <View style={ic.notes}>
              <Text style={ic.notesText}>{inspection.notes}</Text>
            </View>
          )}

          {openViolations.length > 0 && (
            <View style={ic.section}>
              <Text style={ic.sectionTitle}>Open Violations ({openViolations.length})</Text>
              {openViolations.map(v => (
                <ViolationRow
                  key={v.id}
                  v={v}
                  onCorrect={() => markCorrected(inspection.id, v.id)}
                />
              ))}
            </View>
          )}

          {inspection.violations.filter(v => v.corrected).length > 0 && (
            <View style={ic.section}>
              <Text style={[ic.sectionTitle, { color: GREEN }]}>Corrected ({inspection.violations.filter(v => v.corrected).length})</Text>
              {inspection.violations.filter(v => v.corrected).map(v => (
                <ViolationRow
                  key={v.id}
                  v={v}
                  onCorrect={() => {}}
                />
              ))}
            </View>
          )}

          {inspection.violations.length === 0 && (
            <View style={ic.perfect}>
              <Ionicons name="shield-checkmark" size={28} color={GREEN} />
              <Text style={ic.perfectText}>Zero violations — excellent compliance!</Text>
            </View>
          )}

          <TouchableOpacity
            style={ic.reportBtn}
            onPress={() => Alert.alert('PDF Report', 'Generate and share compliance report for this inspection.')}
          >
            <Ionicons name="document-text-outline" size={16} color={SAFETY_YELLOW} />
            <Text style={ic.reportBtnText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const ic = StyleSheet.create({
  card: { backgroundColor: CARD_BG, borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: CHARCOAL },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 10 },
  headerLeft: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 4 },
  meta: { fontSize: 12, color: TEXT2 },
  workers: { fontSize: 12, color: TEXT2, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  score: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: 16, fontWeight: '800' },
  body: { paddingHorizontal: 14, paddingBottom: 14 },
  notes: { backgroundColor: `${SAFETY_YELLOW}10`, borderRadius: 8, padding: 10, marginBottom: 12 },
  notesText: { fontSize: 12, color: SAFETY_YELLOW, lineHeight: 17 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: TEXT2, marginBottom: 8 },
  perfect: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  perfectText: { fontSize: 14, color: GREEN, fontWeight: '600' },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: `${SAFETY_YELLOW}40`, borderRadius: 10, padding: 10, justifyContent: 'center' },
  reportBtnText: { fontSize: 13, color: SAFETY_YELLOW, fontWeight: '600' },
});

export default function InspectionsScreen() {
  const { inspections } = useInspectionStore();
  const [filter, setFilter] = useState<'all' | 'open' | 'completed'>('all');

  const filtered = inspections.filter(i => {
    if (filter === 'open') return i.violations.some(v => !v.corrected);
    if (filter === 'completed') return i.violations.every(v => v.corrected) || i.violations.length === 0;
    return true;
  });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Inspections</Text>
        <Text style={s.sub}>{inspections.length} facilities</Text>
      </View>

      <View style={s.filters}>
        {[
          { key: 'all', label: `All (${inspections.length})` },
          { key: 'open', label: `Open Issues` },
          { key: 'completed', label: `Clean` },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filter, filter === f.key && s.filterActive]}
            onPress={() => setFilter(f.key as typeof filter)}
          >
            <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {filtered.map(i => <InspectionCard key={i.id} inspection={i} />)}

        {filtered.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="shield-checkmark" size={48} color={GREEN} />
            <Text style={s.emptyTitle}>All clear!</Text>
            <Text style={s.emptySub}>No inspections match this filter.</Text>
          </View>
        )}

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
  filters: { flexDirection: 'row', backgroundColor: '#1E272E', paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filter: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: CARD_BG },
  filterActive: { backgroundColor: SAFETY_YELLOW },
  filterText: { fontSize: 12, fontWeight: '600', color: TEXT2 },
  filterTextActive: { color: CHARCOAL },
  scroll: { flex: 1 },
  content: { padding: 16 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: GREEN },
  emptySub: { fontSize: 14, color: TEXT2 },
});
