import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useVaultStore } from '@/stores/vault';
import { COLORS, DOC_CATEGORIES } from '@/constants/theme';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { documents, contacts, finalWishes, lastCheckin, checkinInterval } = useVaultStore();
  const completionItems = [
    { label: 'Documents uploaded', done: documents.length > 0, count: documents.length },
    { label: 'Trusted contacts added', done: contacts.length > 0, count: contacts.length },
    { label: 'Final wishes recorded', done: !!finalWishes.funeralPreferences, count: null },
    { label: 'Check-in schedule set', done: !!checkinInterval, count: null },
  ];
  const completedCount = completionItems.filter((i) => i.done).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        {/* Header */}
        <View style={{ backgroundColor: COLORS.primary, borderRadius: 16, padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>🌿 Mortal</Text>
          <Text style={{ color: 'white', opacity: 0.85, marginTop: 4 }}>Your legacy, protected</Text>
          <View style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 12 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Setup Progress</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {completionItems.map((_, i) => (
                <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < completedCount ? 'white' : 'rgba(255,255,255,0.3)' }} />
              ))}
            </View>
            <Text style={{ color: 'white', opacity: 0.85, marginTop: 6, fontSize: 13 }}>
              {completedCount} of {completionItems.length} steps complete
            </Text>
          </View>
        </View>

        {/* Checklist */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 }}>Your Checklist</Text>
          {completionItems.map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{
                width: 24, height: 24, borderRadius: 12,
                backgroundColor: item.done ? COLORS.success + '20' : COLORS.border,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 12 }}>{item.done ? '✓' : '○'}</Text>
              </View>
              <Text style={{ flex: 1, color: item.done ? COLORS.text : COLORS.textSecondary, fontSize: 14 }}>
                {item.label}{item.count !== null && item.count > 0 ? ` (${item.count})` : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>Quick Actions</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/vault')} style={{ flex: 1, backgroundColor: COLORS.primary + '15', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary + '30' }}>
            <Text style={{ fontSize: 28 }}>🔒</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary, marginTop: 6 }}>Add Document</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/contacts')} style={{ flex: 1, backgroundColor: COLORS.primary + '15', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary + '30' }}>
            <Text style={{ fontSize: 28 }}>👥</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary, marginTop: 6 }}>Add Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/wishes')} style={{ flex: 1, backgroundColor: COLORS.primary + '15', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary + '30' }}>
            <Text style={{ fontSize: 28 }}>💌</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary, marginTop: 6 }}>Final Wishes</Text>
          </TouchableOpacity>
        </View>

        {/* Check-in status */}
        <View style={{ backgroundColor: lastCheckin ? COLORS.success + '10' : COLORS.warning + '10', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: lastCheckin ? COLORS.success + '30' : COLORS.warning + '30' }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>
            {lastCheckin ? '✅ Check-in Active' : '⚠️ Set Up Check-In'}
          </Text>
          <Text style={{ color: COLORS.textSecondary, marginTop: 4, fontSize: 13 }}>
            {lastCheckin
              ? `Last check-in: ${new Date(lastCheckin).toLocaleDateString()} • Every ${checkinInterval}`
              : 'Schedule regular check-ins to keep your vault active.'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/checkin')} style={{ marginTop: 10, backgroundColor: lastCheckin ? COLORS.success : COLORS.warning, borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>
              {lastCheckin ? 'Check In Now' : 'Configure Check-In'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
