import { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { useInspectionStore } from '@/stores/inspections';
import { COLORS, SCORE_COLORS, VIOLATION_SEVERITY_COLORS } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAUGE_SIZE = 140;

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function ScoreGauge({ score, size = GAUGE_SIZE }: ScoreGaugeProps) {
  const color = SCORE_COLORS.getColor(score);
  const label = SCORE_COLORS.getLabel(score);
  return (
    <View style={[styles.gauge, { width: size, height: size }]}>
      <View
        style={[
          styles.gaugeRing,
          { width: size, height: size, borderRadius: size / 2, borderColor: color },
        ]}
      >
        <View style={[styles.gaugeInner, { borderRadius: (size - 20) / 2 }]}>
          <Text style={[styles.gaugeScore, { color }]}>{score}</Text>
          <Text style={styles.gaugeLabel}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  highlight?: boolean;
  color?: string;
}

function StatCard({ label, value, icon, highlight, color }: StatCardProps) {
  const tint = color ?? (highlight ? COLORS.primary : COLORS.text);
  return (
    <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
      <Ionicons name={icon} size={20} color={tint} />
      <Text style={[styles.statValue, { color: tint }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const inspections = useInspectionStore((s) => s.inspections);
  const getAllOpenViolations = useInspectionStore((s) => s.getAllOpenViolations);
  const setActiveInspection = useInspectionStore((s) => s.setActiveInspection);

  const openViolations = getAllOpenViolations();
  const activeInspections = inspections.filter(
    (i) => i.status === 'in_progress',
  );
  const criticalViolations = openViolations.filter(
    (v) => v.violation.severity === 'critical',
  );
  const highViolations = openViolations.filter(
    (v) => v.violation.severity === 'high',
  );

  const completedInspections = inspections.filter(
    (i) => i.status === 'submitted',
  );
  const avgScore =
    completedInspections.length > 0
      ? Math.round(
          completedInspections.reduce(
            (acc, i) => acc + (i.overallScore ?? 100),
            0,
          ) / completedInspections.length,
        )
      : 100;

  const recentInspections = inspections.slice(0, 5);
  const topViolations = openViolations.slice(0, 3);

  const handleStartInspection = useCallback(() => {
    setActiveInspection(null);
    router.push('/(tabs)/scan');
  }, [setActiveInspection]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield" size={28} color="#FFFFFF" />
          <Text style={styles.headerTitle}>ComplianceSnap</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Compliance Score Gauge */}
        <View style={styles.gaugeSection}>
          <Text style={styles.sectionTitle}>Overall Compliance</Text>
          <Text style={styles.sectionSubtitle}>
            Across {completedInspections.length} completed inspection
            {completedInspections.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.gaugeCenter}>
            <ScoreGauge score={avgScore} />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Active"
            value={activeInspections.length}
            icon="clipboard-outline"
          />
          <StatCard
            label="Open Violations"
            value={openViolations.length}
            icon="warning-outline"
            highlight={openViolations.length > 0}
          />
          <StatCard
            label="Critical"
            value={criticalViolations.length}
            icon="alert-circle"
            highlight={criticalViolations.length > 0}
            color={criticalViolations.length > 0 ? '#7F1D1D' : COLORS.text}
          />
        </View>

        {/* Top Open Violations */}
        {topViolations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Open Violations</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/violations')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {topViolations.map((item, idx) => {
              const sev = item.violation.severity;
              const sevColor =
                VIOLATION_SEVERITY_COLORS[sev as keyof typeof VIOLATION_SEVERITY_COLORS] ??
                COLORS.textSecondary;
              return (
                <View key={idx} style={styles.violationCard}>
                  <View
                    style={[styles.severityDot, { backgroundColor: sevColor }]}
                  />
                  <View style={styles.violationBody}>
                    <Text style={styles.violationTitle} numberOfLines={1}>
                      {item.violation.violationType}
                    </Text>
                    <Text style={styles.violationMeta}>
                      {item.areaName} · {item.facilityName}
                    </Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: sevColor + '20' }]}>
                    <Text style={[styles.severityBadgeText, { color: sevColor }]}>
                      {sev.toUpperCase()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* High Priority Violations Summary */}
        {highViolations.length > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.alertText}>
              {highViolations.length} high-severity violation
              {highViolations.length > 1 ? 's' : ''} require immediate attention
            </Text>
          </View>
        )}

        {/* Recent Inspections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Inspections</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/reports')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentInspections.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={40} color={COLORS.border} />
              <Text style={styles.emptyText}>No inspections yet</Text>
              <Text style={styles.emptySubtext}>
                Tap "Start New Inspection" to begin
              </Text>
            </View>
          ) : (
            recentInspections.map((insp) => {
              const score = insp.overallScore ?? 100;
              const scoreColor = SCORE_COLORS.getColor(score);
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
              const statusColor = statusColors[insp.status] ?? COLORS.textSecondary;
              return (
                <TouchableOpacity
                  key={insp.id}
                  style={styles.inspectionCard}
                  onPress={() => router.push('/(tabs)/reports')}
                >
                  <View style={styles.inspectionCardTop}>
                    <Text style={styles.inspectionFacility} numberOfLines={1}>
                      {insp.facilityName}
                    </Text>
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
                  <Text style={styles.inspectionDate}>
                    {format(new Date(insp.createdAt), 'MMM d, yyyy · h:mm a')}
                  </Text>
                  <Text style={styles.inspectionType}>{insp.facilityType}</Text>
                  {/* Score bar */}
                  <View style={styles.scoreBar}>
                    <View style={styles.scoreBarTrack}>
                      <View
                        style={[
                          styles.scoreBarFill,
                          { width: `${score}%`, backgroundColor: scoreColor },
                        ]}
                      />
                    </View>
                    <Text style={[styles.scoreBarLabel, { color: scoreColor }]}>
                      {score}/100
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Start New Inspection FAB */}
      <View style={[styles.fabContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.fab} onPress={handleStartInspection}>
          <Ionicons name="camera" size={22} color="#FFFFFF" />
          <Text style={styles.fabText}>Start New Inspection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerAction: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  gaugeSection: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  gaugeCenter: { alignItems: 'center' },
  gauge: { alignItems: 'center', justifyContent: 'center' },
  gaugeRing: {
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeInner: {
    width: GAUGE_SIZE - 20,
    height: GAUGE_SIZE - 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  gaugeScore: { fontSize: 36, fontWeight: '800' },
  gaugeLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statCardHighlight: {
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  violationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  severityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  violationBody: { flex: 1 },
  violationTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  violationMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  severityBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  severityBadgeText: { fontSize: 10, fontWeight: '700' },
  alertBanner: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertText: { fontSize: 13, color: '#B91C1C', fontWeight: '500', flex: 1 },
  inspectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inspectionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  inspectionFacility: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  inspectionDate: { fontSize: 12, color: COLORS.textSecondary },
  inspectionType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  scoreBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: { height: 6, borderRadius: 3 },
  scoreBarLabel: { fontSize: 12, fontWeight: '700', minWidth: 36 },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  emptySubtext: { fontSize: 13, color: COLORS.border },
  fabContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  fab: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
