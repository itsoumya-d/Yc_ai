import { View, Text, StyleSheet } from 'react-native';

interface OverchargeItemProps {
  item: {
    description: string;
    billed: number;
    fair: number;
    reason: string;
    amount: number;
  };
}

export function OverchargeItem({ item }: OverchargeItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.headerText}>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.reason}>{item.reason}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.overchargeAmount}>-${item.amount.toFixed(2)}</Text>
          <Text style={styles.overchargeLabel}>overcharge</Text>
        </View>
      </View>
      <View style={styles.comparisonRow}>
        <View style={styles.compareItem}>
          <Text style={styles.compareLabel}>Billed</Text>
          <Text style={styles.billedAmount}>${item.billed.toFixed(2)}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.compareItem}>
          <Text style={styles.compareLabel}>Fair Price</Text>
          <Text style={styles.fairAmount}>${item.fair.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  icon: { fontSize: 18, marginRight: 8, marginTop: 2 },
  headerText: { flex: 1 },
  description: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  reason: { fontSize: 12, color: '#ea580c', marginTop: 2 },
  amountContainer: { alignItems: 'flex-end' },
  overchargeAmount: { fontSize: 16, fontWeight: '800', color: '#ea580c' },
  overchargeLabel: { fontSize: 10, color: '#f97316' },
  comparisonRow: { flexDirection: 'row', alignItems: 'center' },
  compareItem: { flex: 1 },
  compareLabel: { fontSize: 11, color: '#94a3b8' },
  billedAmount: { fontSize: 14, color: '#ef4444', fontWeight: '600', textDecorationLine: 'line-through' },
  fairAmount: { fontSize: 14, color: '#16a34a', fontWeight: '600' },
  arrow: { fontSize: 16, color: '#94a3b8', marginHorizontal: 12 },
});
