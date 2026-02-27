import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format, isThisWeek, isThisMonth } from 'date-fns';
import { useInspectionStore, type Inspection } from '@/stores/inspections';
import { generateComplianceReport, type HazardAnalysis } from '@/services/ai';
import { COLORS, SCORE_COLORS, VIOLATION_SEVERITY_COLORS } from '@/constants/theme';

type DateFilter = 'week' | 'month' | 'all';

// Sparkline component for trend visualization
function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length === 0) return null;
  const maxScore = 100;
  const height = 40;
  const barW = 16;
  return (
    <View style={sparkStyles.container}>
      {scores.map((score, i) => {
        const barH = Math.max(4, (score / maxScore) * height);
        const color = SCORE_COLORS.getColor(score);
        return (
          <View key={i} style={sparkStyles.barWrapper}>
            <View
              style={[
                sparkStyles.bar,
                {
                  height: barH,
                  width: barW,
                  backgroundColor: color,
                  borderRadius: 3,
                },
              ]}
            />
            <Text style={sparkStyles.barLabel}>{score}</Text>
          </View>
        );
      })}
    </View>
  );
}

const sparkStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    paddingVertical: 8,
  },
  barWrapper: { alignItems: 'center', gap: 2 },
  bar: {},
  barLabel: { fontSize: 9, color: COLORS.textSecondary, fontWeight: '600' },
});

interface InspectionDetailProps {
  inspection: Inspection;
  onClose: () => void;
}

function InspectionDetail({ inspection, onClose }: InspectionDetailProps) {
  const insets = useSafeAreaInsets();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const score = inspection.overallScore ?? 100;
  const scoreColor = SCORE_COLORS.getColor(score);

  const violationCounts = useMemo(() => {
    const all = inspection.areas.flatMap((a) => a.analysis?.violations ?? []);
    return {
      critical: all.filter((v) => v.severity === 'critical').length,
      high: all.filter((v) => v.severity === 'high').length,
      medium: all.filter((v) => v.severity === 'medium').length,
      low: all.filter((v) => v.severity === 'low').length,
      total: all.length,
    };
  }, [inspection]);

  const handleGenerateReport = useCallback(async () => {
    try {
      setGeneratingReport(true);
      const areasWithAnalysis = inspection.areas
        .filter((a): a is typeof a & { analysis: HazardAnalysis } =>
          a.analysis !== undefined,
        )
        .map((a) => ({ name: a.areaName, analysis: a.analysis }));

      const text = await generateComplianceReport(
        inspection.facilityName,
        inspection.inspectorName,
        format(new Date(inspection.createdAt), 'MMMM d, yyyy'),
        areasWithAnalysis,
        score,
      );
      setReportText(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate report';
      Alert.alert('Error', msg);
    } finally {
      setGeneratingReport(false);
    }
  }, [inspection, score]);

  const handleExportPdf = useCallback(async () => {
    if (!reportText) {
      Alert.alert('No Report', 'Generate a report first before exporting.');
      return;
    }
    try {
      setExportingPdf(true);
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1C1917; line-height: 1.6; }
            h1 { color: #DC2626; font-size: 24px; margin-bottom: 4px; }
            h2 { color: #B91C1C; font-size: 18px; margin-top: 24px; border-bottom: 2px solid #FEE2E2; padding-bottom: 6px; }
            .meta { color: #78716C; font-size: 14px; margin-bottom: 24px; }
            .score { font-size: 48px; font-weight: 800; color: ${scoreColor}; }
            pre { white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>OSHA Compliance Inspection Report</h1>
          <div class="meta">
            <strong>Facility:</strong> ${inspection.facilityName}<br/>
            <strong>Type:</strong> ${inspection.facilityType}<br/>
            <strong>Inspector:</strong> ${inspection.inspectorName}<br/>
            <strong>Date:</strong> ${format(new Date(inspection.createdAt), 'MMMM d, yyyy')}<br/>
            <strong>Overall Score:</strong> <span class="score">${score}</span>/100
          </div>
          <pre>${reportText}</pre>
        </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Compliance Report - ${inspection.facilityName}`,
        });
      } else {
        Alert.alert('PDF Saved', `Report saved to: ${uri}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'PDF export failed';
      Alert.alert('Export Error', msg);
    } finally {
      setExportingPdf(false);
    }
  }, [reportText, inspection, score, scoreColor]);

  const statusColors: Record<string, string> = {
    in_progress: '#D97706',
    review: '#EA580C',
    submitted: '#16A34A',
  };
  const statusLabels: Record<string, string> = {
    in_progress: 'In Progress',
    review: 'In Review',
    submitted: 'Submitted',
  };

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[detailStyles.container, { paddingTop: insets.top }]}>
        {/* Detail Header */}
        <View style={detailStyles.header}>
          <TouchableOpacity onPress={onClose} style={detailStyles.backBtn}>
            <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={detailStyles.headerTitle} numberOfLines={1}>
              {inspection.facilityName}
            </Text>
            <Text style={detailStyles.headerSub}>
              {format(new Date(inspection.createdAt), 'MMM d, yyyy')}
            </Text>
          </View>
          <View
            style={[
              detailStyles.statusBadge,
              {
                backgroundColor:
                  (statusColors[inspection.status] ?? COLORS.textSecondary) + '30',
              },
            ]}
          >
            <Text
              style={[
                detailStyles.statusText,
                { color: statusColors[inspection.status] ?? COLORS.textSecondary },
              ]}
            >
              {statusLabels[inspection.status] ?? inspection.status}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={detailStyles.content}>
          {/* Score Gauge */}
          <View style={detailStyles.scoreCard}>
            <View style={[detailStyles.scoreCircle, { borderColor: scoreColor }]}>
              <Text style={[detailStyles.scoreNum, { color: scoreColor }]}>
                {score}
              </Text>
              <Text style={detailStyles.scoreOf}>/ 100</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={detailStyles.scoreLabel}>
                {SCORE_COLORS.getLabel(score)} Compliance
              </Text>
              <Text style={detailStyles.scoreSub}>
                {inspection.areas.length} area
                {inspection.areas.length !== 1 ? 's' : ''} inspected ·{' '}
                {inspection.inspectorName}
              </Text>
              <Text style={detailStyles.scoreSub}>{inspection.facilityType}</Text>
            </View>
          </View>

          {/* Violation Summary */}
          <Text style={detailStyles.sectionTitle}>Violation Summary</Text>
          <View style={detailStyles.violationSummary}>
            {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
              const count = violationCounts[sev];
              const color = VIOLATION_SEVERITY_COLORS[sev];
              return (
                <View
                  key={sev}
                  style={[detailStyles.sevChip, { backgroundColor: color + '20' }]}
                >
                  <Text style={[detailStyles.sevCount, { color }]}>{count}</Text>
                  <Text style={[detailStyles.sevLabel, { color }]}>
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Areas List */}
          <Text style={detailStyles.sectionTitle}>Inspected Areas</Text>
          {inspection.areas.map((area) => {
            const areaScore = area.analysis?.complianceScore ?? 100;
            const areaColor = SCORE_COLORS.getColor(areaScore);
            return (
              <View key={area.id} style={detailStyles.areaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={detailStyles.areaName}>{area.areaName}</Text>
                  <Text style={detailStyles.areaMeta}>
                    {area.analysis?.violations.length ?? 0} violation
                    {(area.analysis?.violations.length ?? 0) !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={[detailStyles.areaScore, { borderColor: areaColor }]}>
                  <Text style={[detailStyles.areaScoreNum, { color: areaColor }]}>
                    {areaScore}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Report Text Preview */}
          {reportText && (
            <View style={detailStyles.reportPreview}>
              <Text style={detailStyles.sectionTitle}>Report Preview</Text>
              <ScrollView
                style={detailStyles.reportScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                <Text style={detailStyles.reportText}>{reportText}</Text>
              </ScrollView>
            </View>
          )}

          {/* Actions */}
          <View style={detailStyles.actions}>
            <TouchableOpacity
              style={[detailStyles.actionBtn, detailStyles.actionBtnSecondary]}
              onPress={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
              )}
              <Text style={detailStyles.actionBtnSecondaryText}>
                {generatingReport ? 'Generating...' : 'Generate Report'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[detailStyles.actionBtn, detailStyles.actionBtnPrimary]}
              onPress={handleExportPdf}
              disabled={exportingPdf || !reportText}
            >
              {exportingPdf ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              )}
              <Text style={detailStyles.actionBtnPrimaryText}>
                {exportingPdf ? 'Exporting...' : 'Export PDF'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  headerSub: { color: '#FCA5A5', fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 11, fontWeight: '700' },
  content: { padding: 16, gap: 8 },
  scoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  scoreNum: { fontSize: 24, fontWeight: '800' },
  scoreOf: { fontSize: 11, color: COLORS.textSecondary },
  scoreLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  scoreSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  violationSummary: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  sevChip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  sevCount: { fontSize: 18, fontWeight: '800' },
  sevLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  areaRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  areaName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  areaMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  areaScore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  areaScoreNum: { fontSize: 14, fontWeight: '800' },
  reportPreview: { marginTop: 8 },
  reportScroll: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    maxHeight: 240,
  },
  reportText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  actionBtnPrimary: { backgroundColor: COLORS.primary },
  actionBtnSecondary: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  actionBtnPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  actionBtnSecondaryText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);

  const inspections = useInspectionStore((s) => s.inspections);

  const filteredInspections = useMemo(() => {
    if (dateFilter === 'week') {
      return inspections.filter((i) =>
        isThisWeek(new Date(i.createdAt), { weekStartsOn: 1 }),
      );
    }
    if (dateFilter === 'month') {
      return inspections.filter((i) => isThisMonth(new Date(i.createdAt)));
    }
    return inspections;
  }, [inspections, dateFilter]);

  const completedScores = useMemo(() => {
    return filteredInspections
      .filter((i) => i.overallScore !== undefined)
      .map((i) => i.overallScore as number)
      .slice(-8);
  }, [filteredInspections]);

  const avgScore = useMemo(() => {
    if (completedScores.length === 0) return null;
    return Math.round(
      completedScores.reduce((a, b) => a + b, 0) / completedScores.length,
    );
  }, [completedScores]);

  const statusColors: Record<string, string> = {
    in_progress: '#D97706',
    review: '#EA580C',
    submitted: '#16A34A',
  };
  const statusLabels: Record<string, string> = {
    in_progress: 'In Progress',
    review: 'In Review',
    submitted: 'Submitted',
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="document-text" size={22} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Reports & History</Text>
      </View>

      {/* Date Filter */}
      <View style={styles.filterRow}>
        {(['week', 'month', 'all'] as DateFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, dateFilter === f && styles.filterTabActive]}
            onPress={() => setDateFilter(f)}
          >
            <Text
              style={[
                styles.filterTabText,
                dateFilter === f && styles.filterTabTextActive,
              ]}
            >
              {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Trend Sparkline */}
        {completedScores.length > 1 && (
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendTitle}>Compliance Trend</Text>
              {avgScore !== null && (
                <Text
                  style={[
                    styles.trendAvg,
                    { color: SCORE_COLORS.getColor(avgScore) },
                  ]}
                >
                  Avg: {avgScore}
                </Text>
              )}
            </View>
            <Sparkline scores={completedScores} />
            <Text style={styles.trendSub}>
              Last {completedScores.length} completed inspections
            </Text>
          </View>
        )}

        {/* Inspections List */}
        {filteredInspections.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={52} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Inspections Found</Text>
            <Text style={styles.emptySubtitle}>
              {dateFilter !== 'all'
                ? 'No inspections in this time period.'
                : 'Start scanning to create your first inspection.'}
            </Text>
          </View>
        ) : (
          filteredInspections.map((insp) => {
            const score = insp.overallScore ?? 100;
            const scoreColor = SCORE_COLORS.getColor(score);
            const statusColor =
              statusColors[insp.status] ?? COLORS.textSecondary;
            const violationCount = insp.areas.flatMap(
              (a) => a.analysis?.violations ?? [],
            ).length;
            return (
              <TouchableOpacity
                key={insp.id}
                style={styles.inspectionCard}
                onPress={() => setSelectedInspection(insp)}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardFacility} numberOfLines={1}>
                      {insp.facilityName}
                    </Text>
                    <Text style={styles.cardDate}>
                      {format(new Date(insp.createdAt), 'MMM d, yyyy · h:mm a')}
                    </Text>
                    <Text style={styles.cardType}>{insp.facilityType}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <View
                      style={[
                        styles.cardScore,
                        { borderColor: scoreColor },
                      ]}
                    >
                      <Text
                        style={[styles.cardScoreNum, { color: scoreColor }]}
                      >
                        {score}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor + '20' },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusLabels[insp.status] ?? insp.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Score bar */}
                <View style={styles.scoreBarRow}>
                  <View style={styles.scoreBarTrack}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        { width: `${score}%`, backgroundColor: scoreColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.violationCount}>
                    {violationCount} violation{violationCount !== 1 ? 's' : ''}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardAreas}>
                    {insp.areas.length} area{insp.areas.length !== 1 ? 's' : ''} ·{' '}
                    {insp.inspectorName}
                  </Text>
                  <View style={styles.cardAction}>
                    <Text style={styles.cardActionText}>View Report</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={COLORS.primary}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <InspectionDetail
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  filterTabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterTabTextActive: { color: COLORS.primary },
  listContent: { padding: 16, gap: 4 },
  trendCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  trendAvg: { fontSize: 14, fontWeight: '800' },
  trendSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  inspectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardFacility: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cardDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  cardType: { fontSize: 12, color: COLORS.textSecondary },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardScore: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  cardScoreNum: { fontSize: 16, fontWeight: '800' },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: { height: 6, borderRadius: 3 },
  violationCount: { fontSize: 11, color: COLORS.textSecondary, minWidth: 60 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAreas: { fontSize: 12, color: COLORS.textSecondary },
  cardAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  cardActionText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
