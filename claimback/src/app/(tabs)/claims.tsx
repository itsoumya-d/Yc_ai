import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useClaimsStore } from '@/stores/claims';
import { COLORS } from '@/constants/theme';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: '#F59E0B', label: 'Pending' },
  dispute_sent: { color: '#3B82F6', label: 'Dispute Sent' },
  call_made: { color: '#8B5CF6', label: 'Call Made' },
  won: { color: '#22C55E', label: '✅ Won' },
  lost: { color: '#EF4444', label: 'Lost' },
  in_progress: { color: '#F97316', label: 'In Progress' },
};

export default function ClaimsScreen() {
  const { claims, updateClaim } = useClaimsStore();

  if (claims.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 40 }}>📭</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16 }}>No Claims Yet</Text>
        <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 8 }}>Scan a bill to start fighting overcharges.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>My Claims</Text>
        {claims.map((claim) => {
          const config = STATUS_CONFIG[claim.status];
          return (
            <View key={claim.id} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
                  {claim.billType} Bill
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.success }}>
                  ${claim.potentialSavings}
                </Text>
              </View>
              <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ backgroundColor: config.color + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: config.color, fontSize: 11, fontWeight: '700' }}>{config.label}</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                  {new Date(claim.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {claim.status === 'pending' && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <TouchableOpacity onPress={() => updateClaim(claim.id, { status: 'dispute_sent' })} style={{ flex: 1, backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>📬 Send Letter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('AI Call', 'AI phone agent would call the billing department on your behalf.')} style={{ flex: 1, backgroundColor: '#8B5CF6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>📞 AI Call</Text>
                  </TouchableOpacity>
                </View>
              )}
              {claim.status !== 'won' && claim.status !== 'lost' && claim.status !== 'pending' && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <TouchableOpacity onPress={() => updateClaim(claim.id, { status: 'won', amountSaved: claim.potentialSavings })} style={{ flex: 1, backgroundColor: COLORS.success, borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>✅ Mark Won</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => updateClaim(claim.id, { status: 'lost' })} style={{ flex: 1, backgroundColor: '#EF4444', borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>✗ Mark Lost</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
