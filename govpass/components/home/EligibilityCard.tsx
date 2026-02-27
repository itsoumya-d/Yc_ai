import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { EligibilityResult } from '../../types';

interface EligibilityCardProps {
  result: EligibilityResult;
}

const PROGRAM_ICONS: Record<string, string> = {
  snap: '🛒',
  medicaid: '🏥',
  eitc: '💰',
  chip: '👶',
  wic: '🍎',
  housing: '🏠',
};

export function EligibilityCard({ result }: EligibilityCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{PROGRAM_ICONS[result.program] || '📋'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.programName}>{result.programName}</Text>
        <Text style={styles.benefit}>
          Up to ${result.annualBenefit.toLocaleString()}/year
        </Text>
        {result.notes && <Text style={styles.notes}>{result.notes}</Text>}
      </View>
      <TouchableOpacity
        style={styles.applyBtn}
        onPress={() => router.push('/(tabs)/applications')}
      >
        <Text style={styles.applyBtnText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  programName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  benefit: { fontSize: 13, color: '#1d4ed8', marginTop: 2, fontWeight: '500' },
  notes: { fontSize: 12, color: '#64748b', marginTop: 3 },
  applyBtn: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  applyBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
});
