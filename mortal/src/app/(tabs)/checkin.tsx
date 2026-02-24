import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useVaultStore } from '@/stores/vault';
import { COLORS } from '@/constants/theme';

const INTERVALS = [
  { value: '7d' as const, label: 'Weekly', description: 'Check in every 7 days' },
  { value: '14d' as const, label: 'Bi-weekly', description: 'Check in every 14 days' },
  { value: '30d' as const, label: 'Monthly', description: 'Check in every 30 days' },
  { value: '90d' as const, label: 'Quarterly', description: 'Check in every 90 days' },
];

export default function CheckinScreen() {
  const { checkinInterval, setCheckinInterval, lastCheckin, recordCheckin, contacts } = useVaultStore();

  const handleCheckin = () => {
    recordCheckin();
    Alert.alert('Check-in Recorded! ✅', `Your vault is confirmed active. Your ${contacts.length} trusted contact(s) will only be notified if you miss your next check-in.`);
  };

  const getDaysUntilNext = () => {
    if (!lastCheckin) return null;
    const days = parseInt(checkinInterval);
    const nextDate = new Date(lastCheckin);
    nextDate.setDate(nextDate.getDate() + days);
    const daysLeft = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const daysLeft = getDaysUntilNext();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text }}>Dead Man's Switch</Text>
        <Text style={{ color: COLORS.textSecondary, lineHeight: 20 }}>
          If you miss your scheduled check-in, Mortal will notify your trusted contacts and grant them access to your vault.
        </Text>

        {/* Status card */}
        <View style={{
          backgroundColor: lastCheckin ? COLORS.success + '10' : COLORS.warning + '10',
          borderRadius: 16, padding: 20,
          borderWidth: 1, borderColor: lastCheckin ? COLORS.success + '40' : COLORS.warning + '40',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 40 }}>{lastCheckin ? '✅' : '⚠️'}</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 8 }}>
            {lastCheckin ? 'Vault Active' : 'Not Configured'}
          </Text>
          {lastCheckin && daysLeft !== null && (
            <Text style={{ color: COLORS.textSecondary, marginTop: 4 }}>
              Next check-in due in {daysLeft} days
            </Text>
          )}
        </View>

        {/* Check-in interval selector */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>Check-In Frequency</Text>
        {INTERVALS.map((interval) => (
          <TouchableOpacity key={interval.value} onPress={() => setCheckinInterval(interval.value)} style={{
            backgroundColor: checkinInterval === interval.value ? COLORS.primary + '10' : COLORS.card,
            borderRadius: 12, padding: 16, borderWidth: 1.5,
            borderColor: checkinInterval === interval.value ? COLORS.primary : COLORS.border,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>{interval.label}</Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>{interval.description}</Text>
            </View>
            {checkinInterval === interval.value && <Text style={{ color: COLORS.primary, fontSize: 18 }}>✓</Text>}
          </TouchableOpacity>
        ))}

        {/* Check-in button */}
        <TouchableOpacity onPress={handleCheckin} style={{
          backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8,
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>✅ I'm Alive — Check In</Text>
          <Text style={{ color: 'white', opacity: 0.8, marginTop: 4, fontSize: 13 }}>Confirms your vault remains private</Text>
        </TouchableOpacity>

        {contacts.length === 0 && (
          <View style={{ backgroundColor: COLORS.warning + '10', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.warning + '30' }}>
            <Text style={{ fontSize: 14, color: '#92400E' }}>
              ⚠️ Add at least one trusted contact before activating the dead man's switch.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
