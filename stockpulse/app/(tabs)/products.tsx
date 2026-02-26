import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventoryStore } from '../../store/inventory-store';

const BLUE = '#00B4D8';
const AMBER = '#F59E0B';
const RED = '#EF4444';
const GREEN = '#10B981';
const NAVY = '#0F1923';
const CARD = '#162330';
const BORDER = '#1E3045';
const TEXT = '#E2E8F0';
const TEXT2 = '#8A9BB0';

const CATEGORIES = ['All', 'Packaging', 'Safety', 'Labels', 'Equipment'];

export default function ProductsScreen() {
  const { products, searchQuery, selectedCategory, setSearchQuery, setSelectedCategory, adjustQuantity } = useInventoryStore();
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'alert'>('alert');

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (sortBy === 'alert') {
      const aAlert = a.quantity === 0 ? 2 : a.quantity <= a.minThreshold ? 1 : 0;
      const bAlert = b.quantity === 0 ? 2 : b.quantity <= b.minThreshold ? 1 : 0;
      return bAlert - aAlert;
    }
    if (sortBy === 'quantity') return a.quantity - b.quantity;
    return a.name.localeCompare(b.name);
  });

  const outOfStock = products.filter(p => p.quantity === 0).length;
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minThreshold).length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Products</Text>
        <View style={s.headerBadges}>
          {outOfStock > 0 && (
            <View style={[s.badge, { backgroundColor: `${RED}20` }]}>
              <Text style={[s.badgeText, { color: RED }]}>{outOfStock} out</Text>
            </View>
          )}
          {lowStock > 0 && (
            <View style={[s.badge, { backgroundColor: `${AMBER}20` }]}>
              <Text style={[s.badgeText, { color: AMBER }]}>{lowStock} low</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Ionicons name="search" size={18} color={TEXT2} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name or SKU..."
          placeholderTextColor={TEXT2}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={TEXT2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillsRow} contentContainerStyle={s.pills}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[s.pill, (cat === 'All' ? !selectedCategory : selectedCategory === cat) && s.pillActive]}
            onPress={() => setSelectedCategory(cat === 'All' ? null : cat)}
          >
            <Text style={[s.pillText, (cat === 'All' ? !selectedCategory : selectedCategory === cat) && s.pillTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort row */}
      <View style={s.sortRow}>
        <Text style={s.sortLabel}>Sort: </Text>
        {[
          { key: 'alert', label: '⚠️ Alert first' },
          { key: 'quantity', label: '📦 Qty' },
          { key: 'name', label: '🔤 Name' },
        ].map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[s.sortBtn, sortBy === opt.key && s.sortBtnActive]}
            onPress={() => setSortBy(opt.key as typeof sortBy)}
          >
            <Text style={[s.sortBtnText, sortBy === opt.key && s.sortBtnTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {filtered.map(product => {
          const isOut = product.quantity === 0;
          const isLow = product.quantity > 0 && product.quantity <= product.minThreshold;
          const statusColor = isOut ? RED : isLow ? AMBER : GREEN;

          return (
            <View key={product.id} style={[s.productCard, isOut && { borderLeftColor: RED, borderLeftWidth: 3 }, isLow && !isOut && { borderLeftColor: AMBER, borderLeftWidth: 3 }]}>
              <View style={s.productTop}>
                <View style={s.productLeft}>
                  <Text style={s.productName}>{product.name}</Text>
                  <Text style={s.productSku}>{product.sku} · {product.location}</Text>
                  <View style={s.productMeta}>
                    <View style={s.productCategory}>
                      <Text style={s.categoryText}>{product.category}</Text>
                    </View>
                    <Text style={s.productPrice}>${product.price.toFixed(2)}/u</Text>
                  </View>
                </View>

                <View style={s.productRight}>
                  <Text style={[s.quantity, { color: statusColor }]}>{product.quantity}</Text>
                  {isOut && <Text style={[s.stockStatus, { color: RED }]}>OUT</Text>}
                  {isLow && <Text style={[s.stockStatus, { color: AMBER }]}>LOW</Text>}
                  <Text style={s.minThreshold}>min {product.minThreshold}</Text>
                </View>
              </View>

              <View style={s.productActions}>
                <TouchableOpacity style={s.adjBtn} onPress={() => adjustQuantity(product.id, -1)}>
                  <Ionicons name="remove" size={14} color={RED} />
                </TouchableOpacity>
                <TouchableOpacity style={s.adjBtn} onPress={() => adjustQuantity(product.id, 1)}>
                  <Ionicons name="add" size={14} color={GREEN} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.reorderBtn}
                  onPress={() => Alert.alert('Reorder', `Create purchase order for ${product.name}?\n\nSuggested order: ${product.minThreshold * 2} units`)}
                >
                  <Ionicons name="cart-outline" size={14} color={BLUE} />
                  <Text style={s.reorderText}>Reorder</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="cube-outline" size={48} color={TEXT2} />
            <Text style={s.emptyTitle}>No products found</Text>
            <Text style={s.emptySub}>Try a different search or category</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NAVY },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  title: { fontSize: 22, fontWeight: '800', color: TEXT },
  headerBadges: { flexDirection: 'row', gap: 6 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: CARD, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
  searchInput: { flex: 1, fontSize: 14, color: TEXT },

  pillsRow: { backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  pills: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: NAVY, borderWidth: 1, borderColor: BORDER },
  pillActive: { backgroundColor: BLUE, borderColor: BLUE },
  pillText: { fontSize: 12, fontWeight: '600', color: TEXT2 },
  pillTextActive: { color: NAVY },

  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: CARD, gap: 6 },
  sortLabel: { fontSize: 12, color: TEXT2 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: NAVY },
  sortBtnActive: { backgroundColor: `${BLUE}20` },
  sortBtnText: { fontSize: 11, color: TEXT2 },
  sortBtnTextActive: { color: BLUE, fontWeight: '600' },

  scroll: { flex: 1 },
  content: { padding: 12 },
  productCard: { backgroundColor: CARD, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: BORDER },
  productTop: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  productLeft: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 3 },
  productSku: { fontSize: 11, color: TEXT2, fontFamily: 'monospace', marginBottom: 6 },
  productMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productCategory: { backgroundColor: `${BLUE}15`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  categoryText: { fontSize: 10, color: BLUE, fontWeight: '700' },
  productPrice: { fontSize: 11, color: TEXT2 },
  productRight: { alignItems: 'flex-end' },
  quantity: { fontSize: 28, fontWeight: '800' },
  stockStatus: { fontSize: 10, fontWeight: '800', marginTop: -4 },
  minThreshold: { fontSize: 10, color: TEXT2, marginTop: 2 },
  productActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },
  adjBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },
  reorderBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${BLUE}15`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  reorderText: { fontSize: 12, color: BLUE, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
  emptySub: { fontSize: 13, color: TEXT2 },
});
