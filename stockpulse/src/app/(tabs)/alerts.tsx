import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import {
  useInventoryStore,
  selectUnacknowledgedAlerts,
  selectCriticalAlerts,
} from '@/stores/inventory';
import type { StockAlert } from '@/stores/inventory';
import { generatePurchaseOrder } from '@/services/ai';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS, URGENCY_COLORS } from '@/constants/theme';

type AlertTab = 'critical' | 'low' | 'all';

// ─── Alert Card ──────────────────────────────────────────────────────────────

interface AlertCardProps {
  alert: StockAlert;
  onDismiss: (id: string) => void;
  onOrderNow: (alert: StockAlert) => void;
}

function AlertCard({ alert, onDismiss, onOrderNow }: AlertCardProps) {
  const isCritical = alert.severity === 'critical';
  const accentColor = isCritical ? COLORS.error : COLORS.warning;
  const bgColor = isCritical ? COLORS.errorLight : COLORS.warningLight;

  const stockPct =
    alert.maxStock > 0
      ? Math.min(1, Math.max(0, alert.currentStock / alert.maxStock))
      : 0;

  return (
    <View style={[styles.alertCard, { borderLeftColor: accentColor }]}>
      {/* Top row */}
      <View style={styles.alertCardHeader}>
        <View style={[styles.severityBadge, { backgroundColor: bgColor }]}>
          <Ionicons
            name={isCritical ? 'warning' : 'alert-circle'}
            size={14}
            color={accentColor}
          />
          <Text style={[styles.severityText, { color: accentColor }]}>
            {isCritical ? 'CRITICAL' : 'LOW STOCK'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={() => onDismiss(alert.id)}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="close" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Product info */}
      <Text style={styles.alertProductName}>{alert.productName}</Text>
      <Text style={styles.alertSku}>{alert.sku}</Text>

      {/* Stock bar */}
      <View style={styles.alertStockRow}>
        <View style={styles.alertBarTrack}>
          <View
            style={[
              styles.alertBarFill,
              { width: `${Math.round(stockPct * 100)}%`, backgroundColor: accentColor },
            ]}
          />
        </View>
        <Text style={[styles.alertStockNum, { color: accentColor }]}>
          {alert.currentStock} / {alert.reorderPoint}
          <Text style={styles.alertUnit}> {alert.unit}</Text>
        </Text>
      </View>

      {/* Supplier row */}
      {alert.supplierName && (
        <View style={styles.supplierRow}>
          <Ionicons name="business-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.supplierText}>{alert.supplierName}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.alertFooter}>
        <Text style={styles.alertTime}>
          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
        </Text>
        <TouchableOpacity
          style={[styles.orderBtn, { backgroundColor: accentColor }]}
          onPress={() => onOrderNow(alert)}
        >
          <Ionicons name="cart-outline" size={14} color="#FFFFFF" />
          <Text style={styles.orderBtnText}>Order Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Purchase Order Modal ────────────────────────────────────────────────────

interface POModalProps {
  visible: boolean;
  content: string;
  isLoading: boolean;
  onClose: () => void;
}

function PurchaseOrderModal({ visible, content, isLoading, onClose }: POModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.poBackdrop}>
        <View style={styles.poSheet}>
          <View style={styles.poHeader}>
            <View style={styles.poTitleRow}>
              <Ionicons name="document-text" size={22} color={COLORS.primary} />
              <Text style={styles.poTitle}>Purchase Order</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.poLoadingArea}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.poLoadingText}>Generating purchase order with AI...</Text>
            </View>
          ) : (
            <ScrollView style={styles.poContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.poText}>{content}</Text>
              <View style={{ height: 24 }} />
            </ScrollView>
          )}

          <View style={styles.poActions}>
            <TouchableOpacity style={styles.poShareBtn}>
              <Ionicons name="share-outline" size={18} color={COLORS.primary} />
              <Text style={styles.poShareText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.poPrintBtn}>
              <Ionicons name="print-outline" size={18} color="#FFFFFF" />
              <Text style={styles.poPrintText}>Print / Export</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { acknowledgeAlert, dismissAllAlerts, location } = useInventoryStore();
  const allUnacknowledged = useInventoryStore(selectUnacknowledgedAlerts);
  const criticalList = useInventoryStore(selectCriticalAlerts);

  const [activeTab, setActiveTab] = useState<AlertTab>('critical');
  const [poContent, setPoContent] = useState('');
  const [poLoading, setPoLoading] = useState(false);
  const [showPO, setShowPO] = useState(false);

  const displayedAlerts = useMemo(() => {
    if (activeTab === 'critical') return criticalList;
    if (activeTab === 'low')
      return allUnacknowledged.filter((a) => a.severity === 'low');
    return allUnacknowledged;
  }, [activeTab, allUnacknowledged, criticalList]);

  const tabCounts = useMemo(
    () => ({
      critical: criticalList.length,
      low: allUnacknowledged.filter((a) => a.severity === 'low').length,
      all: allUnacknowledged.length,
    }),
    [allUnacknowledged, criticalList]
  );

  const handleDismiss = useCallback(
    (id: string) => {
      acknowledgeAlert(id);
    },
    [acknowledgeAlert]
  );

  const handleOrderNow = useCallback((alert: StockAlert) => {
    Alert.alert(
      'Order Now',
      `Create a purchase order for ${alert.productName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate PO',
          onPress: async () => {
            setShowPO(true);
            setPoLoading(true);
            try {
              const po = await generatePurchaseOrder(
                [
                  {
                    name: alert.productName,
                    sku: alert.sku,
                    currentStock: alert.currentStock,
                    reorderPoint: alert.reorderPoint,
                    supplierName: alert.supplierName,
                  },
                ],
                location?.name ?? 'Main Location'
              );
              setPoContent(po);
            } catch {
              setPoContent('Failed to generate purchase order. Please try again.');
            } finally {
              setPoLoading(false);
            }
          },
        },
      ]
    );
  }, [location]);

  const handleGenerateBulkPO = useCallback(async () => {
    if (allUnacknowledged.length === 0) {
      Alert.alert('No Alerts', 'There are no low-stock items to order.');
      return;
    }
    setShowPO(true);
    setPoLoading(true);
    try {
      const items = allUnacknowledged.map((a) => ({
        name: a.productName,
        sku: a.sku,
        currentStock: a.currentStock,
        reorderPoint: a.reorderPoint,
        supplierName: a.supplierName,
      }));
      const po = await generatePurchaseOrder(items, location?.name ?? 'Main Location');
      setPoContent(po);
    } catch {
      setPoContent('Failed to generate purchase order. Please try again.');
    } finally {
      setPoLoading(false);
    }
  }, [allUnacknowledged, location]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Low Stock Alerts</Text>
          <Text style={styles.headerSub}>
            {allUnacknowledged.length} active alert{allUnacknowledged.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {allUnacknowledged.length > 0 && (
            <TouchableOpacity style={styles.dismissAllBtn} onPress={() => {
              Alert.alert('Dismiss All', 'Mark all alerts as acknowledged?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Dismiss All', onPress: dismissAllAlerts },
              ]);
            }}>
              <Text style={styles.dismissAllText}>Dismiss All</Text>
            </TouchableOpacity>
          )}
          {allUnacknowledged.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{allUnacknowledged.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['critical', 'low', 'all'] as AlertTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'critical' ? 'Critical' : tab === 'low' ? 'Low Stock' : 'All'}
            </Text>
            {tabCounts[tab] > 0 && (
              <View
                style={[
                  styles.tabBadge,
                  activeTab === tab
                    ? { backgroundColor: COLORS.primary }
                    : { backgroundColor: COLORS.borderLight },
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    { color: activeTab === tab ? '#FFFFFF' : COLORS.textSecondary },
                  ]}
                >
                  {tabCounts[tab]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Generate PO button */}
      {allUnacknowledged.length > 0 && (
        <TouchableOpacity style={styles.generatePoBtn} onPress={handleGenerateBulkPO}>
          <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
          <Text style={styles.generatePoBtnText}>
            Generate PO for All {allUnacknowledged.length} Items
          </Text>
        </TouchableOpacity>
      )}

      {/* Alert list */}
      <FlatList
        data={displayedAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onDismiss={handleDismiss}
            onOrderNow={handleOrderNow}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
            </View>
            <Text style={styles.emptyTitle}>All stocked up!</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'critical'
                ? 'No critical stock alerts right now.'
                : activeTab === 'low'
                ? 'No low-stock alerts right now.'
                : 'Your inventory is looking great.'}
            </Text>
          </View>
        }
      />

      {/* PO Modal */}
      <PurchaseOrderModal
        visible={showPO}
        content={poContent}
        isLoading={poLoading}
        onClose={() => { setShowPO(false); setPoContent(''); }}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: COLORS.primaryLight, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dismissAllBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BORDER_RADIUS.full,
  },
  dismissAllText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  countBadge: {
    backgroundColor: COLORS.error, width: 24, height: 24,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.primaryDark,
  },
  countBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.md, gap: 6,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  tabBadgeText: { fontSize: 10, fontWeight: '700' },

  generatePoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primaryDark,
    margin: SPACING.md, marginBottom: SPACING.sm,
    padding: SPACING.md, borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  generatePoBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  listContent: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 40 },

  alertCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  alertCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  severityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDER_RADIUS.full },
  severityText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  dismissBtn: { padding: 2 },

  alertProductName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  alertSku: { fontSize: 11, color: COLORS.textSecondary, marginBottom: SPACING.sm },

  alertStockRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  alertBarTrack: { flex: 1, height: 6, backgroundColor: COLORS.borderLight, borderRadius: 3, overflow: 'hidden' },
  alertBarFill: { height: '100%', borderRadius: 3 },
  alertStockNum: { fontSize: 14, fontWeight: '700', minWidth: 80, textAlign: 'right' },
  alertUnit: { fontSize: 11, fontWeight: '400', color: COLORS.textSecondary },

  supplierRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.sm },
  supplierText: { fontSize: 11, color: COLORS.textMuted },

  alertFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertTime: { fontSize: 11, color: COLORS.textMuted },
  orderBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
  orderBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: SPACING.md },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SPACING.xl },

  // PO Modal
  poBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  poSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl, maxHeight: '80%',
    ...SHADOWS.lg,
  },
  poHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  poTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  poTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  poLoadingArea: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: SPACING.md },
  poLoadingText: { fontSize: 14, color: COLORS.textSecondary },
  poContent: { flex: 1 },
  poText: { fontSize: 13, color: COLORS.text, lineHeight: 20, fontFamily: 'monospace' },
  poActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  poShareBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
  },
  poShareText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  poPrintBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
  },
  poPrintText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
