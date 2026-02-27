import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, TRADES } from '@/constants/theme';
import { useCoachingStore } from '@/stores/coaching';

export default function SettingsScreen() {
  const { selectedTrade, setTrade } = useCoachingStore();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text }}>Settings</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text }}>Default Trade</Text>
        {TRADES.map((trade) => (
          <TouchableOpacity key={trade.id} onPress={() => setTrade(trade.id)} style={{
            backgroundColor: selectedTrade === trade.id ? COLORS.primary + '15' : COLORS.card,
            borderRadius: 12, padding: 16, borderWidth: 1.5,
            borderColor: selectedTrade === trade.id ? COLORS.primary : COLORS.border,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <Text style={{ fontSize: 24 }}>{trade.icon}</Text>
            <Text style={{ fontSize: 16, fontWeight: selectedTrade === trade.id ? '700' : '400', color: COLORS.text }}>{trade.label}</Text>
            {selectedTrade === trade.id && <Text style={{ marginLeft: 'auto', color: COLORS.primary }}>✓</Text>}
          </TouchableOpacity>
        ))}
        <View style={{ backgroundColor: COLORS.primary + '15', borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.primary }}>⭐ FieldLens Pro</Text>
          <Text style={{ color: COLORS.textSecondary, marginTop: 4 }}>Unlimited scans, voice coaching, code lookups — $12.99/month</Text>
        </View>
      </View>
    </ScrollView>
  );
}
