import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
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

export default function ReportsScreen() {
  const { products, recentActivity } = useInventoryStore();

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const outOfStock = products.filter(p => p.quantity === 0);
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minThreshold);

  const byCategory = [...new Set(products.map(p => p.category))].map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    return {
      category: cat,
      count: catProducts.length,
      value: catProducts.reduce((s, p) => s + p.quantity * p.price, 0),
      lowCount: catProducts.filter(p => p.quantity <= p.minThreshold).length,
    };
  });

  const maxVal = Math.max(...byCategory.map(c => c.value), 1);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Reports</Text>
        <Text style={s.sub}>Inventory analytics</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Key metrics */}
        <View style={s.metricsGrid}>
          <View style={[s.metricCard, { borderTopColor: BLUE }]}>
            <Text style={[s.metricNum, { color: BLUE }]}>{totalProducts}</Text>
            <Text style={s.metricLabel}>SKUs</Text>
          </View>
          <View style={[s.metricCard, { borderTopColor: GREEN }]}>
            <Text style={[s.metricNum, { color: GREEN }]}>${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
            <Text style={s.metricLabel}>Total Value</Text>
          </View>
          <View style={[s.metricCard, { borderTopColor: outOfStock.length > 0 ? RED : GREEN }]}>
            <Text style={[s.metricNum, { color: outOfStock.length > 0 ? RED : GREEN }]}>{outOfStock.length}</Text>
            <Text style={s.metricLabel}>Out of Stock</Text>
          </View>
          <View style={[s.metricCard, { borderTopColor: lowStock.length > 0 ? AMBER : GREEN }]}>
            <Text style={[s.metricNum, { color: lowStock.length > 0 ? AMBER : GREEN }]}>{lowStock.length}</Text>
            <Text style={s.metricLabel}>Low Stock</Text>
          </View>
        </View>

        {/* Alerts */}
        {outOfStock.length > 0 && (
          <View style={s.alertCard}>
            <View style={s.alertHeader}>
              <Ionicons name="warning" size={18} color={RED} />
              <Text style={[s.alertTitle, { color: RED }]}>Out of Stock ({outOfStock.length})</Text>
            </View>
            {outOfStock.map(p => (
              <View key={p.id} style={s.alertRow}>
                <View style={s.alertLeft}>
                  <Text style={s.alertName}>{p.name}</Text>
                  <Text style={s.alertSku}>{p.sku}</Text>
                </View>
                <TouchableOpacity
                  style={s.orderBtn}
                  onPress={() => Alert.alert('Reorder', `Create PO for ${p.name}?`)}
                >
                  <Text style={s.orderBtnText}>Order</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {lowStock.length > 0 && (
          <View style={[s.alertCard, { borderColor: `${AMBER}40` }]}>
            <View style={s.alertHeader}>
              <Ionicons name="alert-circle" size={18} color={AMBER} />
              <Text style={[s.alertTitle, { color: AMBER }]}>Low Stock ({lowStock.length})</Text>
            </View>
            {lowStock.map(p => (
              <View key={p.id} style={s.alertRow}>
                <View style={s.alertLeft}>
                  <Text style={s.alertName}>{p.name}</Text>
                  <Text style={s.alertSku}>{p.quantity} / {p.minThreshold} min</Text>
                </View>
                <TouchableOpacity
                  style={[s.orderBtn, { backgroundColor: `${AMBER}15`, borderColor: `${AMBER}30` }]}
                  onPress={() => Alert.alert('Reorder', `Create PO for ${p.name}?`)}
                >
                  <Text style={[s.orderBtnText, { color: AMBER }]}>Order</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Value by category */}
        <View style={s.catCard}>
          <Text style={s.cardTitle}>Value by Category</Text>
          {byCategory.map(cat => (
            <View key={cat.category} style={s.catRow}>
              <Text style={s.catLabel}>{cat.category}</Text>
              <View style={s.catBarWrap}>
                <View style={[s.catBar, { width: `${(cat.value / maxVal) * 100}%` as any }]} />
              </View>
              <Text style={s.catValue}>${cat.value.toFixed(0)}</Text>
            </View>
          ))}
        </View>

        {/* Inventory health */}
        <View style={s.healthCard}>
          <Text style={s.cardTitle}>Inventory Health</Text>
          <View style={s.healthRow}>
            {[
              { label: 'Healthy', count: products.filter(p => p.quantity > p.minThreshold).length, color: GREEN },
              { label: 'Low', count: lowStock.length, color: AMBER },
              { label: 'Out', count: outOfStock.length, color: RED },
            ].map(h => (
              <View key={h.label} style={s.healthStat}>
                <View style={[s.healthBar, { backgroundColor: `${h.color}20`, borderColor: h.color }]}>
                  <Text style={[s.healthNum, { color: h.color }]}>{h.count}</Text>
                </View>
                <Text style={s.healthLabel}>{h.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent activity */}
        <View style={s.actCard}>
          <Text style={s.cardTitle}>Recent Activity</Text>
          {recentActivity.slice(0, 6).map(ev => (
            <View key={ev.id} style={s.actRow}>
              <View style={[s.actIcon, { backgroundColor: ev.type === 'add' ? `${GREEN}20` : `${RED}20` }]}>
                <Ionicons name={ev.type === 'add' ? 'add' : 'remove'} size={14} color={ev.type === 'add' ? GREEN : RED} />
              </View>
              <View style={s.actLeft}>
                <Text style={s.actName} numberOfLines={1}>{ev.productName}</Text>
                <Text style={s.actMeta}>{ev.user} · {ev.timestamp}</Text>
              </View>
              <Text style={[s.actQty, { color: ev.type === 'add' ? GREEN : RED }]}>
                {ev.type === 'add' ? '+' : '-'}{ev.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* Export */}
        <View style={s.exportSection}>
          <Text style={s.cardTitle}>Export Reports</Text>
          {[
            { icon: '📊', label: 'Full Inventory Report', desc: 'All SKUs with current stock levels' },
            { icon: '⚠️', label: 'Low Stock Alert Report', desc: 'Items below reorder threshold' },
            { icon: '📈', label: 'Valuation Report', desc: 'Total inventory value by category' },
            { icon: '🔄', label: 'Activity Log', desc: 'All stock movements in period' },
          ].map(exp => (
            <TouchableOpacity
              key={exp.label}
              style={s.exportCard}
              onPress={() => Alert.alert('Export', `Generating ${exp.label}...`)}
            >
              <Text style={s.exportIcon}>{exp.icon}</Text>
              <View style={s.exportInfo}>
                <Text style={s.exportLabel}>{exp.label}</Text>
                <Text style={s.exportDesc}>{exp.desc}</Text>
              </View>
              <Ionicons name="download-outline" size={18} color={BLUE} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NAVY },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  title: { fontSize: 22, fontWeight: '800', color: TEXT },
  sub: { fontSize: 13, color: TEXT2, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 14 },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  metricCard: { width: '48%', backgroundColor: CARD, borderRadius: 12, padding: 14, borderTopWidth: 3 },
  metricNum: { fontSize: 26, fontWeight: '800' },
  metricLabel: { fontSize: 12, color: TEXT2, marginTop: 2 },

  alertCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: `${RED}40` },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  alertTitle: { fontSize: 14, fontWeight: '700' },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderTopWidth: 1, borderTopColor: BORDER },
  alertLeft: { flex: 1 },
  alertName: { fontSize: 13, fontWeight: '600', color: TEXT },
  alertSku: { fontSize: 11, color: TEXT2 },
  orderBtn: { backgroundColor: `${RED}15`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: `${RED}30` },
  orderBtnText: { fontSize: 12, color: RED, fontWeight: '700' },

  catCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 14 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  catLabel: { width: 80, fontSize: 12, color: TEXT2 },
  catBarWrap: { flex: 1, height: 6, backgroundColor: NAVY, borderRadius: 3, overflow: 'hidden' },
  catBar: { height: '100%', backgroundColor: BLUE, borderRadius: 3 },
  catValue: { width: 56, fontSize: 12, color: BLUE, fontWeight: '700', textAlign: 'right' },

  healthCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  healthRow: { flexDirection: 'row', justifyContent: 'space-around' },
  healthStat: { alignItems: 'center', gap: 8 },
  healthBar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  healthNum: { fontSize: 24, fontWeight: '800' },
  healthLabel: { fontSize: 12, color: TEXT2, fontWeight: '600' },

  actCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER },
  actIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actLeft: { flex: 1 },
  actName: { fontSize: 13, fontWeight: '600', color: TEXT },
  actMeta: { fontSize: 11, color: TEXT2, marginTop: 1 },
  actQty: { fontSize: 14, fontWeight: '800' },

  exportSection: { backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  exportCard: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: BORDER },
  exportIcon: { fontSize: 20, width: 30, textAlign: 'center' },
  exportInfo: { flex: 1 },
  exportLabel: { fontSize: 13, fontWeight: '700', color: TEXT },
  exportDesc: { fontSize: 11, color: TEXT2, marginTop: 2 },
});
