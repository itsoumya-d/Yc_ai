import { View, Text, ScrollView } from 'react-native';
import { COLORS } from '@/constants/theme';

const MOCK_NOTIFICATIONS = [
  {
    id: '1', type: 'deadline', title: 'SNAP Application Deadline',
    message: "Your SNAP application is due in 3 days. Don't lose your progress!",
    time: '2 hours ago', icon: '⏰',
  },
  {
    id: '2', type: 'missing_doc', title: 'Missing Document',
    message: 'Your Medicaid application needs a recent pay stub. Scan one now.',
    time: '5 hours ago', icon: '📄',
  },
  {
    id: '3', type: 'approval', title: 'EITC Approved! 🎉',
    message: 'Congratulations! Your EITC claim of $1,247 has been approved.',
    time: '2 days ago', icon: '✅',
  },
];

const TYPE_COLORS: Record<string, string> = {
  deadline: COLORS.error, missing_doc: COLORS.warning, approval: COLORS.success, renewal: COLORS.primary,
};

export default function NotificationsScreen() {
  if (MOCK_NOTIFICATIONS.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🔔</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text }}>No Notifications Yet</Text>
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 }}>
          We'll notify you about deadlines, updates, and approvals.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase' }}>TODAY</Text>
        {MOCK_NOTIFICATIONS.map((notif) => (
          <View
            key={notif.id}
            style={{
              backgroundColor: COLORS.card, borderRadius: 12, padding: 16,
              borderWidth: 1, borderColor: COLORS.border,
              borderLeftWidth: 4, borderLeftColor: TYPE_COLORS[notif.type] ?? COLORS.primary,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 24 }}>{notif.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>{notif.title}</Text>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 }}>
                  {notif.message}
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6 }}>{notif.time}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
