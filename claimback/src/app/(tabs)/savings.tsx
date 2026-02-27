import { View, Text, ScrollView } from 'react-native';
import { useClaimsStore } from '@/stores/claims';
import { COLORS } from '@/constants/theme';

export default function SavingsScreen() {
  const { claims, totalSaved } = useClaimsStore();
  const wonClaims = claims.filter((c) => c.status === 'won');
  const byType = wonClaims.reduce((acc, c) => { acc[c.billType] = (acc[c.billType] ?? 0) + (c.amountSaved ?? 0); return acc; }, {} as Record<string, number>);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ backgroundColor: COLORS.primary, borderRadius: 20, padding: 24, alignItems: 'center' }}>
          <Text style={{ color: 'white', opacity: 0.85 }}>Total Savings</Text>
          <Text style={{ color: 'white', fontSize: 52, fontWeight: '900' }}>${totalSaved.toLocaleString()}</Text>
          <Text style={{ color: 'white', opacity: 0.85 }}>{wonClaims.length} successful disputes</Text>
        </View>
        {Object.entries(byType).map(([type, amount]) => (
          <View key={type} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>{type}</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.success }}>${amount}</Text>
          </View>
        ))}
        {wonClaims.length === 0 && (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 40 }}>💰</Text>
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 12 }}>Start scanning bills to track your savings here.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
