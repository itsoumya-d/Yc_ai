import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSiteStore } from '@/stores/sites';
import { useSafetyStore } from '@/stores/safety';
import { COLORS, VIOLATION_COLORS, VIOLATION_BG_COLORS } from '@/constants/theme';
import type { ViolationRecord } from '@/stores/safety';

type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
type FilterStatus = 'open' | 'resolved' | 'all';

const SEVERITY_ORDER: SeverityLevel[] = ['critical', 'high', 'medium', 'low'];

const SEVERITY_ICONS: Record<SeverityLevel, React.ComponentProps<typeof Ionicons>['name']> = {
  critical: 'skull',
  high: 'warning',
  medium: 'alert-circle',
  low: 'information-circle',
};

export default function SafetyScreen() {
  const { activeSiteId, sites } = useSiteStore();
  const { violations, resolveViolation, dismissViolation } = useSafetyStore();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('open');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeSite = sites.find((s) => s.id === activeSiteId);

  const siteViolations = violations.filter((v) => v.siteId === activeSiteId);

  const filteredViolations = siteViolations.filter((v) => {
    if (filterStatus === 'all') return true;
    return v.status === filterStatus;
  });

  // Stats
  const openByseverity = SEVERITY_ORDER.reduce<Record<string, number>>(
    (acc, severity) => {
      acc[severity] = siteViolations.filter(
        (v) => v.status === 'open' && v.violation.severity === severity
      ).length;
      return acc;
    },
    {}
  );

  const totalOpen = siteViolations.filter((v) => v.status === 'open').length;
  const totalResolved = siteViolations.filter((v) => v.status === 'resolved').length;

  // Group filtered violations by severity
  const grouped = SEVERITY_ORDER.reduce<Record<SeverityLevel, ViolationRecord[]>>(
    (acc, severity) => {
      acc[severity] = filteredViolations.filter(
        (v) => v.violation.severity === severity
      );
      return acc;
    },
    { critical: [], high: [], medium: [], low: [] }
  );

  function handleResolve(id: string) {
    Alert.alert(
      'Mark Resolved',
      'Mark this safety violation as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          style: 'default',
          onPress: () => resolveViolation(id),
        },
      ]
    );
  }

  function handleDismiss(id: string) {
    Alert.alert(
      'Dismiss Violation',
      'Dismiss this violation? This should only be done if the AI detection was incorrect.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'destructive',
          onPress: () => dismissViolation(id),
        },
      ]
    );
  }

  function renderViolationCard(item: ViolationRecord) {
    const isExpanded = expandedId === item.id;
    const severity = item.violation.severity as SeverityLevel;
    const isResolved = item.status === 'resolved';
    const isDismissed = item.status === 'dismissed';

    return (
      <TouchableOpacity
        style={[
          styles.violationCard,
          { borderLeftColor: VIOLATION_COLORS[severity] },
          isResolved && styles.violationCardResolved,
          isDismissed && styles.violationCardDismissed,
        ]}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.85}
      >
        {/* Card Header */}
        <View style={styles.violationCardHeader}>
          <View
            style={[
              styles.severityIconBg,
              { backgroundColor: VIOLATION_BG_COLORS[severity] },
            ]}
          >
            <Ionicons
              name={SEVERITY_ICONS[severity]}
              size={16}
              color={VIOLATION_COLORS[severity]}
            />
          </View>
          <View style={styles.violationCardInfo}>
            <Text
              style={[styles.violationType, isResolved && styles.textMuted]}
              numberOfLines={1}
            >
              {item.violation.type}
            </Text>
            <Text style={styles.oshaRef}>{item.violation.oshaReference}</Text>
          </View>
          <View style={styles.violationCardRight}>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: VIOLATION_COLORS[severity] },
                isResolved && styles.badgeFaded,
              ]}
            >
              <Text style={styles.severityBadgeText}>
                {severity.toUpperCase()}
              </Text>
            </View>
            {item.status !== 'open' && (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isResolved ? '#DCFCE7' : '#F1F5F9' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: isResolved ? COLORS.success : COLORS.textSecondary },
                  ]}
                >
                  {item.status === 'resolved' ? 'Resolved' : 'Dismissed'}
                </Text>
              </View>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.textSecondary}
            />
          </View>
        </View>

        {/* Expanded content */}
        {isExpanded && (
          <View style={styles.violationExpanded}>
            <View style={styles.expandedDivider} />

            <Text style={styles.expandedLabel}>Description</Text>
            <Text style={styles.expandedText}>{item.violation.description}</Text>

            <Text style={[styles.expandedLabel, { marginTop: 10 }]}>
              Correction Required
            </Text>
            <View style={styles.correctionBox}>
              <Ionicons name="construct-outline" size={14} color={COLORS.warning} />
              <Text style={styles.correctionText}>
                {item.violation.correctionRequired}
              </Text>
            </View>

            <Text style={styles.detectedDate}>
              Detected: {new Date(item.createdAt).toLocaleString()}
            </Text>
            {item.resolvedAt && (
              <Text style={styles.resolvedDate}>
                Resolved: {new Date(item.resolvedAt).toLocaleString()}
              </Text>
            )}

            {item.status === 'open' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.resolveBtn}
                  onPress={() => handleResolve(item.id)}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.resolveBtnText}>Mark Resolved</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dismissBtn}
                  onPress={() => handleDismiss(item.id)}
                >
                  <Ionicons name="close-circle-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.dismissBtnText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Build flat list data with section headers
  const listData: Array<
    | { type: 'header'; severity: SeverityLevel; count: number }
    | { type: 'item'; item: ViolationRecord }
  > = [];

  SEVERITY_ORDER.forEach((severity) => {
    const items = grouped[severity];
    if (items.length > 0) {
      listData.push({ type: 'header', severity, count: items.length });
      items.forEach((item) => listData.push({ type: 'item', item }));
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Safety Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {activeSite?.name ?? 'No site selected'}
          </Text>
        </View>
        {totalOpen > 0 && (
          <View style={styles.alertBadge}>
            <Ionicons name="warning" size={14} color="#fff" />
            <Text style={styles.alertBadgeText}>{totalOpen} Open</Text>
          </View>
        )}
      </View>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          {SEVERITY_ORDER.map((severity) => (
            <View
              key={severity}
              style={[
                styles.statCard,
                { backgroundColor: VIOLATION_BG_COLORS[severity] },
              ]}
            >
              <Text
                style={[styles.statCount, { color: VIOLATION_COLORS[severity] }]}
              >
                {openByseverity[severity] ?? 0}
              </Text>
              <Text
                style={[styles.statSeverity, { color: VIOLATION_COLORS[severity] }]}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.resolvedRow}>
          <View style={styles.resolvedItem}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.resolvedText}>{totalResolved} resolved</Text>
          </View>
          <View style={styles.resolvedItem}>
            <Ionicons name="warning" size={14} color={COLORS.error} />
            <Text style={styles.resolvedText}>{totalOpen} open</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['open', 'resolved', 'all'] as FilterStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterTab, filterStatus === status && styles.filterTabActive]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === status && styles.filterTabTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'open' && totalOpen > 0 && ` (${totalOpen})`}
              {status === 'resolved' && totalResolved > 0 && ` (${totalResolved})`}
              {status === 'all' && ` (${siteViolations.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Violations List */}
      <FlatList
        data={listData}
        keyExtractor={(item, idx) =>
          item.type === 'header' ? `hdr_${item.severity}` : `item_${item.item.id}_${idx}`
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionHeaderDot,
                    { backgroundColor: VIOLATION_COLORS[item.severity] },
                  ]}
                />
                <Text
                  style={[
                    styles.sectionHeaderText,
                    { color: VIOLATION_COLORS[item.severity] },
                  ]}
                >
                  {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                </Text>
                <Text style={styles.sectionHeaderCount}>
                  {item.count} violation{item.count !== 1 ? 's' : ''}
                </Text>
              </View>
            );
          }
          return renderViolationCard(item.item);
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={totalOpen === 0 ? 'shield-checkmark' : 'search-outline'}
              size={56}
              color={totalOpen === 0 ? COLORS.success : COLORS.border}
            />
            <Text style={styles.emptyStateTitle}>
              {filterStatus === 'open' && totalOpen === 0
                ? 'All Clear!'
                : 'No Violations'}
            </Text>
            <Text style={styles.emptyStateText}>
              {filterStatus === 'open' && totalOpen === 0
                ? 'No open safety violations. Great job keeping the site safe!'
                : `No ${filterStatus} violations found.`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 22,
    fontWeight: '800',
  },
  statSeverity: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  resolvedRow: {
    flexDirection: 'row',
    gap: 16,
  },
  resolvedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  resolvedText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 6,
    paddingTop: 4,
  },
  sectionHeaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  sectionHeaderCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  violationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 5,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  violationCardResolved: {
    opacity: 0.7,
  },
  violationCardDismissed: {
    opacity: 0.5,
  },
  violationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  severityIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  violationCardInfo: {
    flex: 1,
  },
  violationType: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  textMuted: {
    color: COLORS.textSecondary,
  },
  oshaRef: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  violationCardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  severityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeFaded: {
    opacity: 0.5,
  },
  severityBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  violationExpanded: {
    marginTop: 4,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  expandedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  expandedText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  correctionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 10,
  },
  correctionText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
    lineHeight: 18,
  },
  detectedDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  resolvedDate: {
    fontSize: 11,
    color: COLORS.success,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  resolveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resolveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dismissBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptyStateText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 280,
  },
});
