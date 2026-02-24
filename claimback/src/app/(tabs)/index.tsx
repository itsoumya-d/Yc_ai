import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useClaimsStore } from '@/stores/claims';
import { COLORS } from '@/constants/theme';

export default function DashboardScreen() {
  const { claims, totalSaved } = useClaimsStore();
  const activeClaims = claims.filter((c) => !['won', 'lost'].includes(c.status));
  const wonClaims = claims.filter((c) => c.status === 'won');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        {/* Hero */}
        <View style={{ backgroundColor: COLORS.primary, borderRadius: 20, padding: 24, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 14, opacity: 0.85 }}>Total Money Recovered</Text>
          <Text style={{ color: 'white', fontSize: 44, fontWeight: '900', marginTop: 4 }}>
            ${totalSaved.toLocaleString()}
          </Text>
          <Text style={{ color: 'white', opacity: 0.85, marginTop: 4 }}>
            {wonClaims.length} bills successfully disputed
          </Text>
        </View>

        {/* Scan CTA */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/scan')} style={{
          backgroundColor: COLORS.card, borderRadius: 16, padding: 20,
          borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', gap: 8,
        }}>
          <Text style={{ fontSize: 32 }}>📸</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.primary }}>Scan a Bill</Text>
          <Text style={{ color: COLORS.textSecondary, textAlign: 'center', fontSize: 13 }}>
            Medical, utility, insurance, subscription bills
          </Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Active Claims', value: activeClaims.length, icon: '⚡' },
            { label: 'Bills Scanned', value: claims.length, icon: '📄' },
            { label: 'Success Rate', value: claims.length > 0 ? `${Math.round((wonClaims.length / claims.length) * 100)}%` : '-', icon: '🎯' },
          ].map((stat) => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
              <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.primary, marginTop: 4 }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent claims */}
        {claims.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>Recent Claims</Text>
            {claims.slice(0, 3).map((claim) => (
              <View key={claim.id} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text, textTransform: 'capitalize' }}>
                    {claim.billType} Bill
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: claim.status === 'won' ? COLORS.success : COLORS.primary }}>
                    ${claim.potentialSavings}
                  </Text>
                </View>
                <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{
                    backgroundColor: claim.status === 'won' ? COLORS.success + '20' : COLORS.warning + '20',
                    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
                  }}>
                    <Text style={{ fontSize: 11, color: claim.status === 'won' ? COLORS.success : COLORS.warning, fontWeight: '600', textTransform: 'uppercase' }}>
                      {claim.status.replace('_', ' ')}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
