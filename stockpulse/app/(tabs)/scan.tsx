import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { supabase } from "@/lib/supabase";
import { scanBarcode, analyzeProductImage } from "@/lib/actions/scan";
import { ScanResult } from "@/components/scan/ScanResult";
import { Button } from "@/components/ui/Button";
import type { ScanResultData } from "@/types/index";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScan = async (barcode: string) => {
    if (!barcode.trim()) {
      Alert.alert("Error", "Please enter a barcode");
      return;
    }
    setLoading(true);
    const result = await scanBarcode(barcode.trim());
    setScanResult(result);
    setLoading(false);
  };

  const handleCameraBarcode = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setCameraVisible(false);
    await handleBarcodeScan(data);
    setTimeout(() => setScanned(false), 2000);
  };

  const handleUpdateStock = async (action: "add" | "remove" | "set", quantity: number) => {
    if (!scanResult?.product) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let newQuantity = scanResult.product.stock_quantity;
    if (action === "add") newQuantity += quantity;
    else if (action === "remove") newQuantity = Math.max(0, newQuantity - quantity);
    else newQuantity = quantity;

    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq("id", scanResult.product.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // Log the scan
    await supabase.from("scan_logs").insert({
      user_id: user.id,
      product_id: scanResult.product.id,
      barcode: scanResult.product.barcode,
      action,
      quantity_change: action === "add" ? quantity : action === "remove" ? -quantity : quantity,
      previous_quantity: scanResult.product.stock_quantity,
      new_quantity: newQuantity,
    });

    setScanResult((prev) =>
      prev?.product
        ? { ...prev, product: { ...prev.product, stock_quantity: newQuantity } }
        : prev
    );
    Alert.alert("Success", `Stock updated to ${newQuantity}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Scan Product</Text>
        <Text style={styles.subtitle}>Scan a barcode or enter it manually</Text>

        {/* Camera Scanner */}
        {permission?.granted ? (
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setCameraVisible(true)}
          >
            <Text style={styles.cameraIcon}>⊡</Text>
            <Text style={styles.cameraButtonText}>Open Camera Scanner</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Grant Camera Permission
            </Text>
          </TouchableOpacity>
        )}

        {/* Manual Entry */}
        <View style={styles.manualSection}>
          <Text style={styles.sectionTitle}>Manual Entry</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.barcodeInput}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="Enter barcode (e.g. 012345678901)"
              keyboardType="numeric"
              onSubmitEditing={() => handleBarcodeScan(manualBarcode)}
              returnKeyType="search"
            />
            <Button
              label="Search"
              onPress={() => handleBarcodeScan(manualBarcode)}
              loading={loading}
              style={styles.searchButton}
            />
          </View>
        </View>

        {/* Scan Result */}
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#0f766e" />
            <Text style={styles.loadingText}>Looking up product...</Text>
          </View>
        ) : scanResult ? (
          <ScanResult
            result={scanResult}
            onUpdateStock={handleUpdateStock}
            onClear={() => setScanResult(null)}
          />
        ) : null}

        {/* Camera Modal */}
        <Modal
          visible={cameraVisible}
          animationType="slide"
          onRequestClose={() => setCameraVisible(false)}
        >
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              onBarcodeScanned={scanned ? undefined : handleCameraBarcode}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
              }}
            />
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanHint}>Align barcode within the frame</Text>
            </View>
            <TouchableOpacity
              style={styles.closeCameraButton}
              onPress={() => setCameraVisible(false)}
            >
              <Text style={styles.closeCameraText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: "#0f766e",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  cameraIcon: {
    fontSize: 22,
    color: "#ffffff",
  },
  cameraButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  permissionButton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  permissionButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
  manualSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  barcodeInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0f172a",
  },
  searchButton: {
    borderRadius: 10,
  },
  loadingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 14,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 260,
    height: 160,
    borderWidth: 2,
    borderColor: "#0f766e",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  scanHint: {
    color: "#ffffff",
    fontSize: 14,
    marginTop: 16,
    fontWeight: "500",
  },
  closeCameraButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  closeCameraText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
