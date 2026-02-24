import { View, Text, ScrollView } from 'react-native';
import { useSkinStore } from '@/stores/skin';
import { COLORS, RISK_COLORS } from '@/constants/theme';

export default function HistoryScreen() {
  const { spots } = useSkinStore();
  const allScans = spots.flatMap((s) => s.photos.map((p) => ({ ...p, spotName: s.nickname, bodyLocation: s.bodyLocation }))).sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());

  if (allScans.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 40 }}>📊</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 12 }}>No Scan History</Text>
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 }}>Your scan history will appear here after you analyze skin photos.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text }}>Scan History ({allScans.length})</Text>
        {allScans.map((scan) => {
          const riskColor = RISK_COLORS[scan.analysis.riskLevel];
          return (
            <View key={scan.id} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>{scan.spotName}</Text>
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>{scan.bodyLocation}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                    {new Date(scan.capturedAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ backgroundColor: riskColor + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: riskColor, fontWeight: '700', textTransform: 'uppercase', fontSize: 12 }}>
                    {scan.analysis.riskLevel}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 8, lineHeight: 18 }}>
                Score: {scan.analysis.overallScore}/15 • {scan.analysis.recommendation.slice(0, 80)}...
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
