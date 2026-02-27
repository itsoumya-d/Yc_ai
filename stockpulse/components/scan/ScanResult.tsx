import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ScanResultData } from "@/types/index";

interface ScanResultProps {
  result: ScanResultData;
  onUpdateStock: (action: "add" | "remove" | "set", quantity: number) => void;
  onClear: () => void;
}

export function ScanResult({ result, onUpdateStock, onClear }: ScanResultProps) {
  const [qty, setQty] = useState("1");
  const [action, setAction] = useState<"add" | "remove" | "set">("add");

  const handleUpdate = () => {
    const q = parseInt(qty);
    if (isNaN(q) || q <= 0) {
      Alert.alert("Error", "Enter a valid quantity");
      return;
    }
    onUpdateStock(action, q);
  };

  if (!result.found && !result.aiSuggestion) {
    return (
      <Card style={styles.card}>
        <View style={styles.notFoundHeader}>
          <Text style={styles.notFoundIcon}>⊘</Text>
          <Text style={styles.notFoundTitle}>Product Not Found</Text>
        </View>
        <Text style={styles.barcode}>{result.barcode}</Text>
        <Text style={styles.message}>
          {result.message ?? "This barcode isn't in your inventory."}
        </Text>
        <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
          <Text style={styles.clearText}>Scan Another</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  if (!result.found && result.aiSuggestion) {
    return (
      <Card style={styles.card}>
        <View style={styles.aiHeader}>
          <Text style={styles.aiIcon}>⊞</Text>
          <Text style={styles.aiTitle}>AI Suggestion</Text>
        </View>
        <Text style={styles.barcode}>{result.barcode}</Text>
        <Text style={styles.aiName}>{result.aiSuggestion.name}</Text>
        {result.aiSuggestion.category && (
          <Badge label={result.aiSuggestion.category} variant="info" style={styles.badge} />
        )}
        <Text style={styles.message}>
          Not in your inventory. Add it manually from the Inventory tab.
        </Text>
        <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
          <Text style={styles.clearText}>Scan Another</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  const product = result.product!;

  return (
    <Card style={styles.card}>
      {/* Product Info */}
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.productSku}>SKU: {product.sku}</Text>
          {product.category && (
            <Badge label={product.category} variant="default" style={styles.badge} />
          )}
        </View>
        <View style={styles.stockBubble}>
          <Text style={[styles.stockNumber, result.isOutOfStock && styles.stockDanger, result.isLowStock && styles.stockWarning]}>
            {product.stock_quantity}
          </Text>
          <Text style={styles.stockLabel}>in stock</Text>
        </View>
      </View>

      {result.isOutOfStock && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>Out of Stock!</Text>
        </View>
      )}
      {result.isLowStock && !result.isOutOfStock && (
        <View style={[styles.alert, styles.alertWarning]}>
          <Text style={[styles.alertText, styles.alertTextWarning]}>
            Low Stock — below threshold of {product.low_stock_threshold}
          </Text>
        </View>
      )}

      {/* Update Stock */}
      <View style={styles.updateSection}>
        <Text style={styles.updateTitle}>Update Stock</Text>

        {/* Action Selector */}
        <View style={styles.actionRow}>
          {(["add", "remove", "set"] as const).map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.actionBtn, action === a && styles.actionBtnActive]}
              onPress={() => setAction(a)}
            >
              <Text style={[styles.actionText, action === a && styles.actionTextActive]}>
                {a === "add" ? "Add" : a === "remove" ? "Remove" : "Set"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.qtyRow}>
          <TextInput
            style={styles.qtyInput}
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
            placeholder="Quantity"
          />
          <Button label="Update" onPress={handleUpdate} style={styles.updateBtn} />
        </View>
      </View>

      <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
        <Text style={styles.clearText}>Scan Another</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  notFoundHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  notFoundIcon: { fontSize: 20, color: "#94a3b8" },
  notFoundTitle: { fontSize: 16, fontWeight: "700", color: "#374151" },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  aiIcon: { fontSize: 20, color: "#3b82f6" },
  aiTitle: { fontSize: 16, fontWeight: "700", color: "#1d4ed8" },
  aiName: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  barcode: { fontSize: 13, color: "#94a3b8", fontFamily: "monospace", marginBottom: 8 },
  message: { fontSize: 13, color: "#64748b", marginTop: 8 },
  productHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  productInfo: { flex: 1, marginRight: 12 },
  productName: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  productSku: { fontSize: 12, color: "#94a3b8", marginTop: 2, fontFamily: "monospace" },
  badge: { marginTop: 6 },
  stockBubble: { alignItems: "center", justifyContent: "center", width: 60, height: 60, backgroundColor: "#f0fdf4", borderRadius: 30, borderWidth: 2, borderColor: "#86efac" },
  stockNumber: { fontSize: 20, fontWeight: "800", color: "#16a34a" },
  stockDanger: { color: "#dc2626" },
  stockWarning: { color: "#d97706" },
  stockLabel: { fontSize: 10, color: "#64748b" },
  alert: { backgroundColor: "#fee2e2", borderRadius: 8, padding: 10, marginBottom: 12 },
  alertWarning: { backgroundColor: "#fef9c3" },
  alertText: { fontSize: 13, fontWeight: "600", color: "#dc2626", textAlign: "center" },
  alertTextWarning: { color: "#ca8a04" },
  updateSection: { borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12 },
  updateTitle: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  actionRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: "#e2e8f0", alignItems: "center" },
  actionBtnActive: { borderColor: "#0f766e", backgroundColor: "#f0fdf4" },
  actionText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  actionTextActive: { color: "#0f766e" },
  qtyRow: { flexDirection: "row", gap: 8 },
  qtyInput: { flex: 1, backgroundColor: "#f8fafc", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, fontWeight: "700", textAlign: "center" },
  updateBtn: { flex: 1 },
  clearBtn: { marginTop: 12, paddingVertical: 10, alignItems: "center" },
  clearText: { fontSize: 14, color: "#94a3b8", fontWeight: "500" },
});
