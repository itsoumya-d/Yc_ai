import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, TRADES } from '@/constants/theme';

const COMMON_TASKS = {
  plumber: ['Fix pipe leak', 'Install water heater', 'Unclog drain', 'Replace faucet', 'Toilet repair'],
  electrician: ['Wire outlet', 'Install breaker', 'LED retrofit', 'Panel inspection', 'GFCI install'],
  hvac: ['AC diagnosis', 'Filter change', 'Refrigerant check', 'Duct sealing', 'Thermostat install'],
  carpenter: ['Frame wall', 'Install door', 'Crown molding', 'Deck boards', 'Cabinet install'],
  general: ['Safety inspection', 'Material estimate', 'Site cleanup', 'Tool inventory', 'Job photo'],
};

export default function TasksScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text }}>Common Tasks</Text>
        <Text style={{ color: COLORS.textSecondary, marginTop: -12 }}>Tap a task to get AI guidance instantly</Text>
        {TRADES.map((trade) => (
          <View key={trade.id}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 }}>
              {trade.icon} {trade.label}
            </Text>
            <View style={{ gap: 8 }}>
              {COMMON_TASKS[trade.id].map((task) => (
                <TouchableOpacity key={task} style={{
                  backgroundColor: COLORS.card, borderRadius: 10, padding: 14,
                  borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row',
                  alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Text style={{ fontSize: 15, color: COLORS.text }}>{task}</Text>
                  <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Get Help →</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
