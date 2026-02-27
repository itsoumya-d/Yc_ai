import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Product, ScanLog } from "@/types/index";

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [recentScans, setRecentScans] = useState<ScanLog[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [productsRes, scansRes] = await Promise.all([
      supabase.from("products").select("*").eq("user_id", user.id),
      supabase
        .from("scan_logs")
        .select("*, products(name, sku)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const products: Product[] = productsRes.data ?? [];
    setRecentScans((scansRes.data as unknown as ScanLog[]) ?? []);

    const lowStock = products.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold
    );
    const outOfStock = products.filter((p) => p.stock_quantity === 0);
    const totalValue = products.reduce(
      (sum, p) => sum + p.stock_quantity * (p.cost_price ?? 0),
      0
    );

    setStats({
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      totalValue,
    });
    setLowStockItems(lowStock.slice(0, 5));
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0f766e"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>StockPulse</Text>
            <Text style={styles.headerSubtitle}>Inventory at a glance</Text>
          </View>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push("/(tabs)/scan")}
          >
            <Text style={styles.scanButtonText}>Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </Card>
          <Card style={[styles.statCard, stats.lowStockCount > 0 && styles.warningCard]}>
            <Text style={[styles.statValue, stats.lowStockCount > 0 && styles.warningText]}>
              {stats.lowStockCount}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </Card>
          <Card style={[styles.statCard, stats.outOfStockCount > 0 && styles.dangerCard]}>
            <Text style={[styles.statValue, stats.outOfStockCount > 0 && styles.dangerText]}>
              {stats.outOfStockCount}
            </Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              ${(stats.totalValue / 1000).toFixed(1)}k
            </Text>
            <Text style={styles.statLabel}>Value</Text>
          </Card>
        </View>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/inventory")}>
                <Text style={styles.sectionLink}>View all</Text>
              </TouchableOpacity>
            </View>
            {lowStockItems.map((item) => (
              <Card key={item.id} style={styles.alertCard}>
                <View style={styles.alertRow}>
                  <View style={styles.alertLeft}>
                    <Text style={styles.alertName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.alertSku}>SKU: {item.sku}</Text>
                  </View>
                  <View style={styles.alertRight}>
                    <Text style={styles.alertStock}>{item.stock_quantity} left</Text>
                    <Badge
                      label={item.stock_quantity === 0 ? "Out of Stock" : "Low Stock"}
                      variant={item.stock_quantity === 0 ? "danger" : "warning"}
                    />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Recent Scans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
          </View>
          {recentScans.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No scans yet. Tap the Scan tab to get started.</Text>
            </Card>
          ) : (
            recentScans.map((scan) => (
              <Card key={scan.id} style={styles.scanCard}>
                <View style={styles.scanRow}>
                  <View style={styles.scanLeft}>
                    <Text style={styles.scanBarcode}>{scan.barcode}</Text>
                    <Text style={styles.scanTime}>
                      {new Date(scan.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <Badge
                    label={scan.action}
                    variant={scan.action === "add" ? "success" : scan.action === "remove" ? "danger" : "default"}
                  />
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  scanButton: {
    backgroundColor: "#0f766e",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  scanButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 14,
    alignItems: "center",
  },
  warningCard: {
    backgroundColor: "#fffbeb",
    borderColor: "#fcd34d",
  },
  dangerCard: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  warningText: {
    color: "#d97706",
  },
  dangerText: {
    color: "#dc2626",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionLink: {
    fontSize: 13,
    color: "#0f766e",
    fontWeight: "600",
  },
  alertCard: {
    padding: 12,
    marginBottom: 8,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alertLeft: {
    flex: 1,
    marginRight: 8,
  },
  alertRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  alertName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  alertSku: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  alertStock: {
    fontSize: 13,
    fontWeight: "700",
    color: "#d97706",
  },
  emptyCard: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
  },
  scanCard: {
    padding: 12,
    marginBottom: 8,
  },
  scanRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scanLeft: {
    flex: 1,
  },
  scanBarcode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    fontFamily: "monospace",
  },
  scanTime: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
});
