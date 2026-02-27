import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

export default function ScannerScreen() {
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState('');

  const simulateScan = () => {
    const fakeBarcodes = ['ACC-IP15-CLR', 'AUD-WE-001', 'APP-TS-M-WHT', 'BEV-CF-12'];
    const picked = fakeBarcodes[Math.floor(Math.random() * fakeBarcodes.length)];
    setResult(picked);
    setScanned(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Barcode Scanner</Text>
        </View>
        <View style={styles.viewfinder}>
          <Text style={styles.viewfinderText}>Camera viewfinder</Text>
          <Text style={styles.viewfinderSubtext}>Point at a barcode to scan</Text>
        </View>
        {scanned && result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Scanned\!</Text>
            <Text style={styles.resultSku}>{result}</Text>
            <TouchableOpacity style={styles.resultBtn} onPress={() => router.push('/product/1')}>
              <Text style={styles.resultBtnText}>View Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.simulateBtn} onPress={simulateScan}>
            <Text style={styles.simulateBtnText}>Simulate Scan</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginBottom: 24 },
  closeBtn: { backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  viewfinder: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  viewfinderText: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  viewfinderSubtext: { color: '#666', fontSize: 13 },
  resultCard: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#0F4C3A' },
  resultTitle: { color: '#22C55E', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  resultSku: { color: '#fff', fontSize: 20, fontWeight: '900', fontFamily: 'monospace', marginBottom: 16 },
  resultBtn: { backgroundColor: '#0F4C3A', borderRadius: 12, padding: 14, alignItems: 'center' },
  resultBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  simulateBtn: { backgroundColor: '#0F4C3A', borderRadius: 16, padding: 18, alignItems: 'center' },
  simulateBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
