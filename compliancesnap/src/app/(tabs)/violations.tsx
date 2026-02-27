import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInspectionStore } from '@/stores/inspections';
import {
  COLORS,
  VIOLATION_SEVERITY_COLORS,
  WORKER_RISK_CONFIG,
} from '@/constants/theme';
import type { ViolationDetection } from '@/services/ai';

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

const FILTER_TABS: { key: SeverityFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

interface ViolationItemProps {
  violation: ViolationDetection;
  areaName: string;
  facilityName: string;
  inspectionId: string;
  onResolve: () => void;
}

function parseFineValue(fine?: string): number {
  if (!fine) return 0;
  const match = fine.replace(/,/g, '').match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1] ?? '0') : 0;
}

function ViolationItem({
  violation,
  areaName,
  facilityName,
  onResolve,
}: ViolationItemProps) {
  const [expanded, setExpanded] = useState(false);
  const sevColor =
    VIOLATION_SEVERITY_COLORS[
      violation.severity as keyof typeof VIOLATION_SEVERITY_COLORS
    ] ?? COLORS.textSecondary;

  const riskCfg =
    WORKER_RISK_CONFIG[
      violation.workerRisk as keyof typeof WORKER_RISK_CONFIG
    ] ?? WORKER_RISK_CONFIG.minimal;

  return (
    <View
      style={[
        styles.violationCard,
        { borderLeftColor: sevColor, borderLeftWidth: 4 },
      ]}
    >
      {/* Card Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.sevBadge, { backgroundColor: sevColor }]}>
            <Text style={styles.sevBadgeText}>
              {violation.severity.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.oshaText}>{violation.oshaStandard}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>

      <Text style={styles.violationType}>{violation.violationType}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
        <Text style={styles.metaText}>
          {areaName} · {facilityName}
        </Text>
      </View>

      {/* Worker Risk */}
      <View style={[styles.riskChip, { backgroundColor: riskCfg.color + '20' }]}>
        <Ionicons name="person" size={12} color={riskCfg.color} />
        <Text style={[styles.riskChipText, { color: riskCfg.color }]}>
          {riskCfg.label}
        </Text>
      </View>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.expandLabel}>Description</Text>
          <Text style={styles.expandText}>{violation.description}</Text>

          <Text style={styles.expandLabel}>Immediate Action Required</Text>
          <View style={styles.actionBox}>
            <Ionicons name="flash" size={14} color={COLORS.warning} />
            <Text style={styles.expandText}>{violation.immediateAction}</Text>
          </View>

          <Text style={styles.expandLabel}>Corrective Action</Text>
          <Text style={styles.expandText}>{violation.correctiveAction}</Text>

          {violation.estimatedFine && (
            <>
              <Text style={styles.expandLabel}>Estimated OSHA Fine</Text>
              <Text style={styles.fineText}>{violation.estimatedFine}</Text>
            </>
          )}

          <Text style={styles.expandLabel}>Area Affected</Text>
          <Text style={styles.expandText}>{violation.areaAffected}</Text>
        </View>
      )}

      {/* Resolve Button */}
      <TouchableOpacity style={styles.resolveBtn} onPress={onResolve}>
        <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
        <Text style={styles.resolveBtnText}>Mark Resolved</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ViolationsScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<SeverityFilter>('all');
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const getAllOpenViolations = useInspectionStore((s) => s.getAllOpenViolations);
  const allViolations = useMemo(() => getAllOpenViolations(), [getAllOpenViolations]);

  const filteredViolations = useMemo(() => {
    const active = allViolations.filter(
      (_, idx) => !resolvedIds.has(String(idx)),
    );
    if (activeFilter === 'all') return active;
    return active.filter((v) => v.violation.severity === activeFilter);
  }, [allViolations, activeFilter, resolvedIds]);

  const countBySeverity = useMemo(() => {
    const active = allViolations.filter(
      (_, idx) => !resolvedIds.has(String(idx)),
    );
    return {
      all: active.length,
      critical: active.filter((v) => v.violation.severity === 'critical').length,
      high: active.filter((v) => v.violation.severity === 'high').length,
      medium: active.filter((v) => v.violation.severity === 'medium').length,
      low: active.filter((v) => v.violation.severity === 'low').length,
    };
  }, [allViolations, resolvedIds]);

  const totalEstimatedFines = useMemo(() => {
    return filteredViolations.reduce((acc, item) => {
      return acc + parseFineValue(item.violation.estimatedFine);
    }, 0);
  }, [filteredViolations]);

  const handleResolve = useCallback(
    (globalIdx: number) => {
      Alert.alert(
        'Mark as Resolved',
        'Confirm that this violation has been corrected and is now compliant.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm Resolved',
            style: 'default',
            onPress: () => {
              setResolvedIds((prev) => new Set([...prev, String(globalIdx)]));
            },
          },
        ],
      );
    },
    [],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="warning" size={22} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Violations</Text>
      </View>

      {/* Severity Summary Chips */}
      <View style={styles.summaryRow}>
        {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
          const count = countBySeverity[sev];
          const color = VIOLATION_SEVERITY_COLORS[sev];
          return (
            <View key={sev} style={[styles.summaryChip, { backgroundColor: color + '20' }]}>
              <Text style={[styles.summaryCount, { color }]}>{count}</Text>
              <Text style={[styles.summaryLabel, { color }]}>
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Estimated Fines Banner */}
      {totalEstimatedFines > 0 && (
        <View style={styles.finesBanner}>
          <Ionicons name="cash-outline" size={16} color="#B45309" />
          <Text style={styles.finesBannerText}>
            Estimated total fines for filtered violations:{' '}
            <Text style={styles.finesBannerAmount}>
              ${totalEstimatedFines.toLocaleString()}
            </Text>
          </Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        >
          {FILTER_TABS.map((tab) => {
            const count = countBySeverity[tab.key];
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      isActive
                        ? { backgroundColor: '#FFFFFF' }
                        : { backgroundColor: COLORS.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        isActive
                          ? { color: COLORS.primary }
                          : { color: '#FFFFFF' },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Violations List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredViolations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="shield-checkmark-outline"
              size={52}
              color={COLORS.success}
            />
            <Text style={styles.emptyTitle}>
              No {activeFilter === 'all' ? '' : activeFilter + ' '}Violations
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'All areas are currently compliant.'
                : `No ${activeFilter}-severity violations found.`}
            </Text>
          </View>
        ) : (
          filteredViolations.map((item, localIdx) => {
            // Find the global index to use as a stable key for resolution
            const globalIdx = allViolations.findIndex(
              (v) =>
                v.violation.violationType === item.violation.violationType &&
                v.areaName === item.areaName &&
                v.inspectionId === item.inspectionId,
            );
            return (
              <ViolationItem
                key={`${item.inspectionId}-${item.areaName}-${localIdx}`}
                violation={item.violation}
                areaName={item.areaName}
                facilityName={item.facilityName}
                inspectionId={item.inspectionId}
                onResolve={() => handleResolve(globalIdx)}
              />
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
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
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryChip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  summaryCount: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  finesBanner: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finesBannerText: { fontSize: 13, color: '#92400E', flex: 1 },
  finesBannerAmount: { fontWeight: '700' },
  filterRow: {
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterTabTextActive: { color: '#FFFFFF' },
  filterBadge: {
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { fontSize: 10, fontWeight: '700' },
  listContent: { padding: 16 },
  violationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sevBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  sevBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  oshaText: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic' },
  violationType: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  metaText: { fontSize: 12, color: COLORS.textSecondary },
  riskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  riskChipText: { fontSize: 11, fontWeight: '600' },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 4,
  },
  expandLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  expandText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  actionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 8,
  },
  fineText: { fontSize: 14, color: '#B45309', fontWeight: '700' },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 12,
  },
  resolveBtnText: { fontSize: 14, color: COLORS.success, fontWeight: '600' },
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
