import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';
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

type ScanMode = 'idle' | 'scanning' | 'result' | 'count';

export default function ScanScreen() {
  const [mode, setMode] = useState<ScanMode>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedProduct, setScannedProduct] = useState<ReturnType<typeof useInventoryStore>['products'][0] | null>(null);
  const [countQty, setCountQty] = useState('');
  const [adjustment, setAdjustment] = useState('');
  const { products, adjustQuantity } = useInventoryStore();

  const handleScan = () => {
    Alert.alert(
      'Scan Barcode',
      'Point camera at barcode or QR code. StockPulse will automatically detect and look up the product.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Scan',
          onPress: () => {
            setMode('scanning');
            setScanProgress(0);
            let prog = 0;
            const interval = setInterval(() => {
              prog += 25;
              setScanProgress(Math.min(prog, 100));
              if (prog >= 100) {
                clearInterval(interval);
                // Pick a random product
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                setScannedProduct(randomProduct);
                setMode('result');
              }
            }, 200);
          },
        },
      ]
    );
  };

  const handleAdjust = (delta: number) => {
    if (!scannedProduct) return;
    adjustQuantity(scannedProduct.id, delta);
    setScannedProduct({ ...scannedProduct, quantity: Math.max(0, scannedProduct.quantity + delta) });
    Alert.alert('Updated', `${scannedProduct.name}: ${delta > 0 ? '+' : ''}${delta} units`);
  };

  const handleCountSubmit = () => {
    if (!scannedProduct || !countQty) return;
    const newQty = parseInt(countQty, 10);
    if (isNaN(newQty) || newQty < 0) {
      Alert.alert('Invalid', 'Please enter a valid quantity.');
      return;
    }
    const delta = newQty - scannedProduct.quantity;
    adjustQuantity(scannedProduct.id, delta);
    Alert.alert('Count Recorded', `${scannedProduct.name} updated to ${newQty} units (${delta >= 0 ? '+' : ''}${delta})`);
    setMode('idle');
    setScannedProduct(null);
    setCountQty('');
  };

  if (mode === 'scanning') {
    return (
      <SafeAreaView style={scan.safe}>
        <View style={scan.screen}>
          <View style={scan.frame}>
            <View style={[scan.corner, scan.tl]} />
            <View style={[scan.corner, scan.tr]} />
            <View style={[scan.corner, scan.bl]} />
            <View style={[scan.corner, scan.br]} />
            {/* Scan line */}
            <View style={[scan.scanLine, { top: `${scanProgress}%` as any }]} />
            <View style={scan.barcodeHint}>
              <Text style={scan.barcodeText}>|||||||||||||||||||||||||||||||</Text>
              <Text style={scan.barcodeNum}>012345 678901</Text>
            </View>
          </View>

          <View style={scan.progress}>
            <View style={scan.progressBar}>
              <View style={[scan.progressFill, { width: `${scanProgress}%` as any }]} />
            </View>
            <Text style={scan.progressText}>Scanning barcode... {scanProgress}%</Text>
          </View>

          <TouchableOpacity style={scan.cancelBtn} onPress={() => setMode('idle')}>
            <Text style={scan.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === 'result' && scannedProduct) {
    const isLow = scannedProduct.quantity <= scannedProduct.minThreshold;
    const isOut = scannedProduct.quantity === 0;

    return (
      <SafeAreaView style={s.safe}>
        <View style={s.resultHeader}>
          <TouchableOpacity onPress={() => setMode('idle')}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </TouchableOpacity>
          <Text style={s.resultTitle}>Product Found</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={s.resultContent} showsVerticalScrollIndicator={false}>
          {/* Product info */}
          <View style={s.productCard}>
            <View style={s.productTop}>
              <View>
                <Text style={s.productName}>{scannedProduct.name}</Text>
                <Text style={s.productSku}>SKU: {scannedProduct.sku}</Text>
                <Text style={s.productLoc}>📍 {scannedProduct.location}</Text>
              </View>
              <View style={s.productCategory}>
                <Text style={s.productCategoryText}>{scannedProduct.category}</Text>
              </View>
            </View>

            {/* Stock level */}
            <View style={s.stockRow}>
              <View>
                <Text style={s.stockLabel}>Current Stock</Text>
                <Text style={[s.stockQty, { color: isOut ? RED : isLow ? AMBER : BLUE }]}>
                  {scannedProduct.quantity}
                  <Text style={s.stockUnit}> units</Text>
                </Text>
                <Text style={s.stockMin}>Min: {scannedProduct.minThreshold}</Text>
              </View>
              {isOut && (
                <View style={[s.alertBadge, { backgroundColor: `${RED}20` }]}>
                  <Text style={[s.alertBadgeText, { color: RED }]}>⚠️ OUT OF STOCK</Text>
                </View>
              )}
              {isLow && !isOut && (
                <View style={[s.alertBadge, { backgroundColor: `${AMBER}20` }]}>
                  <Text style={[s.alertBadgeText, { color: AMBER }]}>⚠️ LOW STOCK</Text>
                </View>
              )}
            </View>

            <Text style={s.productPrice}>${scannedProduct.price.toFixed(2)} / unit · ${(scannedProduct.quantity * scannedProduct.price).toFixed(2)} total value</Text>
          </View>

          {/* Quick adjust */}
          <View style={s.adjustCard}>
            <Text style={s.adjustTitle}>Quick Adjust</Text>
            <View style={s.adjustRow}>
              {[-10, -5, -1].map(d => (
                <TouchableOpacity key={d} style={s.adjBtn} onPress={() => handleAdjust(d)}>
                  <Text style={[s.adjBtnText, { color: RED }]}>{d}</Text>
                </TouchableOpacity>
              ))}
              {[1, 5, 10].map(d => (
                <TouchableOpacity key={d} style={s.adjBtn} onPress={() => handleAdjust(d)}>
                  <Text style={[s.adjBtnText, { color: GREEN }]}>+{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Physical count */}
          <View style={s.countCard}>
            <Text style={s.countTitle}>Physical Count</Text>
            <Text style={s.countSub}>Enter actual count to update inventory</Text>
            <View style={s.countRow}>
              <TextInput
                style={s.countInput}
                placeholder="Actual count"
                placeholderTextColor={TEXT2}
                keyboardType="numeric"
                value={countQty}
                onChangeText={setCountQty}
              />
              <TouchableOpacity style={s.countSubmitBtn} onPress={handleCountSubmit}>
                <Text style={s.countSubmitText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={s.scanAgainBtn} onPress={() => { setMode('idle'); setScannedProduct(null); }}>
            <Text style={s.scanAgainText}>Scan Another</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Barcode Scanner</Text>
        <Text style={s.sub}>Scan to look up and update inventory</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Main scan CTA */}
        <TouchableOpacity style={s.mainScanCard} onPress={handleScan}>
          <View style={s.scanIconWrap}>
            <Ionicons name="barcode-outline" size={52} color={BLUE} />
          </View>
          <Text style={s.mainScanTitle}>Scan Barcode / QR</Text>
          <Text style={s.mainScanSub}>Tap to open camera and scan any product</Text>
        </TouchableOpacity>

        {/* Manual lookup */}
        <View style={s.manualCard}>
          <Text style={s.manualTitle}>Manual Barcode Entry</Text>
          <View style={s.manualRow}>
            <TextInput
              style={s.manualInput}
              placeholder="Enter barcode number..."
              placeholderTextColor={TEXT2}
              keyboardType="numeric"
              onSubmitEditing={(e) => {
                const found = products.find(p => p.barcode === e.nativeEvent.text);
                if (found) { setScannedProduct(found); setMode('result'); }
                else Alert.alert('Not Found', 'No product found with that barcode.');
              }}
            />
            <TouchableOpacity style={s.manualBtn}>
              <Ionicons name="search" size={18} color={NAVY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent scans */}
        <Text style={s.sectionTitle}>Quick Pick (Demo Barcodes)</Text>
        {products.slice(0, 4).map(p => (
          <TouchableOpacity key={p.id} style={s.quickCard} onPress={() => { setScannedProduct(p); setMode('result'); }}>
            <View style={s.quickLeft}>
              <Text style={s.quickBarcode}>{p.barcode}</Text>
              <Text style={s.quickName}>{p.name}</Text>
            </View>
            <View style={[s.quickQty, { backgroundColor: p.quantity === 0 ? `${RED}20` : p.quantity <= p.minThreshold ? `${AMBER}20` : `${GREEN}20` }]}>
              <Text style={[s.quickQtyNum, { color: p.quantity === 0 ? RED : p.quantity <= p.minThreshold ? AMBER : GREEN }]}>{p.quantity}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const scan = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  frame: { width: 300, height: 200, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  corner: { position: 'absolute', width: 26, height: 26, borderColor: BLUE, borderWidth: 3 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: BLUE, opacity: 0.8 },
  barcodeHint: { alignItems: 'center' },
  barcodeText: { fontSize: 22, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 },
  barcodeNum: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontFamily: 'monospace' },
  progress: { width: 300, gap: 8 },
  progressBar: { height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: BLUE, borderRadius: 2 },
  progressText: { color: TEXT2, fontSize: 12, textAlign: 'center' },
  cancelBtn: { padding: 16 },
  cancelText: { color: TEXT2, fontSize: 15 },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NAVY },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  title: { fontSize: 22, fontWeight: '800', color: TEXT },
  sub: { fontSize: 13, color: TEXT2, marginTop: 2 },
  content: { padding: 16 },
  mainScanCard: { backgroundColor: CARD, borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: `${BLUE}40`, borderStyle: 'dashed' },
  scanIconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: `${BLUE}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  mainScanTitle: { fontSize: 20, fontWeight: '800', color: TEXT, marginBottom: 8 },
  mainScanSub: { fontSize: 14, color: TEXT2, textAlign: 'center' },
  manualCard: { backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: BORDER },
  manualTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 10 },
  manualRow: { flexDirection: 'row', gap: 8 },
  manualInput: { flex: 1, backgroundColor: NAVY, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: TEXT, fontSize: 14, borderWidth: 1, borderColor: BORDER, fontFamily: 'monospace' },
  manualBtn: { width: 46, backgroundColor: BLUE, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT2, marginBottom: 10 },
  quickCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: BORDER },
  quickLeft: { flex: 1 },
  quickBarcode: { fontSize: 11, color: TEXT2, fontFamily: 'monospace', marginBottom: 3 },
  quickName: { fontSize: 13, color: TEXT, fontWeight: '600' },
  quickQty: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickQtyNum: { fontSize: 16, fontWeight: '800' },

  // Result screen
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  resultTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  resultContent: { padding: 16 },
  productCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  productTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  productName: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 4, maxWidth: 220 },
  productSku: { fontSize: 12, color: TEXT2, fontFamily: 'monospace', marginBottom: 2 },
  productLoc: { fontSize: 12, color: TEXT2 },
  productCategory: { backgroundColor: `${BLUE}20`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  productCategoryText: { fontSize: 11, color: BLUE, fontWeight: '700' },
  stockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  stockLabel: { fontSize: 12, color: TEXT2, marginBottom: 2 },
  stockQty: { fontSize: 36, fontWeight: '800' },
  stockUnit: { fontSize: 16, fontWeight: '400' },
  stockMin: { fontSize: 12, color: TEXT2 },
  alertBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  alertBadgeText: { fontSize: 12, fontWeight: '800' },
  productPrice: { fontSize: 12, color: TEXT2 },
  adjustCard: { backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  adjustTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 12 },
  adjustRow: { flexDirection: 'row', gap: 8 },
  adjBtn: { flex: 1, backgroundColor: NAVY, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  adjBtnText: { fontSize: 14, fontWeight: '800' },
  countCard: { backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  countTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 4 },
  countSub: { fontSize: 12, color: TEXT2, marginBottom: 12 },
  countRow: { flexDirection: 'row', gap: 10 },
  countInput: { flex: 1, backgroundColor: NAVY, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: TEXT, fontSize: 16, borderWidth: 1, borderColor: BORDER, fontWeight: '700' },
  countSubmitBtn: { backgroundColor: BLUE, borderRadius: 10, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  countSubmitText: { color: NAVY, fontSize: 14, fontWeight: '700' },
  scanAgainBtn: { backgroundColor: `${BLUE}15`, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: `${BLUE}30` },
  scanAgainText: { color: BLUE, fontSize: 15, fontWeight: '700' },
});
