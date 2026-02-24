import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function ScanIntroScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, padding: 32, justifyContent: 'center' }}>
      <Text style={{ fontSize: 56, textAlign: 'center', marginBottom: 24 }}>📸</Text>
      <Text style={{ fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 12 }}>
        Scan Your Documents
      </Text>
      <Text style={{ fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 40 }}>
        GovPass uses AI to read your documents and automatically fill out benefit applications — saving you hours of paperwork.
      </Text>

      <View style={{ gap: 16, marginBottom: 40 }}>
        {[
          { icon: '🪪', title: 'ID / Driver\'s License', desc: 'Verify your identity quickly' },
          { icon: '💵', title: 'Pay Stubs', desc: 'Confirm income for eligibility' },
          { icon: '📋', title: 'Tax Forms (W-2, 1099)', desc: 'Auto-fill income fields' },
        ].map((item) => (
          <View
            key={item.title}
            style={{
              backgroundColor: COLORS.card, borderRadius: 12, padding: 16,
              flexDirection: 'row', alignItems: 'center', gap: 14,
              borderWidth: 1, borderColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 28 }}>{item.icon}</Text>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>{item.title}</Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => router.push('/scanner')}
        style={{
          backgroundColor: COLORS.primary, borderRadius: 14,
          paddingVertical: 16, alignItems: 'center', marginBottom: 12,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Scan My First Document</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', fontSize: 15 }}>
          Skip for now
        </Text>
      </TouchableOpacity>
    </View>
  );
}
