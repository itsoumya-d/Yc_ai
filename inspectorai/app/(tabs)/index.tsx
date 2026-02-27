import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useInspectionStore, type Inspection } from '@/stores/inspections';
import { COLORS, STATUS_COLORS, SPACING, RADIUS } from '@/constants/theme';
import { getScoreColor, calculateOverallScore } from '@/services/ai';

// ---- Sub-components ----

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, color ? { color } : undefined]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const color = getScoreColor(score);
  return (
    <View style={[styles.scoreGauge, { borderColor: color }]}>
      <Text style={[styles.scoreValue, { color }]}>{score}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: Inspection['status'] }) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.in_progress;
  const labels: Record<Inspection['status'], string> = {
    in_progress: 'In Progress',
    review: 'Review',
    submitted: 'Submitted',
  };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{labels[status]}</Text>
    </View>
  );
}

function InspectionCard({ inspection, onPress }: { inspection: Inspection; onPress: () => void }) {
  const score =
    inspection.overallScore ??
    (inspection.photos.length > 0
      ? calculateOverallScore(
          inspection.photos.filter((p) => p.assessment).map((p) => p.assessment!)
        )
      : undefined);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardAddress} numberOfLines={1}>
            {inspection.propertyAddress}
          </Text>
          <Text style={styles.cardClaim}>Claim #{inspection.claimNumber}</Text>
        </View>
        {score !== undefined ? <ScoreGauge score={score} /> : null}
      </View>

      <View style={styles.cardFooter}>
        <StatusBadge status={inspection.status} />

        <View style={styles.cardMeta}>
          <Ionicons name="images-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{inspection.photos.length} photos</Text>
        </View>

        <View style={styles.cardMeta}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>
            {format(new Date(inspection.createdAt), 'MMM d, yyyy')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="clipboard-outline" size={64} color={COLORS.border} />
      <Text style={styles.emptyTitle}>No Inspections Yet</Text>
      <Text style={styles.emptyText}>
        Start your first property inspection by tapping the + button below.
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onNew}>
        <Text style={styles.emptyButtonText}>Start Inspection</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---- Main Screen ----

export default function DashboardScreen() {
  const router = useRouter();
  const { inspections, setActiveInspection } = useInspectionStore();
  const [refreshing, setRefreshing] = useState(false);

  const active = inspections.filter((i) => i.status === 'in_progress').length;
  const submitted = inspections.filter((i) => i.status === 'submitted').length;
  const review = inspections.filter((i) => i.status === 'review').length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Future: re-fetch from Supabase here
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const handleNewInspection = () => {
    setActiveInspection(null);
    router.push('/(tabs)/inspect');
  };

  const handleOpenInspection = (inspection: Inspection) => {
    setActiveInspection(inspection.id);
    router.push('/(tabs)/inspect');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>InspectorAI</Text>
          <Text style={styles.headerSub}>Property Damage Inspection</Text>
        </View>
        <TouchableOpacity style={styles.headerAvatar}>
          <Ionicons name="person-circle-outline" size={34} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={inspections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          inspections.length === 0 && styles.emptyContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              <StatCard label="Active" value={active} color={COLORS.primary} />
              <StatCard label="Review" value={review} color={COLORS.warning} />
              <StatCard label="Submitted" value={submitted} color={COLORS.success} />
            </View>

            <Text style={styles.sectionTitle}>Recent Inspections</Text>
          </>
        }
        ListEmptyComponent={<EmptyState onNew={handleNewInspection} />}
        renderItem={({ item }) => (
          <InspectionCard
            inspection={item}
            onPress={() => handleOpenInspection(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleNewInspection} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? SPACING.md : 4,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  headerAvatar: {
    padding: 4,
  },
  listContent: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cardAddress: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardClaim: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scoreGauge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 104 : 80,
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
