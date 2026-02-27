import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/types/index";

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock =
    !isOutOfStock && product.stock_quantity <= product.low_stock_threshold;

  const stockBarWidth = Math.min(
    (product.stock_quantity / Math.max(product.low_stock_threshold * 3, 1)) * 100,
    100
  );

  const stockBarColor = isOutOfStock
    ? "#dc2626"
    : isLowStock
    ? "#f59e0b"
    : "#0f766e";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.sku}>SKU: {product.sku}</Text>
          </View>
          <View style={styles.headerRight}>
            {isOutOfStock ? (
              <Badge label="Out of Stock" variant="danger" />
            ) : isLowStock ? (
              <Badge label="Low Stock" variant="warning" />
            ) : (
              <Badge label="In Stock" variant="success" />
            )}
          </View>
        </View>

        <View style={styles.stockSection}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockNumber}>{product.stock_quantity}</Text>
            <Text style={styles.stockLabel}>units</Text>
          </View>
          <View style={styles.barContainer}>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  { width: `${stockBarWidth}%`, backgroundColor: stockBarColor },
                ]}
              />
            </View>
            <Text style={styles.threshold}>
              Min: {product.low_stock_threshold}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          {product.category && (
            <Text style={styles.category}>{product.category}</Text>
          )}
          {product.retail_price && (
            <Text style={styles.price}>${product.retail_price.toFixed(2)}</Text>
          )}
          {product.barcode && (
            <Text style={styles.barcode}>{product.barcode}</Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  headerRight: {
    flexShrink: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  sku: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "monospace",
  },
  stockSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  stockInfo: {
    alignItems: "center",
    minWidth: 40,
  },
  stockNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 22,
  },
  stockLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "500",
  },
  barContainer: {
    flex: 1,
  },
  barBg: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  threshold: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 3,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  category: {
    fontSize: 12,
    color: "#64748b",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: "500",
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f766e",
  },
  barcode: {
    fontSize: 11,
    color: "#cbd5e1",
    fontFamily: "monospace",
  },
});
