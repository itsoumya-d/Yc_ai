import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInspectionStore, DamageFinding, DamageType, Severity } from '../../store/inspection-store';

const NAVY = '#1B2A4A';
const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const TEXT = '#1E293B';
const TEXT2 = '#64748B';
const GREEN = '#10B981';
const AMBER = '#F59E0B';
const RED = '#EF4444';
const ORANGE = '#F97316';
const BLUE = '#3B82F6';

const DAMAGE_TYPE_CONFIG: Record<DamageType, { label: string; icon: string; color: string }> = {
  structural: { label: 'Structural', icon: '🏗️', color: RED },
  water: { label: 'Water', icon: '💧', color: BLUE },
  fire: { label: 'Fire', icon: '🔥', color: ORANGE },
  wind: { label: 'Wind', icon: '💨', color: '#8B5CF6' },
  vandalism: { label: 'Vandalism', icon: '⚠️', color: AMBER },
  wear: { label: 'Normal Wear', icon: '🔄', color: TEXT2 },
  other: { label: 'Other', icon: '🔍', color: TEXT2 },
};

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string }> = {
  critical: { label: 'Critical', color: RED },
  major: { label: 'Major', color: ORANGE },
  minor: { label: 'Minor', color: AMBER },
  cosmetic: { label: 'Cosmetic', color: GREEN },
};

function FindingCard({ finding, roomName }: { finding: DamageFinding; roomName: string }) {
  const [expanded, setExpanded] = useState(false);
  const dtype = DAMAGE_TYPE_CONFIG[finding.type];
  const severity = SEVERITY_CONFIG[finding.severity];

  return (
    <TouchableOpacity
      style={[s.findingCard, { borderTopColor: severity.color }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
    >
      <View style={s.findingTop}>
        <View style={[s.findingTypeIcon, { backgroundColor: `${dtype.color}15` }]}>
          <Text style={{ fontSize: 20 }}>{dtype.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.findingMeta}>
            <Text style={[s.findingSeverity, { color: severity.color }]}>{severity.label}</Text>
            <Text style={s.findingSep}>·</Text>
            <Text style={[s.findingType, { color: dtype.color }]}>{dtype.label}</Text>
          </View>
          <Text style={s.findingLocation}>{finding.location} · {roomName}</Text>
        </View>
        <View style={s.confidenceChip}>
          <Text style={s.confidenceText}>{finding.confidenceScore}%</Text>
        </View>
      </View>

      <Text style={s.findingDesc} numberOfLines={expanded ? undefined : 2}>{finding.description}</Text>

      <View style={s.costRow}>
        <Text style={s.costLabel}>Est. repair:</Text>
        <Text style={s.costValue}>${finding.estimatedRepairCost.low.toLocaleString()} – ${finding.estimatedRepairCost.high.toLocaleString()}</Text>
      </View>

      {expanded && (
        <View style={s.expandedDetail}>
          <View style={s.aiNotesBlock}>
            <Text style={s.aiNotesTitle}>🤖 AI Notes</Text>
            <Text style={s.aiNotesText}>{finding.aiNotes}</Text>
          </View>
          {finding.requiresProfessional && (
            <View style={s.proNote}>
              <Ionicons name="warning" size={13} color={RED} />
              <Text style={s.proNoteText}>Professional assessment required</Text>
            </View>
          )}
        </View>
      )}

      <View style={s.expandRow}>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={TEXT2} />
      </View>
    </TouchableOpacity>
  );
}

export default function FindingsScreen() {
  const { inspections, activeInspectionId } = useInspectionStore();
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [filterType, setFilterType] = useState<DamageType | 'all'>('all');

  const inspection = inspections.find(i => i.id === activeInspectionId) ?? inspections[0];

  if (!inspection) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.noData}>
          <Text style={s.noDataIcon}>🔍</Text>
          <Text style={s.noDataTitle}>No Active Inspection</Text>
          <Text style={s.noDataSub}>Select an inspection from the Inspections tab.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Flatten all findings
  const allFindings: Array<{ finding: DamageFinding; roomName: string }> = inspection.rooms.flatMap(room =>
    room.findings.map(f => ({ finding: f, roomName: room.name }))
  );

  const filteredFindings = allFindings.filter(({ finding }) => {
    if (filterSeverity !== 'all' && finding.severity !== filterSeverity) return false;
    if (filterType !== 'all' && finding.type !== filterType) return false;
    return true;
  });

  // Sort: critical first
  const sortedFindings = [...filteredFindings].sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2, cosmetic: 3 };
    return order[a.finding.severity] - order[b.finding.severity];
  });

  const totalCostLow = allFindings.reduce((s, { finding }) => s + finding.estimatedRepairCost.low, 0);
  const totalCostHigh = allFindings.reduce((s, { finding }) => s + finding.estimatedRepairCost.high, 0);
  const criticalCount = allFindings.filter(f => f.finding.severity === 'critical').length;
  const proRequired = allFindings.filter(f => f.finding.requiresProfessional).length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Damage Findings</Text>
        <Text style={s.headerSub}>{inspection.propertyAddress}</Text>
      </View>

      {/* Summary bar */}
      <View style={s.summaryRow}>
        <View style={s.summaryItem}>
          <Text style={[s.summaryNum, { color: RED }]}>{criticalCount}</Text>
          <Text style={s.summaryLabel}>Critical</Text>
        </View>
        <View style={s.summaryDiv} />
        <View style={s.summaryItem}>
          <Text style={[s.summaryNum, { color: NAVY }]}>{allFindings.length}</Text>
          <Text style={s.summaryLabel}>Total</Text>
        </View>
        <View style={s.summaryDiv} />
        <View style={s.summaryItem}>
          <Text style={[s.summaryNum, { color: proRequired > 0 ? AMBER : GREEN }]}>{proRequired}</Text>
          <Text style={s.summaryLabel}>Need Pro</Text>
        </View>
        <View style={s.summaryDiv} />
        <View style={s.summaryItem}>
          <Text style={[s.summaryNum, { color: NAVY }]}>${(totalCostLow / 1000).toFixed(0)}k+</Text>
          <Text style={s.summaryLabel}>Est. Low</Text>
        </View>
      </View>

      {/* Cost estimate card */}
      {allFindings.length > 0 && (
        <View style={s.costCard}>
          <View style={s.costCardLeft}>
            <Text style={s.costCardLabel}>Total Estimated Repair Cost</Text>
            <Text style={s.costCardRange}>
              ${totalCostLow.toLocaleString()} – ${totalCostHigh.toLocaleString()}
            </Text>
          </View>
          <View style={[s.conditionBadge, { backgroundColor: `${
            inspection.overallCondition === 'excellent' ? GREEN :
            inspection.overallCondition === 'good' ? GREEN :
            inspection.overallCondition === 'fair' ? AMBER :
            inspection.overallCondition === 'poor' ? ORANGE : RED
          }20` }]}>
            <Text style={[s.conditionText, { color:
              inspection.overallCondition === 'excellent' ? GREEN :
              inspection.overallCondition === 'good' ? GREEN :
              inspection.overallCondition === 'fair' ? AMBER :
              inspection.overallCondition === 'poor' ? ORANGE : RED
            }]}>
              {inspection.overallCondition.charAt(0).toUpperCase() + inspection.overallCondition.slice(1)} Condition
            </Text>
          </View>
        </View>
      )}

      {/* Severity filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        <TouchableOpacity style={[s.filterChip, filterSeverity === 'all' && s.filterChipActive]} onPress={() => setFilterSeverity('all')}>
          <Text style={[s.filterText, filterSeverity === 'all' && s.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {(Object.entries(SEVERITY_CONFIG) as [Severity, typeof SEVERITY_CONFIG[Severity]][]).map(([key, val]) => {
          const count = allFindings.filter(f => f.finding.severity === key).length;
          if (count === 0) return null;
          return (
            <TouchableOpacity key={key} style={[s.filterChip, filterSeverity === key && { borderColor: val.color, backgroundColor: `${val.color}10` }]} onPress={() => setFilterSeverity(key)}>
              <Text style={[s.filterText, filterSeverity === key && { color: val.color }]}>{val.label} ({count})</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {sortedFindings.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{allFindings.length === 0 ? '✅' : '🔍'}</Text>
            <Text style={s.emptyTitle}>{allFindings.length === 0 ? 'No findings yet' : 'No findings match filter'}</Text>
            <Text style={s.emptySub}>{allFindings.length === 0 ? 'Use the Scan tab to document damage findings.' : 'Try removing filters to see all findings.'}</Text>
          </View>
        ) : (
          sortedFindings.map(({ finding, roomName }) => (
            <FindingCard key={finding.id} finding={finding} roomName={roomName} />
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: NAVY },
  headerSub: { fontSize: 11, color: TEXT2, marginTop: 2 },

  summaryRow: { flexDirection: 'row', backgroundColor: CARD, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: TEXT2, marginTop: 2 },
  summaryDiv: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 6 },

  costCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: NAVY, paddingHorizontal: 16, paddingVertical: 12 },
  costCardLeft: {},
  costCardLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  costCardRange: { fontSize: 16, fontWeight: '800', color: '#fff', marginTop: 2 },
  conditionBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  conditionText: { fontSize: 12, fontWeight: '700' },

  filterScroll: { backgroundColor: CARD, maxHeight: 50, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  filterChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  filterChipActive: { borderColor: NAVY, backgroundColor: `${NAVY}10` },
  filterText: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  filterTextActive: { color: NAVY },

  scroll: { flex: 1 },
  content: { padding: 16 },

  findingCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB', borderTopWidth: 4 },
  findingTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  findingTypeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  findingMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  findingSeverity: { fontSize: 12, fontWeight: '800' },
  findingSep: { fontSize: 11, color: TEXT2 },
  findingType: { fontSize: 12, fontWeight: '600' },
  findingLocation: { fontSize: 11, color: TEXT2 },
  confidenceChip: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  confidenceText: { fontSize: 11, color: NAVY, fontWeight: '700' },
  findingDesc: { fontSize: 12, color: TEXT2, lineHeight: 18, marginBottom: 8 },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  costLabel: { fontSize: 11, color: TEXT2 },
  costValue: { fontSize: 13, fontWeight: '700', color: NAVY },
  expandedDetail: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  aiNotesBlock: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, marginBottom: 8 },
  aiNotesTitle: { fontSize: 11, fontWeight: '700', color: NAVY, marginBottom: 4 },
  aiNotesText: { fontSize: 12, color: TEXT2, lineHeight: 17 },
  proNote: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${RED}08`, borderRadius: 8, padding: 8 },
  proNoteText: { fontSize: 12, color: RED, fontWeight: '600' },
  expandRow: { alignItems: 'center', marginTop: 8 },

  noData: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  noDataIcon: { fontSize: 48, marginBottom: 12 },
  noDataTitle: { fontSize: 17, fontWeight: '700', color: TEXT, marginBottom: 6 },
  noDataSub: { fontSize: 13, color: TEXT2, textAlign: 'center' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: TEXT, marginBottom: 6 },
  emptySub: { fontSize: 13, color: TEXT2, textAlign: 'center' },
});
