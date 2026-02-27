import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/user';
import { COLORS } from '@/constants/theme';

export default function LanguageScreen() {
  const { setLanguage } = useUserStore();

  const select = (lang: 'en' | 'es') => {
    setLanguage(lang);
    router.push('/onboarding/household');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, padding: 32, justifyContent: 'center' }}>
      <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 8 }}>🇺🇸</Text>
      <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.primary, textAlign: 'center' }}>
        Welcome to GovPass
      </Text>
      <Text style={{ fontSize: 18, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 48 }}>
        Bienvenido a GovPass
      </Text>

      <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 24 }}>
        Choose your language / Elija su idioma
      </Text>

      <TouchableOpacity
        onPress={() => select('en')}
        style={{
          backgroundColor: COLORS.card, borderRadius: 16, padding: 20,
          borderWidth: 2, borderColor: COLORS.border, flexDirection: 'row',
          alignItems: 'center', gap: 16, marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 32 }}>🇺🇸</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text }}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => select('es')}
        style={{
          backgroundColor: COLORS.card, borderRadius: 16, padding: 20,
          borderWidth: 2, borderColor: COLORS.border, flexDirection: 'row',
          alignItems: 'center', gap: 16,
        }}
      >
        <Text style={{ fontSize: 32 }}>🇲🇽</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text }}>Español</Text>
      </TouchableOpacity>

      <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 24 }}>
        You can change this anytime in Settings
      </Text>
    </View>
  );
}
