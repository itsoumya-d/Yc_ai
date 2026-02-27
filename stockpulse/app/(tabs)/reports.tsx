import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/types/index";

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeReport, setActiveReport] = useState<"low_stock" | "valuation" | "movement">("low_stock");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("stock_quantity");

    setProducts((data as Product[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  };

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold
  );
  const totalValue = products.reduce(
    (sum, p) => sum + p.stock_quantity * (p.cost_price ?? 0),
    0
  );
  const totalRetailValue = products.reduce(
    (sum, p) => sum + p.stock_quantity * (p.retail_price ?? 0),
    0
  );

  const REPORTS = [
    { key: "low_stock", label: "Low Stock" },
    { key: "valuation", label: "Valuation" },
    { key: "movement", label: "Movement" },
  ] as const;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#0f766e" />
        }
      >
        <Text style={styles.title}>Reports</Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>${totalValue.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Cost Value</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>${totalRetailValue.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Retail Value</Text>
          </Card>
        </View>

        {/* Report Tabs */}
        <View style={styles.tabRow}>
          {REPORTS.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.tab, activeReport === r.key && styles.tabActive]}
              onPress={() => setActiveReport(r.key)}
            >
              <Text style={[styles.tabText, activeReport === r.key && styles.tabTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Low Stock Report */}
        {activeReport === "low_stock" && (
          <View>
            <Text style={styles.reportTitle}>
              Low Stock Report — {lowStockProducts.length} items
            </Text>
            {lowStockProducts.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>All items are well-stocked!</Text>
              </Card>
            ) : (
              lowStockProducts.map((product) => (
                <Card key={product.id} style={styles.reportCard}>
                  <View style={styles.reportRow}>
                    <View style={styles.reportLeft}>
                      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.productSku}>SKU: {product.sku}</Text>
                      <Text style={styles.productCategory}>{product.category ?? "Uncategorized"}</Text>
                    </View>
                    <View style={styles.reportRight}>
                      <Text style={styles.stockCount}>{product.stock_quantity}</Text>
                      <Text style={styles.stockLabel}>in stock</Text>
                      <Badge
                        label={product.stock_quantity === 0 ? "Out" : "Low"}
                        variant={product.stock_quantity === 0 ? "danger" : "warning"}
                      />
                    </View>
                  </View>
                  <View style={styles.reorderRow}>
                    <Text style={styles.reorderText}>
                      Reorder point: {product.low_stock_threshold} units
                    </Text>
                    {product.supplier && (
                      <Text style={styles.supplierText}>Supplier: {product.supplier}</Text>
                    )}
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* Valuation Report */}
        {activeReport === "valuation" && (
          <View>
            <Text style={styles.reportTitle}>Inventory Valuation</Text>
            {products
              .sort((a, b) => (b.stock_quantity * (b.cost_price ?? 0)) - (a.stock_quantity * (a.cost_price ?? 0)))
              .map((product) => {
                const costVal = product.stock_quantity * (product.cost_price ?? 0);
                const retailVal = product.stock_quantity * (product.retail_price ?? 0);
                return (
                  <Card key={product.id} style={styles.reportCard}>
                    <View style={styles.reportRow}>
                      <View style={styles.reportLeft}>
                        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                        <Text style={styles.productSku}>SKU: {product.sku} • {product.stock_quantity} units</Text>
                      </View>
                      <View style={styles.reportRight}>
                        <Text style={styles.valueText}>${costVal.toFixed(2)}</Text>
                        <Text style={styles.valueLabel}>cost value</Text>
                        <Text style={styles.retailValue}>${retailVal.toFixed(2)} retail</Text>
                      </View>
                    </View>
                  </Card>
                );
              })
            }
            <Card style={[styles.reportCard, styles.totalCard]}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Cost Value</Text>
                <Text style={styles.totalValue}>${totalValue.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Retail Value</Text>
                <Text style={styles.totalValue}>${totalRetailValue.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Potential Margin</Text>
                <Text style={[styles.totalValue, { color: "#16a34a" }]}>
                  ${(totalRetailValue - totalValue).toFixed(2)}
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Movement Report */}
        {activeReport === "movement" && (
          <View>
            <Text style={styles.reportTitle}>Stock Movement</Text>
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Scan products to track stock movement. Movements will appear here after scanning activity.
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginBottom: 16 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, padding: 14 },
  summaryValue: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  summaryLabel: { fontSize: 12, color: "#64748b", marginTop: 2 },
  tabRow: { flexDirection: "row", backgroundColor: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "#ffffff", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  tabTextActive: { color: "#0f172a" },
  reportTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 10 },
  reportCard: { padding: 12, marginBottom: 8 },
  reportRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  reportLeft: { flex: 1, marginRight: 12 },
  reportRight: { alignItems: "flex-end" },
  productName: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  productSku: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  productCategory: { fontSize: 12, color: "#64748b", marginTop: 1 },
  stockCount: { fontSize: 20, fontWeight: "800", color: "#d97706" },
  stockLabel: { fontSize: 11, color: "#94a3b8" },
  reorderRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  reorderText: { fontSize: 12, color: "#64748b" },
  supplierText: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  valueText: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  valueLabel: { fontSize: 11, color: "#94a3b8" },
  retailValue: { fontSize: 12, color: "#0f766e", fontWeight: "600" },
  totalCard: { backgroundColor: "#f0fdf4", borderColor: "#86efac" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLabel: { fontSize: 14, color: "#374151", fontWeight: "500" },
  totalValue: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  emptyCard: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center" },
});
