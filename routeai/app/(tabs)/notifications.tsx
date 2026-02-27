import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore, type RouteNotification } from '@/stores/notifications';
import { useAuthStore } from '@/stores/auth';
import {
  markNotificationRead,
  markAllNotificationsRead,
  getDriverNotifications,
} from '@/services/supabase';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  NOTIFICATION_COLORS,
} from '@/constants/theme';
import { useQuery } from '@tanstack/react-query';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type NotificationIconName = React.ComponentProps<typeof Ionicons>['name'];

const NOTIFICATION_ICONS: Record<RouteNotification['type'], NotificationIconName> = {
  route_update: 'map-outline',
  new_job: 'briefcase-outline',
  schedule_change: 'calendar-outline',
  emergency: 'warning-outline',
  message: 'chatbubble-outline',
};

function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

// ─── Notification Item ────────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onPress,
}: {
  notification: RouteNotification;
  onPress: (id: string) => void;
}) {
  const borderColor = NOTIFICATION_COLORS[notification.type] ?? COLORS.primary;
  const icon = NOTIFICATION_ICONS[notification.type] ?? 'notifications-outline';

  return (
    <TouchableOpacity
      style={[
        styles.notifItem,
        !notification.read && styles.notifItemUnread,
      ]}
      onPress={() => onPress(notification.id)}
      activeOpacity={0.75}
    >
      {/* Type color stripe */}
      <View style={[styles.typeStripe, { backgroundColor: borderColor }]} />

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: borderColor + '18' }]}>
        <Ionicons name={icon} size={20} color={borderColor} />
      </View>

      {/* Content */}
      <View style={styles.notifContent}>
        <View style={styles.notifHeaderRow}>
          <Text style={styles.notifTitle} numberOfLines={1}>{notification.title}</Text>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifBody} numberOfLines={2}>{notification.body}</Text>
        <Text style={styles.notifTime}>{timeAgo(notification.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="notifications-off-outline" size={48} color={COLORS.border} />
      </View>
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptySub}>You're all caught up! New alerts from your dispatcher will appear here.</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const { driverProfile } = useAuthStore();
  const {
    notifications,
    unreadCount,
    setNotifications,
    markRead,
    markAllRead,
  } = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    if (!driverProfile?.id) return [];
    const raw = await getDriverNotifications(driverProfile.id);
    const mapped: RouteNotification[] = raw.map((n: {
      id: string;
      type: RouteNotification['type'];
      title: string;
      body: string;
      data?: Record<string, unknown>;
      read: boolean;
      created_at: string;
    }) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      data: n.data,
      read: n.read,
      createdAt: n.created_at,
    }));
    setNotifications(mapped);
    return mapped;
  }, [driverProfile?.id, setNotifications]);

  const { isRefetching, refetch } = useQuery({
    queryKey: ['notifications', driverProfile?.id],
    queryFn: fetchNotifications,
    enabled: !!driverProfile?.id,
    staleTime: 1000 * 30,
  });

  async function handleMarkRead(id: string) {
    markRead(id);
    try {
      await markNotificationRead(id);
    } catch {
      // Optimistic update already applied; silently fail
    }
  }

  async function handleMarkAllRead() {
    if (!driverProfile?.id) return;
    markAllRead();
    try {
      await markAllNotificationsRead(driverProfile.id);
    } catch {
      // Silently fail
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>
              {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Ionicons name="checkmark-done-outline" size={16} color={COLORS.primary} />
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notification type legend */}
      <View style={styles.legend}>
        {Object.entries(NOTIFICATION_COLORS).map(([type, color]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{type.replace('_', ' ')}</Text>
          </View>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={handleMarkRead} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  headerSub: { color: COLORS.primaryLight, fontSize: FONT_SIZE.sm, marginTop: 2 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
    ...SHADOWS.sm,
  },
  markAllText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '700' },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, textTransform: 'capitalize' },

  listContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  separator: { height: SPACING.sm },

  notifItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  notifItemUnread: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  typeStripe: { width: 4 },
  iconWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  notifContent: {
    flex: 1,
    padding: SPACING.md,
    paddingLeft: SPACING.sm,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  notifTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  notifBody: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
