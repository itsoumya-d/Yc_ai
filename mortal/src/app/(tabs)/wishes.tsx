import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { useVaultStore } from '@/stores/vault';
import { COLORS } from '@/constants/theme';
import { getWillDraftGuidance } from '@/services/ai';

export default function WishesScreen() {
  const { finalWishes, updateFinalWishes } = useVaultStore();
  const [guidance, setGuidance] = useState('');
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  const getAIHelp = async () => {
    setLoadingGuidance(true);
    const result = await getWillDraftGuidance('What should I include in my final wishes and personal messages?');
    setGuidance(result);
    setLoadingGuidance(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.text }}>Final Wishes</Text>
        <Text style={{ color: COLORS.textSecondary }}>Record your preferences to guide your loved ones.</Text>

        {/* Burial/Cremation */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 }}>Funeral Preference</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['burial', 'cremation', 'no_preference'] as const).map((opt) => (
              <TouchableOpacity key={opt} onPress={() => updateFinalWishes({ burialOrCremation: opt })} style={{
                flex: 1, backgroundColor: finalWishes.burialOrCremation === opt ? COLORS.primary : COLORS.background,
                borderRadius: 8, paddingVertical: 10, alignItems: 'center',
                borderWidth: 1, borderColor: finalWishes.burialOrCremation === opt ? COLORS.primary : COLORS.border,
              }}>
                <Text style={{ fontSize: 12, color: finalWishes.burialOrCremation === opt ? 'white' : COLORS.text, fontWeight: '600', textAlign: 'center' }}>
                  {opt === 'no_preference' ? 'No Preference' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Funeral preferences text */}
        <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 8 }}>Special Instructions</Text>
          <TextInput
            value={finalWishes.specialInstructions ?? ''}
            onChangeText={(v) => updateFinalWishes({ specialInstructions: v })}
            multiline numberOfLines={4} textAlignVertical="top"
            placeholder="Any special requests for your memorial service, music, readings, donations in lieu of flowers..."
            placeholderTextColor={COLORS.textMuted}
            style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 14, color: COLORS.text, minHeight: 100 }}
          />
        </View>

        {/* Organ donation */}
        <TouchableOpacity onPress={() => updateFinalWishes({ organDonation: !finalWishes.organDonation })} style={{
          backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>Organ Donation</Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>Register your wishes regarding organ donation</Text>
          </View>
          <View style={{
            width: 48, height: 28, borderRadius: 14,
            backgroundColor: finalWishes.organDonation ? COLORS.success : COLORS.border,
            justifyContent: 'center', paddingHorizontal: 2,
          }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', alignSelf: finalWishes.organDonation ? 'flex-end' : 'flex-start' }} />
          </View>
        </TouchableOpacity>

        {/* AI Help */}
        <TouchableOpacity onPress={getAIHelp} disabled={loadingGuidance} style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>
            {loadingGuidance ? '✨ Getting guidance...' : '✨ Get AI Guidance'}
          </Text>
        </TouchableOpacity>

        {guidance !== '' && (
          <View style={{ backgroundColor: COLORS.primary + '10', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.primary + '30' }}>
            <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22 }}>{guidance}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
