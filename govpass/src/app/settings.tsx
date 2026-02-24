import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useUserStore } from '@/stores/user';
import { COLORS } from '@/constants/theme';

export default function SettingsScreen() {
  const { language, setLanguage } = useUserStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 }}>Settings</Text>

        {/* Language */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border }}>
          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, color: COLORS.text }}>🌐 Language / Idioma</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['en', 'es'] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
                    backgroundColor: language === lang ? COLORS.primary : COLORS.border,
                  }}
                >
                  <Text style={{ color: language === lang ? 'white' : COLORS.text, fontWeight: '600' }}>
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Account section */}
        {[
          { icon: '👤', label: 'Edit Profile' },
          { icon: '🏠', label: 'Household Info' },
          { icon: '🔔', label: 'Notification Preferences' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={{
              backgroundColor: COLORS.card, borderRadius: 12, padding: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              borderWidth: 1, borderColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 16, color: COLORS.text }}>{item.icon} {item.label}</Text>
            <Text style={{ color: COLORS.textMuted }}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Subscription */}
        <View style={{ backgroundColor: COLORS.primary + '15', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.primary + '30' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.primary }}>⭐ Upgrade to Plus</Text>
          <Text style={{ color: COLORS.textSecondary, marginTop: 4 }}>
            Unlimited applications, document vault, deadline reminders — $7.99/month
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
