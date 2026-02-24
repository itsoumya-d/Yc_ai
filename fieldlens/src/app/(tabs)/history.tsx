import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useCoachingStore } from '@/stores/coaching';
import { COLORS } from '@/constants/theme';

export default function HistoryScreen() {
  const { sessionHistory, clearHistory } = useCoachingStore();

  if (sessionHistory.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>📚</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text }}>No History Yet</Text>
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Your coaching sessions will appear here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text }}>Session History</Text>
          <TouchableOpacity onPress={clearHistory}>
            <Text style={{ color: COLORS.error }}>Clear All</Text>
          </TouchableOpacity>
        </View>
        {sessionHistory.map((item, i) => (
          <View key={i} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text, flex: 1 }}>{item.guidance.title}</Text>
              <Text style={{ fontSize: 11, color: COLORS.textMuted }}>
                {new Date(item.capturedAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 6 }}>
              {item.guidance.steps.length} steps • {item.guidance.warnings.length > 0 ? `⚠️ ${item.guidance.warnings.length} warning(s)` : '✅ No warnings'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
