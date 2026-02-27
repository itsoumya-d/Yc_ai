import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { router } from 'expo-router';

const CATEGORIES = ['All', 'Electronics', 'Apparel', 'Food & Bev', 'Home Goods', 'Seasonal'];

const INVENTORY = [
  { id: '1', name: 'iPhone 15 Pro Case - Clear', sku: 'ACC-IP15-CLR', category: 'Electronics', qty: 12, min: 20, price: 24.99, trend: 'down' },
  { id: '2', name: 'Wireless Earbuds Pro', sku: 'AUD-WE-001', category: 'Electronics', qty: 45, min: 15, price: 79.99, trend: 'up' },
  { id: '3', name: 'Cotton Crew T-Shirt M', sku: 'APP-TS-M-WHT', category: 'Apparel', qty: 3, min: 25, price: 19.99, trend: 'down' },
  { id: '4', name: 'Craft Coffee Blend 12oz', sku: 'BEV-CF-12', category: 'Food & Bev', qty: 67, min: 30, price: 14.99, trend: 'stable' },
  { id: '5', name: 'Bamboo Cutting Board', sku: 'HOM-CB-LG', category: 'Home Goods', qty: 8, min: 10, price: 34.99, trend: 'up' },
  { id: '6', name: 'Bluetooth Speaker Mini', sku: 'AUD-BS-MINI', category: 'Electronics', qty: 29, min: 12, price: 49.99, trend: 'stable' },
];

const LOW_STOCK = INVENTORY.filter(i => i.qty <= i.min);

export default function InventoryScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = INVENTORY.filter(item => {
    const matchCat = category === 'All' || item.category === category;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stockStatus = (item: typeof INVENTORY[0]) => {
    if (item.qty === 0) return { label: 'Out', bg: '#FEE2E2', text: '#991B1B' };
    if (item.qty <= item.min) return { label: 'Low', bg: '#FEF9C3', text: '#713F12' };
    return { label: 'OK', bg: '#D1FAE5', text: '#065F46' };
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>StockPulse</Text>
            <Text style={styles.subtitle}>Main Store - Portland, OR</Text>
          </View>
          <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/scanner')}>
            <Text style={styles.scanBtnText}>Scan Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{INVENTORY.length}</Text>
            <Text style={styles.statLabel}>Total SKUs</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#FCA5A5' }]}>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>{LOW_STOCK.length}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.2K stock value</Text>
            <Text style={styles.statLabel}>Stock Value</Text>
          </View>
        </View>

        {LOW_STOCK.length > 0 && (
          <View style={styles.alertBanner}>
            <Text style={styles.alertTitle}>Reorder Needed</Text>
            <Text style={styles.alertText}>{LOW_STOCK.length} items below minimum threshold</Text>
            <TouchableOpacity style={styles.alertBtn} onPress={() => router.push('/reorder')}>
              <Text style={styles.alertBtnText}>Create PO</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.aiScanCard}>
          <View style={styles.aiScanLeft}>
            <Text style={styles.aiScanTitle}>AI Inventory Scan</Text>
            <Text style={styles.aiScanText}>Scan any product barcode or use AI camera to identify and update inventory instantly.</Text>
          </View>
          <TouchableOpacity style={styles.aiScanBtn} onPress={() => router.push('/scanner')}>
            <Text style={styles.aiScanBtnText}>Scan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or SKU..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={[styles.catPill, category === cat && styles.catPillActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.catPillText, category === cat && styles.catPillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle}>{filtered.length} Products</Text>
        {filtered.map(item => {
          const status = stockStatus(item);
          return (
            <TouchableOpacity key={item.id} style={styles.itemCard} onPress={() => router.push('/product/' + item.id)}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSku}>{item.sku}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              <View style={styles.itemRight}>
                <View style={[styles.stockBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.stockText, { color: status.text }]}>{status.label}</Text>
                </View>
                <Text style={styles.itemQty}>{item.qty} units</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FDF4' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F4C3A', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  scanBtn: { backgroundColor: '#0F4C3A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  scanBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#D1FAE5' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#0F4C3A' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2, textAlign: 'center' },
  alertBanner: { backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertTitle: { fontSize: 13, fontWeight: '800', color: '#991B1B', flex: 1 },
  alertText: { fontSize: 11, color: '#DC2626', flex: 2 },
  alertBtn: { backgroundColor: '#DC2626', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  alertBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  aiScanCard: { backgroundColor: '#ECFDF5', borderRadius: 14, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  aiScanLeft: { flex: 1 },
  aiScanTitle: { fontSize: 14, fontWeight: '800', color: '#065F46', marginBottom: 4 },
  aiScanText: { fontSize: 12, color: '#047857', lineHeight: 17 },
  aiScanBtn: { backgroundColor: '#0F4C3A', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  aiScanBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  searchRow: { marginBottom: 12 },
  searchInput: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#0F172A', borderWidth: 1, borderColor: '#D1FAE5' },
  categoryScroll: { marginBottom: 16 },
  catPill: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1.5, borderColor: '#D1FAE5' },
  catPillActive: { backgroundColor: '#0F4C3A', borderColor: '#0F4C3A' },
  catPillText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  catPillTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  itemCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#D1FAE5' },
  itemLeft: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  itemSku: { fontSize: 11, color: '#0F4C3A', fontWeight: '600', marginBottom: 2, fontFamily: 'monospace' },
  itemCategory: { fontSize: 11, color: '#94A3B8' },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  stockBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  stockText: { fontSize: 10, fontWeight: '800' },
  itemQty: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  itemPrice: { fontSize: 12, color: '#6B7280' },
});
