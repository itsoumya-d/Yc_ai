import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const TOP_SELLERS = [
  { name: 'Wireless Earbuds Pro', units: 142, revenue: 11358.58 },
  { name: 'Craft Coffee Blend 12oz', units: 312, revenue: 4677.00 },
  { name: 'Bluetooth Speaker Mini', units: 67, revenue: 3349.33 },
];

export default function ReportsScreen() {
  const metrics = [
    { label: 'Total Revenue', value: '38,420 USD', change: 'up 12.4', positive: true },
    { label: 'Units Sold', value: '1,284 units', change: 'up 8.2', positive: true },
    { label: 'Inventory Turnover', value: '4.2x rate', change: 'down 0.3', positive: false },
    { label: 'Shrinkage Rate', value: '1.8 loss', change: 'down 0.4', positive: true },
  ];
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Last 30 days - Main Store</Text>
        <View style={styles.grid}>
          {metrics.map(m => (
            <View key={m.label} style={styles.metricCard}>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={[styles.metricChange, { color: m.positive ? '#22C55E' : '#EF4444' }]}>{m.change}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Top Sellers</Text>
        {TOP_SELLERS.map(item => (
          <View key={item.name} style={styles.sellerRow}>
            <Text style={styles.sellerName}>{item.name}</Text>
            <View style={styles.sellerRight}>
              <Text style={styles.sellerUnits}>{item.units} units</Text>
              <Text style={styles.sellerRevenue}>{item.revenue.toFixed(2)} USD</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FDF4' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F4C3A', paddingTop: 20, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  metricCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#D1FAE5' },
  metricValue: { fontSize: 18, fontWeight: '900', color: '#0F4C3A', marginBottom: 4 },
  metricLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  metricChange: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  sellerRow: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#D1FAE5' },
  sellerName: { fontSize: 13, fontWeight: '600', color: '#0F172A', flex: 1 },
  sellerRight: { alignItems: 'flex-end' },
  sellerUnits: { fontSize: 13, fontWeight: '700', color: '#0F4C3A' },
  sellerRevenue: { fontSize: 12, color: '#6B7280' },
});
