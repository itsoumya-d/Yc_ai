import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSkinStore } from '@/stores/skin';
import { COLORS, RISK_COLORS } from '@/constants/theme';

export default function OverviewScreen() {
  const { spots } = useSkinStore();
  const watchedSpots = spots.filter((s) => s.isWatched);
  const alertSpots = spots.filter((s) => {
    const latest = s.photos[s.photos.length - 1];
    return latest && ['high', 'urgent'].includes(latest.analysis.riskLevel);
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ backgroundColor: COLORS.primary, borderRadius: 16, padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>🔬 AuraCheck</Text>
          <Text style={{ color: 'white', opacity: 0.85, marginTop: 4 }}>AI-powered skin health monitoring</Text>
          <View style={{ flexDirection: 'row', gap: 20, marginTop: 16 }}>
            {[{ label: 'Tracked Spots', value: spots.length }, { label: 'Being Watched', value: watchedSpots.length }, { label: 'Need Attention', value: alertSpots.length }].map((s) => (
              <View key={s.label} style={{ alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>{s.value}</Text>
                <Text style={{ color: 'white', opacity: 0.8, fontSize: 11, textAlign: 'center' }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {alertSpots.length > 0 && (
          <View style={{ backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FECACA' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#991B1B' }}>⚠️ {alertSpots.length} spot(s) need attention</Text>
            {alertSpots.map((s) => (
              <Text key={s.id} style={{ color: '#7F1D1D', fontSize: 13, marginTop: 4 }}>• {s.nickname} ({s.bodyLocation})</Text>
            ))}
            <TouchableOpacity style={{ marginTop: 10, backgroundColor: COLORS.error, borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>See Dermatologist Info</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={() => router.push('/(tabs)/scan')} style={{ backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Text style={{ fontSize: 40 }}>📷</Text>
          <View>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Scan a Skin Spot</Text>
            <Text style={{ color: 'white', opacity: 0.85, fontSize: 13, marginTop: 2 }}>AI analysis in seconds</Text>
          </View>
        </TouchableOpacity>

        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>Recent Activity</Text>
        {spots.slice(0, 3).map((spot) => {
          const latest = spot.photos[spot.photos.length - 1];
          const riskColor = latest ? RISK_COLORS[latest.analysis.riskLevel] : COLORS.textMuted;
          return (
            <View key={spot.id} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>{spot.nickname}</Text>
                <View style={{ backgroundColor: riskColor + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: riskColor, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
                    {latest?.analysis.riskLevel ?? 'not scanned'}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>{spot.bodyLocation} • {spot.photos.length} scan(s)</Text>
            </View>
          );
        })}

        <View style={{ backgroundColor: '#FFF7ED', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FED7AA' }}>
          <Text style={{ fontSize: 12, color: '#92400E', lineHeight: 18 }}>
            ⚕️ <Text style={{ fontWeight: '700' }}>Medical Disclaimer:</Text> AuraCheck is a screening tool only. It does not provide medical diagnoses. Always consult a board-certified dermatologist for proper evaluation of skin concerns.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
