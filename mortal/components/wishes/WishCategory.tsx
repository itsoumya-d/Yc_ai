import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface WishCategoryProps {
  icon: string;
  label: string;
  completion: number;
  onPress: () => void;
}

export function WishCategory({ icon, label, completion, onPress }: WishCategoryProps) {
  const isComplete = completion >= 100;
  const statusColor = completion === 0 ? '#6b7280' : completion < 50 ? '#f59e0b' : completion < 100 ? '#7c3aed' : '#22c55e';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.info}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completion}%` as any, backgroundColor: statusColor }]} />
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.percent, { color: statusColor }]}>{completion}%</Text>
        <Text style={styles.arrow}>{isComplete ? '✓' : '›'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e1030',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { fontSize: 26, marginRight: 14 },
  info: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600', color: '#ffffff', marginBottom: 6 },
  progressBar: {
    height: 4,
    backgroundColor: '#2d1b4e',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  right: { alignItems: 'flex-end', marginLeft: 12 },
  percent: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  arrow: { fontSize: 20, color: '#a78bfa' },
});
