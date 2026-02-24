import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useInventoryStore } from '@/stores/inventory';
import type { Product, ScanSession } from '@/stores/inventory';
import { identifyProduct, type ProductIdentification } from '@/services/ai';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '@/constants/theme';

type ScanMode = 'barcode' | 'photo';
type ScanState = 'idle' | 'found' | 'notfound' | 'identifying' | 'identified' | 'manual';

// ─── Overlay crosshair ───────────────────────────────────────────────────────

function ScanOverlay({ mode }: { mode: ScanMode }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.overlayTop} />
      <View style={styles.overlayMiddle}>
        <View style={styles.overlaySide} />
        <View style={[styles.scanWindow, mode === 'photo' && styles.scanWindowPhoto]}>
          {/* Corners */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          {mode === 'barcode' && <View style={styles.scanLine} />}
        </View>
        <View style={styles.overlaySide} />
      </View>
      <View style={styles.overlayBottom}>
        <Text style={styles.overlayHint}>
          {mode === 'barcode' ? 'Align barcode within the frame' : 'Position product in frame'}
        </Text>
      </View>
    </View>
  );
}

// ─── Confidence Bar ──────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.min(1, Math.max(0, value));
  const color = pct >= 0.8 ? COLORS.success : pct >= 0.5 ? COLORS.warning : COLORS.error;
  return (
    <View style={styles.confidenceRow}>
      <Text style={styles.confidenceLabel}>AI Confidence</Text>
      <View style={styles.confidenceTrack}>
        <View style={[styles.confidenceFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.confidencePct, { color }]}>{Math.round(pct * 100)}%</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [mode, setMode] = useState<ScanMode>('barcode');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [identification, setIdentification] = useState<ProductIdentification | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [manualSku, setManualSku] = useState('');
  const [isScanLocked, setIsScanLocked] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'remove' | 'count'>('add');

  const { products, updateStock, addProduct, addScan, locationId } = useInventoryStore();

  // Reset scan state
  const resetScan = useCallback(() => {
    setScanState('idle');
    setScannedBarcode(null);
    setFoundProduct(null);
    setIdentification(null);
    setQuantity(1);
    setIsScanLocked(false);
    setShowResultModal(false);
    setManualSku('');
  }, []);

  // On barcode detected
  const handleBarcodeScanned = useCallback(
    ({ data }: BarcodeScanningResult) => {
      if (isScanLocked) return;
      setIsScanLocked(true);
      Vibration.vibrate(80);

      setScannedBarcode(data);
      const match = products.find((p) => p.barcode === data || p.sku === data);
      if (match) {
        setFoundProduct(match);
        setScanState('found');
      } else {
        setScanState('notfound');
      }
      setShowResultModal(true);
    },
    [isScanLocked, products]
  );

  // Capture photo for AI identification
  const handleCapturePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    setScanState('identifying');

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (!photo?.base64) throw new Error('No image data');

      const result = await identifyProduct(photo.base64);
      setIdentification(result);
      setScanState('identified');
      setShowResultModal(true);
    } catch (err) {
      setScanState('idle');
      Alert.alert('Identification Failed', 'Could not identify the product. Please try again or enter manually.');
    }
  }, []);

  // Manual lookup
  const handleManualLookup = useCallback(() => {
    const match = products.find(
      (p) => p.sku.toLowerCase() === manualSku.toLowerCase()
    );
    if (match) {
      setFoundProduct(match);
      setScanState('found');
    } else {
      setScanState('notfound');
    }
    setShowResultModal(true);
  }, [manualSku, products]);

  // Update stock for found product
  const handleUpdateStock = useCallback(() => {
    if (!foundProduct) return;
    const delta = actionType === 'add' ? quantity : actionType === 'remove' ? -quantity : 0;
    const newStock =
      actionType === 'count' ? quantity : Math.max(0, foundProduct.currentStock + delta);

    updateStock(foundProduct.id, newStock);

    const session: ScanSession = {
      id: Date.now().toString(),
      productId: foundProduct.id,
      productName: foundProduct.name,
      quantity: actionType === 'count' ? quantity : delta,
      action: actionType,
      scannedAt: new Date().toISOString(),
    };
    addScan(session);
    resetScan();
    Alert.alert('Updated', `${foundProduct.name} stock updated to ${newStock} ${foundProduct.unit}`);
  }, [foundProduct, actionType, quantity, updateStock, addScan, resetScan]);

  // Add new product from AI identification
  const handleAddFromAI = useCallback(() => {
    if (!identification || !locationId) return;

    const newProduct: Product = {
      id: Date.now().toString(),
      locationId,
      orgId: 'org-001',
      name: identification.name,
      sku: identification.suggestedSku,
      category: identification.category,
      brand: identification.brand,
      unit: identification.unit,
      description: identification.description,
      currentStock: quantity,
      reorderPoint: 10,
      maxStock: 100,
      costPerUnit: identification.estimatedCost,
      barcode: scannedBarcode ?? undefined,
      lastScanned: new Date().toISOString(),
    };

    addProduct(newProduct);

    const session: ScanSession = {
      id: Date.now().toString(),
      productId: newProduct.id,
      productName: newProduct.name,
      identification,
      quantity,
      action: 'add',
      scannedAt: new Date().toISOString(),
    };
    addScan(session);
    resetScan();
    Alert.alert('Product Added', `${identification.name} has been added to inventory with ${quantity} ${identification.unit}.`);
  }, [identification, locationId, quantity, scannedBarcode, addProduct, addScan, resetScan]);

  // Permission gate
  if (!permission) {
    return (
      <View style={styles.permCenter}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={[styles.permCenter, { paddingTop: insets.top }]}>
        <Ionicons name="camera-outline" size={56} color={COLORS.textMuted} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSubtitle}>
          StockPulse needs camera access to scan barcodes and identify products.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Product</Text>
        <View style={styles.modeSwitcher}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'barcode' && styles.modeBtnActive]}
            onPress={() => { setMode('barcode'); resetScan(); }}
          >
            <Ionicons
              name="barcode-outline"
              size={16}
              color={mode === 'barcode' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.modeBtnText, mode === 'barcode' && styles.modeBtnTextActive]}>
              Barcode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'photo' && styles.modeBtnActive]}
            onPress={() => { setMode('photo'); resetScan(); }}
          >
            <Ionicons
              name="camera-outline"
              size={16}
              color={mode === 'photo' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.modeBtnText, mode === 'photo' && styles.modeBtnTextActive]}>
              AI Identify
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={
            mode === 'barcode'
              ? {
                  barcodeTypes: [
                    'qr', 'ean13', 'ean8', 'upc_a', 'upc_e',
                    'code128', 'code39', 'itf14',
                  ],
                }
              : undefined
          }
          onBarcodeScanned={mode === 'barcode' && !isScanLocked ? handleBarcodeScanned : undefined}
        />
        <ScanOverlay mode={mode} />

        {/* AI identifying spinner */}
        {scanState === 'identifying' && (
          <View style={styles.identifyingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.identifyingText}>Identifying product...</Text>
          </View>
        )}

        {/* Capture button (photo mode) */}
        {mode === 'photo' && scanState !== 'identifying' && (
          <View style={[styles.captureRow, { bottom: 40 }]}>
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapturePhoto}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
          </View>
        )}

        {/* Scan again button (barcode mode, locked) */}
        {mode === 'barcode' && isScanLocked && !showResultModal && (
          <View style={[styles.captureRow, { bottom: 40 }]}>
            <TouchableOpacity style={styles.rescanBtn} onPress={resetScan}>
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.rescanText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Manual entry */}
      <View style={styles.manualRow}>
        <TextInput
          style={styles.manualInput}
          placeholder="Enter SKU manually..."
          placeholderTextColor={COLORS.textMuted}
          value={manualSku}
          onChangeText={setManualSku}
          autoCapitalize="characters"
          returnKeyType="search"
          onSubmitEditing={handleManualLookup}
        />
        <TouchableOpacity style={styles.manualBtn} onPress={handleManualLookup}>
          <Ionicons name="search" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="slide"
        onRequestClose={resetScan}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {/* FOUND */}
            {scanState === 'found' && foundProduct && (
              <>
                <View style={styles.modalFoundBadge}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  <Text style={[styles.modalFoundText, { color: COLORS.success }]}>Product Found</Text>
                </View>
                <Text style={styles.modalProductName}>{foundProduct.name}</Text>
                <Text style={styles.modalProductMeta}>
                  {foundProduct.sku} · {foundProduct.category} · {foundProduct.brand ?? ''}
                </Text>
                <View style={styles.stockInfoRow}>
                  <View style={styles.stockInfoItem}>
                    <Text style={styles.stockInfoLabel}>Current Stock</Text>
                    <Text style={styles.stockInfoValue}>{foundProduct.currentStock}</Text>
                  </View>
                  <View style={styles.stockInfoItem}>
                    <Text style={styles.stockInfoLabel}>Reorder At</Text>
                    <Text style={styles.stockInfoValue}>{foundProduct.reorderPoint}</Text>
                  </View>
                  <View style={styles.stockInfoItem}>
                    <Text style={styles.stockInfoLabel}>Unit</Text>
                    <Text style={styles.stockInfoValue}>{foundProduct.unit}</Text>
                  </View>
                </View>

                {/* Action toggle */}
                <View style={styles.actionToggleRow}>
                  {(['add', 'remove', 'count'] as const).map((a) => (
                    <TouchableOpacity
                      key={a}
                      style={[styles.actionToggleBtn, actionType === a && styles.actionToggleBtnActive]}
                      onPress={() => setActionType(a)}
                    >
                      <Text style={[styles.actionToggleText, actionType === a && styles.actionToggleTextActive]}>
                        {a.charAt(0).toUpperCase() + a.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quantity selector */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Ionicons name="remove" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => q + 1)}
                  >
                    <Ionicons name="add" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdateStock}>
                  <Text style={styles.primaryBtnText}>Update Stock</Text>
                </TouchableOpacity>
              </>
            )}

            {/* NOT FOUND */}
            {scanState === 'notfound' && (
              <>
                <View style={styles.modalFoundBadge}>
                  <Ionicons name="help-circle" size={18} color={COLORS.warning} />
                  <Text style={[styles.modalFoundText, { color: COLORS.warning }]}>Product Not Found</Text>
                </View>
                <Text style={styles.modalProductName}>
                  {scannedBarcode ? `Barcode: ${scannedBarcode}` : 'Unknown SKU'}
                </Text>
                <Text style={styles.modalProductMeta}>
                  This product is not in your inventory yet.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: SPACING.md }]}
                  onPress={() => {
                    setShowResultModal(false);
                    setMode('photo');
                    setScanState('idle');
                    setIsScanLocked(false);
                  }}
                >
                  <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Take Photo to Identify</Text>
                </TouchableOpacity>
              </>
            )}

            {/* IDENTIFIED */}
            {scanState === 'identified' && identification && (
              <>
                <View style={styles.modalFoundBadge}>
                  <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                  <Text style={[styles.modalFoundText, { color: COLORS.primary }]}>AI Identified</Text>
                </View>
                <Text style={styles.modalProductName}>{identification.name}</Text>
                {identification.brand && (
                  <Text style={styles.modalProductMeta}>{identification.brand}</Text>
                )}
                <Text style={styles.identDescription}>{identification.description}</Text>
                <View style={styles.stockInfoRow}>
                  <View style={styles.stockInfoItem}>
                    <Text style={styles.stockInfoLabel}>Category</Text>
                    <Text style={styles.stockInfoValue}>{identification.category}</Text>
                  </View>
                  <View style={styles.stockInfoItem}>
                    <Text style={styles.stockInfoLabel}>Unit</Text>
                    <Text style={styles.stockInfoValue}>{identification.unit}</Text>
                  </View>
                  <View style={styles.stockInfoItem}>
                    <Text style={styles.stockInfoLabel}>Est. Cost</Text>
                    <Text style={styles.stockInfoValue}>
                      {identification.estimatedCost ? `$${identification.estimatedCost}` : 'N/A'}
                    </Text>
                  </View>
                </View>
                <ConfidenceBar value={identification.confidence} />

                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Ionicons name="remove" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => q + 1)}
                  >
                    <Ionicons name="add" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleAddFromAI}>
                  <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Add to Inventory</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.cancelBtn} onPress={resetScan}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const SCAN_WINDOW_SIZE = 240;
const CORNER_SIZE = 20;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  permCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, backgroundColor: COLORS.background, gap: SPACING.md },
  permTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  permSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  permBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.full, marginTop: SPACING.sm },
  permBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  header: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  modeSwitcher: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BORDER_RADIUS.full, padding: 2 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
  modeBtnActive: { backgroundColor: COLORS.primary },
  modeBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  modeBtnTextActive: { color: '#FFFFFF' },

  cameraContainer: { flex: 1, position: 'relative' },

  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  overlayMiddle: { flexDirection: 'row', height: SCAN_WINDOW_SIZE },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'flex-start', paddingTop: SPACING.lg },
  overlayHint: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' },
  scanWindow: { width: SCAN_WINDOW_SIZE, height: SCAN_WINDOW_SIZE / 2.5, borderRadius: 4 },
  scanWindowPhoto: { height: SCAN_WINDOW_SIZE },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.9,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  identifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  identifyingText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  captureRow: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#FFFFFF',
  },
  captureBtnInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFFFFF' },
  rescanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.full,
  },
  rescanText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  manualRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  manualInput: {
    flex: 1, backgroundColor: '#2a2a2a',
    borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md,
    paddingVertical: 10, color: '#FFFFFF', fontSize: 14,
    borderWidth: 1, borderColor: '#444',
  },
  manualBtn: {
    backgroundColor: COLORS.primary, width: 44, height: 44,
    borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center',
  },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: 36,
    ...SHADOWS.lg,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.borderLight, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  modalFoundBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  modalFoundText: { fontSize: 13, fontWeight: '700' },
  modalProductName: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  modalProductMeta: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md },
  identDescription: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 19 },

  stockInfoRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  stockInfoItem: {
    flex: 1, backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center',
  },
  stockInfoLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 2 },
  stockInfoValue: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  actionToggleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  actionToggleBtn: {
    flex: 1, paddingVertical: 8, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.borderLight, alignItems: 'center',
  },
  actionToggleBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  actionToggleText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  actionToggleTextActive: { color: COLORS.primaryDark },

  qtyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.xl, marginBottom: SPACING.lg,
  },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  qtyValue: { fontSize: 28, fontWeight: '800', color: COLORS.text, minWidth: 48, textAlign: 'center' },

  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  confidenceLabel: { fontSize: 12, color: COLORS.textSecondary, width: 90 },
  confidenceTrack: { flex: 1, height: 6, backgroundColor: COLORS.borderLight, borderRadius: 3, overflow: 'hidden' },
  confidenceFill: { height: '100%', borderRadius: 3 },
  confidencePct: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },

  primaryBtn: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: SPACING.sm,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  cancelBtn: { paddingVertical: SPACING.md, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
});
