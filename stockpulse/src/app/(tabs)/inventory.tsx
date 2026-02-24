import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useInventoryStore } from '@/stores/inventory';
import type { Product } from '@/stores/inventory';
import {
  COLORS,
  BORDER_RADIUS,
  SPACING,
  SHADOWS,
  CATEGORIES,
  getStockUrgency,
  getStockPercentage,
  URGENCY_COLORS,
} from '@/constants/theme';

type SortKey = 'name' | 'stock' | 'scanned';
type CategoryFilter = string;

// ─── Stock health bar ────────────────────────────────────────────────────────

function StockHealthBar({ product }: { product: Product }) {
  const pct = getStockPercentage(product.currentStock, product.maxStock);
  const urgency = getStockUrgency(product.currentStock, product.reorderPoint, product.maxStock);
  const color = urgency === 'critical' ? COLORS.error : urgency === 'low' ? COLORS.warning : COLORS.success;
  return (
    <View style={styles.healthBarTrack}>
      <View
        style={[
          styles.healthBarFill,
          { width: `${Math.round(pct * 100)}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

// ─── Product Row ─────────────────────────────────────────────────────────────

interface ProductRowProps {
  product: Product;
  isExpanded: boolean;
  onToggle: () => void;
  onEditStock: (product: Product) => void;
}

function ProductRow({ product, isExpanded, onToggle, onEditStock }: ProductRowProps) {
  const urgency = getStockUrgency(product.currentStock, product.reorderPoint, product.maxStock);
  const badgeColor = URGENCY_COLORS[urgency];
  const pct = getStockPercentage(product.currentStock, product.maxStock);

  return (
    <View style={[styles.productCard, isExpanded && styles.productCardExpanded]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={styles.productMain}>
        {/* Left: category color strip */}
        <View
          style={[
            styles.categoryStrip,
            { backgroundColor: product.categoryColor ?? COLORS.primary },
          ]}
        />

        <View style={styles.productInfo}>
          <View style={styles.productNameRow}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
            <View style={[styles.urgencyPill, { backgroundColor: badgeColor + '20' }]}>
              <Text style={[styles.urgencyPillText, { color: badgeColor }]}>
                {urgency === 'critical' ? 'CRITICAL' : urgency === 'low' ? 'LOW' : 'OK'}
              </Text>
            </View>
          </View>

          <Text style={styles.productSku}>
            {product.sku} · {product.category}
            {product.brand ? ` · ${product.brand}` : ''}
          </Text>

          <StockHealthBar product={product} />

          <View style={styles.stockRow}>
            <Text style={styles.stockText}>
              <Text style={[styles.stockCurrent, { color: badgeColor }]}>
                {product.currentStock}
              </Text>
              <Text style={styles.stockMax}>
                {' '}/ {product.maxStock} {product.unit}
              </Text>
            </Text>
            <Text style={styles.reorderText}>Reorder at {product.reorderPoint}</Text>
          </View>
        </View>

        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.textMuted}
          style={{ marginLeft: SPACING.sm }}
        />
      </TouchableOpacity>

      {/* Expanded details */}
      {isExpanded && (
        <View style={styles.expandedSection}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cost / Unit</Text>
              <Text style={styles.detailValue}>
                {product.costPerUnit ? `$${product.costPerUnit.toFixed(2)}` : '—'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Stock Value</Text>
              <Text style={styles.detailValue}>
                {product.costPerUnit
                  ? `$${(product.costPerUnit * product.currentStock).toFixed(2)}`
                  : '—'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Stock %</Text>
              <Text style={styles.detailValue}>{Math.round(pct * 100)}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Scanned</Text>
              <Text style={styles.detailValue}>
                {product.lastScanned
                  ? formatDistanceToNow(new Date(product.lastScanned), { addSuffix: true })
                  : 'Never'}
              </Text>
            </View>
          </View>
          {product.description && (
            <Text style={styles.detailDescription}>{product.description}</Text>
          )}
          {product.barcode && (
            <Text style={styles.detailBarcode}>Barcode: {product.barcode}</Text>
          )}
          <TouchableOpacity
            style={styles.editStockBtn}
            onPress={() => onEditStock(product)}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.primary} />
            <Text style={styles.editStockText}>Edit Stock Level</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Add Product Modal ───────────────────────────────────────────────────────

interface AddProductModalProps {
  visible: boolean;
  locationId: string | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}

function AddProductModal({ visible, locationId, onClose, onSave }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Other');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('each');
  const [currentStock, setCurrentStock] = useState('0');
  const [reorderPoint, setReorderPoint] = useState('10');
  const [maxStock, setMaxStock] = useState('100');
  const [costPerUnit, setCostPerUnit] = useState('');

  const handleSave = () => {
    if (!name.trim() || !sku.trim()) {
      Alert.alert('Required Fields', 'Product name and SKU are required.');
      return;
    }
    const product: Product = {
      id: Date.now().toString(),
      locationId: locationId ?? 'loc-001',
      orgId: 'org-001',
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      brand: brand.trim() || undefined,
      unit,
      currentStock: parseFloat(currentStock) || 0,
      reorderPoint: parseFloat(reorderPoint) || 10,
      maxStock: parseFloat(maxStock) || 100,
      costPerUnit: costPerUnit ? parseFloat(costPerUnit) : undefined,
      lastScanned: new Date().toISOString(),
    };
    onSave(product);
    // Reset
    setName(''); setSku(''); setCategory('Other'); setBrand('');
    setUnit('each'); setCurrentStock('0'); setReorderPoint('10');
    setMaxStock('100'); setCostPerUnit('');
  };

  const UNITS = ['each', 'kg', 'lbs', 'case', 'box', 'bottle', 'can', 'gallon', 'oz'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <View style={styles.addModalSheet}>
          <View style={styles.addModalHeader}>
            <Text style={styles.addModalTitle}>Add Product</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Product Name *</Text>
            <TextInput style={styles.field} value={name} onChangeText={setName} placeholder="e.g. Whole Milk" placeholderTextColor={COLORS.textMuted} />

            <Text style={styles.fieldLabel}>SKU *</Text>
            <TextInput style={styles.field} value={sku} onChangeText={setSku} placeholder="e.g. DAI001" autoCapitalize="characters" placeholderTextColor={COLORS.textMuted} />

            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {CATEGORIES.slice(1).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catChip, category === c.label && styles.catChipActive]}
                  onPress={() => setCategory(c.label)}
                >
                  <Text style={[styles.catChipText, category === c.label && styles.catChipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Brand</Text>
            <TextInput style={styles.field} value={brand} onChangeText={setBrand} placeholder="Optional" placeholderTextColor={COLORS.textMuted} />

            <Text style={styles.fieldLabel}>Unit</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.catChip, unit === u && styles.catChipActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.catChipText, unit === u && styles.catChipTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Current Stock</Text>
                <TextInput style={styles.field} value={currentStock} onChangeText={setCurrentStock} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Reorder Point</Text>
                <TextInput style={styles.field} value={reorderPoint} onChangeText={setReorderPoint} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Max Stock</Text>
                <TextInput style={styles.field} value={maxStock} onChangeText={setMaxStock} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Cost / Unit ($)</Text>
                <TextInput style={styles.field} value={costPerUnit} onChangeText={setCostPerUnit} keyboardType="numeric" placeholder="Optional" placeholderTextColor={COLORS.textMuted} />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Product</Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Edit Stock Modal ────────────────────────────────────────────────────────

interface EditStockModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (productId: string, newStock: number) => void;
}

function EditStockModal({ product, onClose, onSave }: EditStockModalProps) {
  const [value, setValue] = useState(product?.currentStock.toString() ?? '0');

  if (!product) return null;

  return (
    <Modal visible={!!product} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.editModalBackdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.editModalCard}>
            <Text style={styles.editModalTitle}>Edit Stock Level</Text>
            <Text style={styles.editModalSub}>{product.name}</Text>
            <TextInput
              style={styles.editModalInput}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.editModalUnit}>{product.unit}</Text>
            <View style={styles.editModalActions}>
              <TouchableOpacity style={styles.editCancelBtn} onPress={onClose}>
                <Text style={styles.editCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editSaveBtn}
                onPress={() => {
                  const n = parseFloat(value);
                  if (!isNaN(n) && n >= 0) {
                    onSave(product.id, n);
                    onClose();
                  }
                }}
              >
                <Text style={styles.editSaveText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const { products, addProduct, updateStock, locationId } = useInventoryStore();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortKey>('name');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false)
      );
    }

    if (category !== 'all') {
      const catLabel = CATEGORIES.find((c) => c.id === category)?.label ?? '';
      list = list.filter((p) => p.category.toLowerCase() === catLabel.toLowerCase());
    }

    list.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'stock') return a.currentStock - b.currentStock;
      if (sort === 'scanned') {
        const aTime = a.lastScanned ? new Date(a.lastScanned).getTime() : 0;
        const bTime = b.lastScanned ? new Date(b.lastScanned).getTime() : 0;
        return bTime - aTime;
      }
      return 0;
    });

    return list;
  }, [products, search, category, sort]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleAddProduct = useCallback(
    (product: Product) => {
      addProduct(product);
      setShowAddModal(false);
    },
    [addProduct]
  );

  const handleSaveStock = useCallback(
    (productId: string, newStock: number) => {
      updateStock(productId, newStock);
    },
    [updateStock]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <Text style={styles.headerCount}>{products.length} products</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, SKU, category..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catScrollContent}
      >
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.catChip, category === c.id && styles.catChipActive]}
            onPress={() => setCategory(c.id)}
          >
            <Text style={[styles.catChipText, category === c.id && styles.catChipTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort bar */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {(['name', 'stock', 'scanned'] as SortKey[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.sortBtn, sort === s && styles.sortBtnActive]}
            onPress={() => setSort(s)}
          >
            <Text style={[styles.sortBtnText, sort === s && styles.sortBtnTextActive]}>
              {s === 'name' ? 'Name' : s === 'stock' ? 'Stock Level' : 'Last Scanned'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Product list */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            isExpanded={expandedId === item.id}
            onToggle={() => handleToggleExpand(item.id)}
            onEditStock={setEditProduct}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              {search ? 'Try a different search term' : 'Tap + to add your first product'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 84 }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modals */}
      <AddProductModal
        visible={showAddModal}
        locationId={locationId}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddProduct}
      />
      <EditStockModal
        product={editProduct}
        onClose={() => setEditProduct(null)}
        onSave={handleSaveStock}
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
  headerCount: { fontSize: 13, color: COLORS.primaryLight, fontWeight: '600' },

  searchRow: { backgroundColor: COLORS.surface, padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  searchInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: COLORS.text },

  catScroll: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  catScrollContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  catChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  catChipTextActive: { color: '#FFFFFF' },

  sortRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  sortLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  sortBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
  sortBtnActive: { backgroundColor: COLORS.primaryLight },
  sortBtnText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  sortBtnTextActive: { color: COLORS.primaryDark, fontWeight: '700' },

  listContent: { padding: SPACING.md, paddingBottom: 120, gap: SPACING.sm },

  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  productCardExpanded: {
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  productMain: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  categoryStrip: { width: 4, height: '100%', borderRadius: 2, marginRight: SPACING.md },
  productInfo: { flex: 1 },
  productNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 2 },
  productName: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  urgencyPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  urgencyPillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  productSku: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 },
  healthBarTrack: { height: 4, backgroundColor: COLORS.borderLight, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  healthBarFill: { height: '100%', borderRadius: 2 },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockText: { fontSize: 12 },
  stockCurrent: { fontWeight: '700', fontSize: 14 },
  stockMax: { color: COLORS.textSecondary },
  reorderText: { fontSize: 11, color: COLORS.textMuted },

  expandedSection: {
    borderTopWidth: 1, borderTopColor: COLORS.borderLight,
    padding: SPACING.md, backgroundColor: COLORS.background,
  },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  detailItem: {
    flex: 1, minWidth: '44%',
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  detailLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  detailDescription: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.sm, lineHeight: 18 },
  detailBarcode: { fontSize: 11, fontFamily: 'monospace', color: COLORS.textMuted, marginBottom: SPACING.sm },
  editStockBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  editStockText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary },

  fab: {
    position: 'absolute', right: SPACING.lg,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.lg,
  },

  // Add modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  addModalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl, maxHeight: '90%',
  },
  addModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  addModalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4, marginTop: SPACING.sm },
  field: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    fontSize: 14, color: COLORS.text, backgroundColor: COLORS.background,
  },
  fieldRow: { flexDirection: 'row', gap: SPACING.sm },
  fieldHalf: { flex: 1 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.lg },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  // Edit modal
  editModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  editModalCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl, width: '100%', alignItems: 'center',
    ...SHADOWS.lg,
  },
  editModalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  editModalSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  editModalInput: {
    fontSize: 36, fontWeight: '800', color: COLORS.text,
    textAlign: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.primary,
    paddingVertical: SPACING.sm, minWidth: 120, marginBottom: 4,
  },
  editModalUnit: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  editModalActions: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  editCancelBtn: {
    flex: 1, padding: SPACING.md, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  editCancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  editSaveBtn: {
    flex: 1, padding: SPACING.md, borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  editSaveText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
