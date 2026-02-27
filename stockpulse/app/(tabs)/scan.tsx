import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';

export default function ScanTab() {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    router.push('/scanner');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Scan Products</Text>
        <Text style={styles.subtitle}>Use your camera to scan barcodes and update inventory</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={handleScan}>
          <Text style={styles.scanBtnText}>Open Scanner</Text>
        </TouchableOpacity>
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Scans</Text>
          {['ACC-IP15-CLR', 'AUD-WE-001', 'BEV-CF-12'].map(sku => (
            <View key={sku} style={styles.historyItem}>
              <Text style={styles.historyItemSku}>{sku}</Text>
              <Text style={styles.historyItemTime}>Just now</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FDF4' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F4C3A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 32 },
  scanBtn: { backgroundColor: '#0F4C3A', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 32 },
  scanBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  historySection: { flex: 1 },
  historyTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  historyItem: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: '#D1FAE5' },
  historyItemSku: { fontSize: 13, fontWeight: '600', color: '#0F4C3A', fontFamily: 'monospace' },
  historyItemTime: { fontSize: 12, color: '#94A3B8' },
});
