import { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  useRouteStore,
  selectNextPendingStop,
  selectCompletedCount,
  selectTotalEstimatedHours,
  type Stop,
} from '@/stores/route';
import { useAuthStore } from '@/stores/auth';
import { getTodayRoute, updateStopStatus, updateJobStatus } from '@/services/supabase';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  JOB_STATUS_COLORS,
  PRIORITY_COLORS,
} from '@/constants/theme';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  try {
    return format(new Date(iso), 'h:mm a');
  } catch {
    return '--';
  }
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function openMapsNavigation(address: string) {
  const encoded = encodeURIComponent(address);
  const url =
    Platform.OS === 'ios'
      ? `maps://?daddr=${encoded}`
      : `google.navigation:q=${encoded}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`);
  });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Stop['priority'] }) {
  return (
    <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[priority] + '20' }]}>
      <Text style={[styles.badgeText, { color: PRIORITY_COLORS[priority] }]}>
        {priority.toUpperCase()}
      </Text>
    </View>
  );
}

function StatusChip({ status }: { status: Stop['status'] }) {
  const color = JOB_STATUS_COLORS[status] ?? COLORS.textSecondary;
  const label = status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <View style={[styles.chip, { backgroundColor: color + '18' }]}>
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

function NextJobCard({ stop }: { stop: Stop }) {
  const { updateStopStatus: storeUpdate } = useRouteStore();

  async function handleStartJob() {
    const now = new Date().toISOString();
    storeUpdate(stop.id, 'in_progress', { startedAt: now });
    await updateStopStatus(stop.id, 'in_progress', { started_at: now });
    await updateJobStatus(stop.jobId, 'in_progress', { actual_start: now });
  }

  return (
    <View style={styles.nextCard}>
      <View style={styles.nextCardHeader}>
        <View style={styles.nextCardLabel}>
          <Ionicons name="flash" size={14} color={COLORS.surface} />
          <Text style={styles.nextCardLabelText}>NEXT UP</Text>
        </View>
        <PriorityBadge priority={stop.priority} />
      </View>

      <Text style={styles.nextCustomer}>{stop.customerName}</Text>
      <View style={styles.nextRow}>
        <Ionicons name="location-outline" size={15} color={COLORS.primaryLight} />
        <Text style={styles.nextAddress} numberOfLines={1}>{stop.address}</Text>
      </View>
      <View style={styles.nextRow}>
        <Ionicons name="construct-outline" size={15} color={COLORS.primaryLight} />
        <Text style={styles.nextMeta}>{stop.serviceType}</Text>
        <Text style={styles.nextMeta}> · {formatTime(stop.scheduledTime)}</Text>
        <Text style={styles.nextMeta}> · {formatDuration(stop.estimatedDuration)}</Text>
      </View>

      <View style={styles.nextActions}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => openMapsNavigation(stop.address)}
        >
          <Ionicons name="navigate" size={16} color={COLORS.primary} />
          <Text style={styles.navBtnText}>Start Navigation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.startBtn} onPress={handleStartJob}>
          <Text style={styles.startBtnText}>Start Job</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StopRow({ stop, index }: { stop: Stop; index: number }) {
  return (
    <View style={[styles.stopRow, stop.status === 'completed' && styles.stopRowDone]}>
      <View style={[styles.stopIndex, stop.status === 'completed' && styles.stopIndexDone]}>
        {stop.status === 'completed' ? (
          <Ionicons name="checkmark" size={14} color={COLORS.surface} />
        ) : (
          <Text style={styles.stopIndexText}>{index + 1}</Text>
        )}
      </View>
      <View style={styles.stopInfo}>
        <Text style={[styles.stopCustomer, stop.status === 'completed' && styles.textDone]} numberOfLines={1}>
          {stop.customerName}
        </Text>
        <Text style={styles.stopAddress} numberOfLines={1}>{stop.address}</Text>
        <View style={styles.stopMeta}>
          <Text style={styles.stopTime}>{formatTime(stop.scheduledTime)}</Text>
          <Text style={styles.stopDuration}>{formatDuration(stop.estimatedDuration)}</Text>
        </View>
      </View>
      <View style={styles.stopRight}>
        <StatusChip status={stop.status} />
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function MyRouteScreen() {
  const { driverProfile } = useAuthStore();
  const { todayStops, setStops } = useRouteStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { timerRunning, incrementTimer } = useRouteStore();

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(incrementTimer, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, incrementTimer]);

  const fetchRoute = useCallback(async () => {
    if (!driverProfile?.id) return [];
    const route = await getTodayRoute(driverProfile.id);
    if (!route?.stops) return [];

    const mapped: Stop[] = route.stops.map((s: {
      id: string;
      job_id: string;
      order_index: number;
      scheduled_time: string;
      status: string;
      started_at?: string;
      completed_at?: string;
      jobs: {
        id: string;
        service_type: string;
        estimated_duration: number;
        priority: string;
        notes?: string;
        customers: {
          name: string;
          address: string;
          latitude?: number;
          longitude?: number;
        };
      };
    }) => ({
      id: s.id,
      jobId: s.job_id,
      orderIndex: s.order_index,
      customerName: s.jobs?.customers?.name ?? 'Unknown',
      address: s.jobs?.customers?.address ?? '',
      serviceType: s.jobs?.service_type ?? '',
      estimatedDuration: s.jobs?.estimated_duration ?? 60,
      scheduledTime: s.scheduled_time,
      status: s.status as Stop['status'],
      priority: (s.jobs?.priority ?? 'medium') as Stop['priority'],
      notes: s.jobs?.notes,
      latitude: s.jobs?.customers?.latitude,
      longitude: s.jobs?.customers?.longitude,
      startedAt: s.started_at,
      completedAt: s.completed_at,
    }));

    setStops(mapped);
    return mapped;
  }, [driverProfile?.id, setStops]);

  const { isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['today-route', driverProfile?.id],
    queryFn: fetchRoute,
    enabled: !!driverProfile?.id,
    staleTime: 1000 * 60,
  });

  const nextStop = selectNextPendingStop(todayStops);
  const completedCount = selectCompletedCount(todayStops);
  const totalHours = selectTotalEstimatedHours(todayStops);
  const remainingCount = todayStops.filter((s) => s.status !== 'completed' && s.status !== 'cancelled').length;
  const today = format(new Date(), 'EEEE, MMM d');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Today's Route</Text>
          <Text style={styles.headerDate}>{today}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{todayStops.length} stops</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your route…</Text>
          </View>
        ) : (
          <>
            {/* Stats Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedCount}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{remainingCount}</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalHours.toFixed(1)}h</Text>
                <Text style={styles.statLabel}>Est. Hours</Text>
              </View>
            </View>

            {/* Next Job Card */}
            {nextStop ? (
              <NextJobCard stop={nextStop} />
            ) : (
              <View style={styles.allDoneCard}>
                <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
                <Text style={styles.allDoneText}>All jobs complete!</Text>
                <Text style={styles.allDoneSubText}>Great work today.</Text>
              </View>
            )}

            {/* Stops List */}
            {todayStops.length > 0 && (
              <View style={styles.stopsSection}>
                <Text style={styles.sectionTitle}>All Stops</Text>
                <View style={styles.stopsCard}>
                  {todayStops
                    .slice()
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((stop, i) => (
                      <View key={stop.id}>
                        <StopRow stop={stop} index={i} />
                        {i < todayStops.length - 1 && <View style={styles.divider} />}
                      </View>
                    ))}
                </View>
              </View>
            )}

            {todayStops.length === 0 && !isLoading && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyTitle}>No jobs scheduled today</Text>
                <Text style={styles.emptySubText}>Pull to refresh or check with your dispatcher.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: COLORS.surface, fontSize: FONT_SIZE.xl, fontWeight: '700' },
  headerDate: { color: COLORS.primaryLight, fontSize: FONT_SIZE.sm, marginTop: 2 },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  headerBadgeText: { color: COLORS.surface, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  centered: { alignItems: 'center', paddingVertical: SPACING.xxl },
  loadingText: { color: COLORS.textSecondary, marginTop: SPACING.md },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },

  nextCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  nextCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  nextCardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  nextCardLabelText: { color: COLORS.surface, fontSize: FONT_SIZE.xs, fontWeight: '700' },
  nextCustomer: { color: COLORS.surface, fontSize: FONT_SIZE.xl, fontWeight: '700', marginBottom: SPACING.sm },
  nextRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  nextAddress: { color: COLORS.primaryLight, fontSize: FONT_SIZE.sm, flex: 1 },
  nextMeta: { color: COLORS.primaryLight, fontSize: FONT_SIZE.sm },
  nextActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: 6,
  },
  navBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  startBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  startBtnText: { color: COLORS.surface, fontSize: FONT_SIZE.sm, fontWeight: '700' },

  allDoneCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  allDoneText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  allDoneSubText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 4 },

  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  stopsSection: { marginBottom: SPACING.lg },
  stopsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  stopRowDone: { opacity: 0.6 },
  stopIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIndexDone: { backgroundColor: COLORS.success },
  stopIndexText: { color: COLORS.surface, fontSize: FONT_SIZE.xs, fontWeight: '700' },
  stopInfo: { flex: 1 },
  stopCustomer: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  textDone: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  stopAddress: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 1 },
  stopMeta: { flexDirection: 'row', gap: SPACING.sm, marginTop: 3 },
  stopTime: { fontSize: FONT_SIZE.xs, color: COLORS.primary, fontWeight: '600' },
  stopDuration: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  stopRight: { alignItems: 'flex-end' },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 56 },

  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  chipText: { fontSize: 10, fontWeight: '700' },

  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.textSecondary, marginTop: SPACING.md },
  emptySubText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
});
