import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/user';
import { calculateEligibility } from '@/services/eligibility';
import { FEDERAL_PROGRAMS } from '@/constants/programs';
import { COLORS } from '@/constants/theme';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🥗', healthcare: '🏥', housing: '🏠', cash: '💵', tax_credit: '💰', childcare: '👶',
};

export default function EligibilityResultsScreen() {
  const { householdInfo, language } = useUserStore();
  const results = calculateEligibility({ ...householdInfo, age: 35 }, FEDERAL_PROGRAMS);
  const eligible = results.filter((r) => r.isEligible);
  const mayBeEligible = results.filter((r) => !r.isEligible && r.confidence > 0.3);
  const notEligible = results.filter((r) => !r.isEligible && r.confidence <= 0.3);
  const total = eligible.reduce((s, r) => s + r.estimatedAnnualValue, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        {/* Total card */}
        <View style={{ backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, alignItems: 'center' }}>
          <Text style={{ color: 'white', opacity: 0.85 }}>Total Estimated Annual Value</Text>
          <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold', marginTop: 4 }}>
            ${total.toLocaleString()}/year
          </Text>
          <Text style={{ color: 'white', opacity: 0.85, marginTop: 4 }}>
            across {eligible.length} programs
          </Text>
        </View>

        {/* Eligible section */}
        {eligible.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.success }}>
              LIKELY ELIGIBLE ({eligible.length})
            </Text>
            {eligible.map((result) => (
              <View
                key={result.program.id}
                style={{
                  backgroundColor: COLORS.card, borderRadius: 12, padding: 16,
                  borderWidth: 1, borderColor: COLORS.success + '40',
                }}
              >
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Text style={{ fontSize: 28 }}>{CATEGORY_ICONS[result.program.category]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text }}>
                      {language === 'es' ? result.program.nameEs : result.program.name}
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.success, marginTop: 2 }}>
                      ~${result.estimatedAnnualValue.toLocaleString()}/year
                    </Text>
                    <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
                      {language === 'es' ? result.program.descriptionEs : result.program.description}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={{
                  marginTop: 12, backgroundColor: COLORS.primary, borderRadius: 8,
                  paddingVertical: 10, alignItems: 'center',
                }}>
                  <Text style={{ color: 'white', fontWeight: '600' }}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Not eligible */}
        {notEligible.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textMuted }}>
              NOT ELIGIBLE ({notEligible.length})
            </Text>
            {notEligible.map((result) => (
              <View
                key={result.program.id}
                style={{
                  backgroundColor: COLORS.card, borderRadius: 12, padding: 16,
                  borderWidth: 1, borderColor: COLORS.border, opacity: 0.7,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>
                  {language === 'es' ? result.program.nameEs : result.program.name}
                </Text>
                {result.reason && (
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
                    Reason: {result.reason}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
