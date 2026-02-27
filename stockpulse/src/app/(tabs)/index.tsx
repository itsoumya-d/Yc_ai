import { useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import {
  useInventoryStore,
  selectCriticalAlerts,
  selectUnacknowledgedAlerts,
} from '@/stores/inventory';
import {
  COLORS,
  SHADOWS,
  BORDER_RADIUS,
  SPACING,
  getStockUrgency,
  URGENCY_COLORS,
} from '@/constants/theme';

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface StockBarProps {
  current: number;
  max: number;
  reorderPoint: number;
}
function StockBar({ current, max, reorderPoint }: StockBarProps) {
  const pct = Math.min(1, Math.max(0, current / (max || 1)));
  const urgency = getStockUrgency(current, reorderPoint, max);
  const barColor =
    urgency === 'critical'
      ? COLORS.error
      : urgency === 'low'
      ? COLORS.warning
      : COLORS.success;
  return (
    <View style={styles.stockBarTrack}>
      <View style={[styles.stockBarFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
    </View>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {
    products,
    lowStockProducts,
    criticalProducts,
    scanHistory,
    location,
    organization,
    isLoadingProducts,
    setLoadingProducts,
    setProducts,
  } = useInventoryStore();

  const unacknowledgedAlerts = useInventoryStore(selectUnacknowledgedAlerts);
  const criticalAlerts = useInventoryStore(selectCriticalAlerts);

  const stockSummary = useMemo(() => {
    const good = products.filter((p) => p.currentStock > p.reorderPoint).length;
    const low = products.filter(
      (p) => p.currentStock <= p.reorderPoint && p.currentStock > p.reorderPoint * 0.25
    ).length;
    const critical = criticalProducts.length;
    return { good, low, critical, total: products.length };
  }, [products, criticalProducts]);

  const goodPct = stockSummary.total > 0 ? stockSummary.good / stockSummary.total : 0;
  const lowPct = stockSummary.total > 0 ? stockSummary.low / stockSummary.total : 0;
  const critPct = stockSummary.total > 0 ? stockSummary.critical / stockSummary.total : 0;

  const recentScans = scanHistory.slice(0, 5);

  function handleRefresh() {
    setLoadingProducts(true);
    setTimeout(() => setLoadingProducts(false), 800);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>StockPulse</Text>
          <Text style={styles.locationName}>
            {organization?.name ?? 'My Organization'} · {location?.name ?? 'Main Location'}
          </Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn}>
          <Ionicons name="person-circle" size={36} color={COLORS.primaryLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingProducts}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Critical Alert Banner */}
        {criticalAlerts.length > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push('/(tabs)/alerts')}
          >
            <Ionicons name="warning" size={18} color="#FFFFFF" />
            <Text style={styles.alertBannerText}>
              {criticalAlerts.length} critical stock alert{criticalAlerts.length > 1 ? 's' : ''} need
              attention
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Stock Health Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stock Health</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stockSummary.total}</Text>
              <Text style={styles.statLabel}>Total SKUs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.warning }]}>
                {stockSummary.low}
              </Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.error }]}>
                {stockSummary.critical}
              </Text>
              <Text style={styles.statLabel}>Critical</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>
                {unacknowledgedAlerts.length}
              </Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </View>
          </View>

          {/* Segmented bar */}
          <View style={styles.segBar}>
            {goodPct > 0 && (
              <View
                style={[
                  styles.segBarSection,
                  { flex: goodPct, backgroundColor: COLORS.success },
                  styles.segBarLeft,
                ]}
              />
            )}
            {lowPct > 0 && (
              <View
                style={[
                  styles.segBarSection,
                  { flex: lowPct, backgroundColor: COLORS.warning },
                  goodPct === 0 ? styles.segBarLeft : undefined,
                ]}
              />
            )}
            {critPct > 0 && (
              <View
                style={[
                  styles.segBarSection,
                  { flex: critPct, backgroundColor: COLORS.error },
                  styles.segBarRight,
                  goodPct === 0 && lowPct === 0 ? styles.segBarLeft : undefined,
                ]}
              />
            )}
          </View>
          <View style={styles.segLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendLabel}>Good ({stockSummary.good})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.legendLabel}>Low ({stockSummary.low})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
              <Text style={styles.legendLabel}>Critical ({stockSummary.critical})</Text>
            </View>
          </View>
        </View>

        {/* Top Low Stock Items */}
        {lowStockProducts.length > 0 && (
          <View style={styles.card}>
            <SectionHeader
              title="Low Stock Items"
              action="View All"
              onAction={() => router.push('/(tabs)/alerts')}
            />
            {lowStockProducts.slice(0, 5).map((product) => {
              const urgency = getStockUrgency(
                product.currentStock,
                product.reorderPoint,
                product.maxStock
              );
              const badgeColor = URGENCY_COLORS[urgency];
              return (
                <View key={product.id} style={styles.lowStockRow}>
                  <View style={styles.lowStockLeft}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productMeta}>
                      {product.sku} · {product.category}
                    </Text>
                    <StockBar
                      current={product.currentStock}
                      max={product.maxStock}
                      reorderPoint={product.reorderPoint}
                    />
                  </View>
                  <View style={styles.lowStockRight}>
                    <View style={[styles.urgencyBadge, { backgroundColor: badgeColor + '22' }]}>
                      <Text style={[styles.urgencyText, { color: badgeColor }]}>
                        {urgency === 'critical' ? 'CRITICAL' : 'LOW'}
                      </Text>
                    </View>
                    <Text style={styles.stockCount}>
                      <Text style={{ color: badgeColor, fontWeight: '700' }}>
                        {product.currentStock}
                      </Text>
                      <Text style={styles.stockCountMeta}>
                        {' '}/{product.reorderPoint} {product.unit}
                      </Text>
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.card}>
          <SectionHeader title="Recent Activity" />
          {recentScans.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Ionicons name="time-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No scans yet. Tap Scan to get started.</Text>
            </View>
          ) : (
            recentScans.map((scan) => (
              <View key={scan.id} style={styles.activityRow}>
                <View
                  style={[
                    styles.activityIcon,
                    {
                      backgroundColor:
                        scan.action === 'add'
                          ? COLORS.primaryLight
                          : scan.action === 'remove'
                          ? COLORS.errorLight
                          : COLORS.warningLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      scan.action === 'add'
                        ? 'add'
                        : scan.action === 'remove'
                        ? 'remove'
                        : 'refresh'
                    }
                    size={16}
                    color={
                      scan.action === 'add'
                        ? COLORS.primary
                        : scan.action === 'remove'
                        ? COLORS.error
                        : COLORS.warning
                    }
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityProduct}>
                    {scan.productName ?? 'Unknown Product'}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {scan.action === 'add' ? '+' : scan.action === 'remove' ? '-' : ''}
                    {Math.abs(scan.quantity)} {scan.action}{' '}
                    · {formatDistanceToNow(new Date(scan.scannedAt), { addSuffix: true })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Bottom padding so FAB doesn't overlap */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Quick Scan FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 84 }]}
        onPress={() => router.push('/(tabs)/scan')}
        activeOpacity={0.85}
      >
        <Ionicons name="barcode-outline" size={22} color="#FFFFFF" />
        <Text style={styles.fabLabel}>Quick Scan</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  appName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  locationName: { fontSize: 12, color: COLORS.primaryLight, marginTop: 1 },
  avatarBtn: { padding: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingTop: SPACING.md },

  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: 8,
  },
  alertBannerText: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.borderLight },

  segBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    backgroundColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  segBarSection: { height: '100%' },
  segBarLeft: { borderTopLeftRadius: BORDER_RADIUS.full, borderBottomLeftRadius: BORDER_RADIUS.full },
  segBarRight: { borderTopRightRadius: BORDER_RADIUS.full, borderBottomRightRadius: BORDER_RADIUS.full },

  segLegend: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: COLORS.textSecondary },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  sectionAction: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  lowStockLeft: { flex: 1, marginRight: SPACING.md },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  productMeta: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 },
  stockBarTrack: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  stockBarFill: { height: '100%', borderRadius: BORDER_RADIUS.full },
  lowStockRight: { alignItems: 'flex-end', gap: 4 },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  urgencyText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  stockCount: { fontSize: 12 },
  stockCountMeta: { color: COLORS.textSecondary, fontWeight: '400' },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: { flex: 1 },
  activityProduct: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  activityMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },

  emptyActivity: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },

  fab: {
    position: 'absolute',
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.lg,
  },
  fabLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
