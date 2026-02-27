import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInspectionStore, DamageType, Severity } from '../../store/inspection-store';

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
const BORDER = '#E5E7EB';

const DAMAGE_LABELS: Record<DamageType, string> = {
  structural: 'Structural',
  water: 'Water',
  fire: 'Fire',
  wind: 'Wind',
  vandalism: 'Vandalism',
  wear: 'Normal Wear',
  other: 'Other',
};

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string }> = {
  critical: { label: 'Critical', color: RED },
  major: { label: 'Major', color: ORANGE },
  minor: { label: 'Minor', color: AMBER },
  cosmetic: { label: 'Cosmetic', color: GREEN },
};

const CONDITION_COLORS: Record<string, string> = {
  excellent: GREEN,
  good: GREEN,
  fair: AMBER,
  poor: ORANGE,
  critical: RED,
};

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={s.sectionHeader}>
      <Ionicons name={icon as any} size={16} color={NAVY} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, bold && { fontWeight: '700', color: TEXT }]}>{value}</Text>
    </View>
  );
}

export default function ReportScreen() {
  const { inspections, activeInspectionId, submitInspection } = useInspectionStore();
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const inspection = inspections.find(i => i.id === activeInspectionId) ?? inspections[0];

  if (!inspection) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.noData}>
          <Text style={s.noDataIcon}>📋</Text>
          <Text style={s.noDataTitle}>No Active Inspection</Text>
          <Text style={s.noDataSub}>Select an inspection from the Inspections tab to generate a report.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Flatten all findings
  const allFindings = inspection.rooms.flatMap(room =>
    room.findings.map(f => ({ finding: f, roomName: room.name }))
  );

  const totalCostLow = allFindings.reduce((s, { finding }) => s + finding.estimatedRepairCost.low, 0);
  const totalCostHigh = allFindings.reduce((s, { finding }) => s + finding.estimatedRepairCost.high, 0);
  const criticalCount = allFindings.filter(f => f.finding.severity === 'critical').length;
  const proRequired = allFindings.filter(f => f.finding.requiresProfessional).length;
  const completedRooms = inspection.rooms.filter(r => r.completed).length;

  // Group findings by damage type for cost breakdown
  const costByType: Record<string, { low: number; high: number; count: number }> = {};
  allFindings.forEach(({ finding }) => {
    const key = finding.type;
    if (!costByType[key]) costByType[key] = { low: 0, high: 0, count: 0 };
    costByType[key].low += finding.estimatedRepairCost.low;
    costByType[key].high += finding.estimatedRepairCost.high;
    costByType[key].count += 1;
  });

  // Group findings by severity
  const bySeverity: Record<Severity, number> = { critical: 0, major: 0, minor: 0, cosmetic: 0 };
  allFindings.forEach(({ finding }) => { bySeverity[finding.severity] += 1; });

  const conditionColor = CONDITION_COLORS[inspection.overallCondition] ?? AMBER;
  const isSubmittable = inspection.status !== 'submitted' && !submitted;

  const handleExportPDF = () => {
    Alert.alert(
      'Export PDF',
      'Your inspection report PDF is being generated and will be saved to your device.',
      [{ text: 'OK' }]
    );
  };

  const handleSubmitClaim = () => {
    Alert.alert(
      'Submit to Insurance',
      `Submit inspection report for ${inspection.propertyAddress}?\n\nEstimated repair: $${totalCostLow.toLocaleString()} – $${totalCostHigh.toLocaleString()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            submitInspection(inspection.id);
            setSubmitted(true);
            Alert.alert('Submitted', 'Report submitted successfully. Claim reference: CLM-' + Math.floor(Math.random() * 90000 + 10000));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Inspection Report</Text>
        <View style={[s.statusBadge, {
          backgroundColor: inspection.status === 'submitted' || submitted
            ? `${GREEN}15` : inspection.status === 'completed' ? `${BLUE}15` : `${AMBER}15`
        }]}>
          <Text style={[s.statusText, {
            color: inspection.status === 'submitted' || submitted ? GREEN
              : inspection.status === 'completed' ? BLUE : AMBER
          }]}>
            {submitted || inspection.status === 'submitted' ? 'Submitted' :
              inspection.status === 'completed' ? 'Completed' : 'In Progress'}
          </Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Report ID banner */}
        <View style={s.reportBanner}>
          <View>
            <Text style={s.reportBannerLabel}>Report Reference</Text>
            <Text style={s.reportBannerId}>RPT-{inspection.id.slice(-6).toUpperCase()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.reportBannerLabel}>Report Date</Text>
            <Text style={s.reportBannerDate}>{new Date(inspection.inspectionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
          </View>
        </View>

        {/* Property Details */}
        <View style={s.card}>
          <SectionHeader title="Property Details" icon="home-outline" />
          <InfoRow label="Address" value={inspection.propertyAddress} bold />
          <InfoRow label="Client" value={inspection.clientName} />
          <InfoRow label="Claim Number" value={inspection.claimNumber} />
          <InfoRow label="Inspector" value={inspection.inspectorName} />
          <InfoRow label="Inspection Date" value={new Date(inspection.inspectionDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })} />
          <InfoRow label="Rooms Inspected" value={`${completedRooms} of ${inspection.rooms.length}`} />
        </View>

        {/* Overall Condition */}
        <View style={s.card}>
          <SectionHeader title="Overall Assessment" icon="shield-checkmark-outline" />
          <View style={s.conditionRow}>
            <View style={[s.conditionBadgeLarge, { backgroundColor: `${conditionColor}15`, borderColor: conditionColor }]}>
              <Text style={[s.conditionTextLarge, { color: conditionColor }]}>
                {inspection.overallCondition.charAt(0).toUpperCase() + inspection.overallCondition.slice(1)} Condition
              </Text>
            </View>
            <View style={s.conditionStats}>
              <View style={s.condStat}>
                <Text style={[s.condStatNum, { color: RED }]}>{criticalCount}</Text>
                <Text style={s.condStatLabel}>Critical</Text>
              </View>
              <View style={s.condStat}>
                <Text style={[s.condStatNum, { color: NAVY }]}>{allFindings.length}</Text>
                <Text style={s.condStatLabel}>Findings</Text>
              </View>
              <View style={s.condStat}>
                <Text style={[s.condStatNum, { color: proRequired > 0 ? AMBER : GREEN }]}>{proRequired}</Text>
                <Text style={s.condStatLabel}>Need Pro</Text>
              </View>
            </View>
          </View>

          {/* Severity breakdown */}
          <View style={s.severityGrid}>
            {(Object.entries(bySeverity) as [Severity, number][]).map(([sev, count]) => (
              <View key={sev} style={[s.sevCell, { borderTopColor: SEVERITY_CONFIG[sev].color }]}>
                <Text style={[s.sevCount, { color: SEVERITY_CONFIG[sev].color }]}>{count}</Text>
                <Text style={s.sevLabel}>{SEVERITY_CONFIG[sev].label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cost Estimate */}
        <View style={[s.card, { backgroundColor: NAVY }]}>
          <View style={s.costHeader}>
            <View>
              <Text style={s.costHeaderLabel}>Total Estimated Repair Cost</Text>
              <Text style={s.costHeaderRange}>
                ${totalCostLow.toLocaleString()} – ${totalCostHigh.toLocaleString()}
              </Text>
            </View>
            <Ionicons name="calculator-outline" size={28} color="rgba(255,255,255,0.4)" />
          </View>
        </View>

        {/* Cost by Damage Type */}
        {Object.keys(costByType).length > 0 && (
          <View style={s.card}>
            <SectionHeader title="Cost by Damage Type" icon="pie-chart-outline" />
            {(Object.entries(costByType) as [DamageType, { low: number; high: number; count: number }][]).map(([type, costs]) => (
              <View key={type} style={s.costTypeRow}>
                <View style={s.costTypeLeft}>
                  <Text style={s.costTypeName}>{DAMAGE_LABELS[type]}</Text>
                  <Text style={s.costTypeCount}>{costs.count} finding{costs.count !== 1 ? 's' : ''}</Text>
                </View>
                <Text style={s.costTypeRange}>
                  ${costs.low.toLocaleString()} – ${costs.high.toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={s.costTotalRow}>
              <Text style={s.costTotalLabel}>Total</Text>
              <Text style={s.costTotalValue}>${totalCostLow.toLocaleString()} – ${totalCostHigh.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Room-by-room Summary */}
        <View style={s.card}>
          <SectionHeader title="Room Summary" icon="layers-outline" />
          {inspection.rooms.map(room => {
            const roomFindings = room.findings;
            const roomCritical = roomFindings.filter(f => f.severity === 'critical').length;
            const roomCostLow = roomFindings.reduce((acc, f) => acc + f.estimatedRepairCost.low, 0);
            const roomCostHigh = roomFindings.reduce((acc, f) => acc + f.estimatedRepairCost.high, 0);
            return (
              <View key={room.id} style={s.roomRow}>
                <View style={[s.roomStatusDot, { backgroundColor: room.completed ? GREEN : room.findings.length > 0 ? AMBER : BORDER }]} />
                <View style={{ flex: 1 }}>
                  <View style={s.roomRowTop}>
                    <Text style={s.roomName}>{room.name}</Text>
                    <Text style={s.roomStatus}>
                      {room.completed ? '✓ Complete' : room.findings.length > 0 ? 'In Progress' : 'Pending'}
                    </Text>
                  </View>
                  {roomFindings.length > 0 ? (
                    <View style={s.roomMeta}>
                      <Text style={s.roomMetaText}>{roomFindings.length} finding{roomFindings.length !== 1 ? 's' : ''}</Text>
                      {roomCritical > 0 && <Text style={[s.roomMetaText, { color: RED }]}> · {roomCritical} critical</Text>}
                      <Text style={s.roomMetaText}> · ${roomCostLow.toLocaleString()}–${roomCostHigh.toLocaleString()}</Text>
                    </View>
                  ) : (
                    <Text style={s.roomNoFindings}>No findings recorded</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Findings Detail */}
        {allFindings.length > 0 && (
          <View style={s.card}>
            <SectionHeader title="Findings Detail" icon="list-outline" />
            {allFindings.map(({ finding, roomName }, idx) => {
              const sev = SEVERITY_CONFIG[finding.severity];
              return (
                <View key={finding.id} style={[s.findingRow, idx < allFindings.length - 1 && s.findingRowBorder]}>
                  <View style={[s.findingDot, { backgroundColor: sev.color }]} />
                  <View style={{ flex: 1 }}>
                    <View style={s.findingRowTop}>
                      <Text style={[s.findingRowSev, { color: sev.color }]}>{sev.label}</Text>
                      <Text style={s.findingRowType}>{DAMAGE_LABELS[finding.type]}</Text>
                      <Text style={s.findingRowRoom}>{roomName}</Text>
                    </View>
                    <Text style={s.findingRowLoc}>{finding.location}</Text>
                    <Text style={s.findingRowDesc} numberOfLines={2}>{finding.description}</Text>
                    <Text style={s.findingRowCost}>
                      Est. repair: ${finding.estimatedRepairCost.low.toLocaleString()} – ${finding.estimatedRepairCost.high.toLocaleString()}
                      {'  ·  '}{finding.confidenceScore}% confidence
                    </Text>
                    {finding.requiresProfessional && (
                      <View style={s.proFlag}>
                        <Ionicons name="warning" size={11} color={RED} />
                        <Text style={s.proFlagText}>Professional assessment required</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Inspector Notes */}
        <View style={s.card}>
          <SectionHeader title="Inspector Notes" icon="create-outline" />
          <TextInput
            style={s.notesInput}
            value={inspectorNotes}
            onChangeText={setInspectorNotes}
            placeholder="Add inspection notes, observations, or recommendations..."
            placeholderTextColor={TEXT2}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={TEXT2} />
          <Text style={s.disclaimerText}>
            This report is based on visual inspection only. Cost estimates are approximate and may vary based on contractor assessment. This report does not constitute an appraisal or guarantee of covered losses.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={s.actionBlock}>
          <TouchableOpacity style={s.exportBtn} onPress={handleExportPDF} activeOpacity={0.85}>
            <Ionicons name="document-text-outline" size={18} color={NAVY} />
            <Text style={s.exportBtnText}>Export PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.submitBtn, (!isSubmittable) && s.submitBtnDisabled]}
            onPress={isSubmittable ? handleSubmitClaim : undefined}
            activeOpacity={isSubmittable ? 0.85 : 1}
          >
            <Ionicons name="send-outline" size={18} color="#fff" />
            <Text style={s.submitBtnText}>
              {submitted || inspection.status === 'submitted' ? 'Report Submitted' : 'Submit to Insurance'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: NAVY },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },

  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },

  reportBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: NAVY, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  reportBannerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  reportBannerId: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  reportBannerDate: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },

  card: {
    backgroundColor: CARD, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: NAVY },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  infoLabel: { fontSize: 12, color: TEXT2, flex: 1 },
  infoValue: { fontSize: 12, color: TEXT, flex: 2, textAlign: 'right' },

  conditionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  conditionBadgeLarge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  conditionTextLarge: { fontSize: 13, fontWeight: '700' },
  conditionStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  condStat: { alignItems: 'center' },
  condStatNum: { fontSize: 20, fontWeight: '800' },
  condStatLabel: { fontSize: 10, color: TEXT2, marginTop: 1 },

  severityGrid: { flexDirection: 'row', gap: 8 },
  sevCell: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    backgroundColor: '#F8FAFC', borderRadius: 8, borderTopWidth: 3,
  },
  sevCount: { fontSize: 16, fontWeight: '800' },
  sevLabel: { fontSize: 10, color: TEXT2, marginTop: 2 },

  costHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  costHeaderLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  costHeaderRange: { fontSize: 22, fontWeight: '800', color: '#fff' },

  costTypeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  costTypeLeft: {},
  costTypeName: { fontSize: 12, fontWeight: '600', color: TEXT },
  costTypeCount: { fontSize: 11, color: TEXT2, marginTop: 1 },
  costTypeRange: { fontSize: 12, fontWeight: '700', color: NAVY },
  costTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 8,
  },
  costTotalLabel: { fontSize: 13, fontWeight: '700', color: NAVY },
  costTotalValue: { fontSize: 14, fontWeight: '800', color: NAVY },

  roomRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  roomStatusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  roomRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  roomName: { fontSize: 13, fontWeight: '600', color: TEXT, flex: 1 },
  roomStatus: { fontSize: 11, color: TEXT2 },
  roomMeta: { flexDirection: 'row', flexWrap: 'wrap' },
  roomMetaText: { fontSize: 11, color: TEXT2 },
  roomNoFindings: { fontSize: 11, color: TEXT2, fontStyle: 'italic' },

  findingRow: { flexDirection: 'row', gap: 10, paddingVertical: 10 },
  findingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  findingDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  findingRowTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  findingRowSev: { fontSize: 11, fontWeight: '800' },
  findingRowType: { fontSize: 11, color: TEXT2 },
  findingRowRoom: { fontSize: 11, color: TEXT2, marginLeft: 'auto' },
  findingRowLoc: { fontSize: 11, color: TEXT2, marginBottom: 2 },
  findingRowDesc: { fontSize: 12, color: TEXT, lineHeight: 16, marginBottom: 4 },
  findingRowCost: { fontSize: 11, color: TEXT2 },
  proFlag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  proFlagText: { fontSize: 11, color: RED, fontWeight: '600' },

  notesInput: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 10,
    padding: 10, fontSize: 13, color: TEXT, minHeight: 80,
    backgroundColor: '#F8FAFC',
  },

  disclaimer: {
    flexDirection: 'row', gap: 6, padding: 12,
    backgroundColor: '#F1F5F9', borderRadius: 10,
  },
  disclaimerText: { fontSize: 11, color: TEXT2, lineHeight: 16, flex: 1 },

  actionBlock: { gap: 10 },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: NAVY,
    backgroundColor: CARD,
  },
  exportBtnText: { fontSize: 15, fontWeight: '700', color: NAVY },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 12, backgroundColor: NAVY,
  },
  submitBtnDisabled: { backgroundColor: '#94A3B8' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  noData: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  noDataIcon: { fontSize: 48, marginBottom: 12 },
  noDataTitle: { fontSize: 17, fontWeight: '700', color: TEXT, marginBottom: 6 },
  noDataSub: { fontSize: 13, color: TEXT2, textAlign: 'center' },
});
