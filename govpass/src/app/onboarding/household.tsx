import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useUserStore } from '@/stores/user';
import { COLORS } from '@/constants/theme';

const HOUSEHOLD_SIZES = [
  { label: 'Just me', value: 1 },
  { label: '2 people', value: 2 },
  { label: '3–4 people', value: 3 },
  { label: '5+ people', value: 5 },
];

const INCOME_RANGES = [
  { label: 'Under $15,000', value: 12000 },
  { label: '$15,000–$30,000', value: 22000 },
  { label: '$30,000–$50,000', value: 40000 },
  { label: '$50,000–$75,000', value: 62000 },
  { label: '$75,000+', value: 80000 },
];

export default function HouseholdScreen() {
  const { setHouseholdInfo, setOnboardingCompleted } = useUserStore();
  const [step, setStep] = useState(0);
  const [size, setSize] = useState<number | null>(null);
  const [income, setIncome] = useState<number | null>(null);

  const handleFinish = () => {
    setHouseholdInfo({
      size: size ?? 1,
      annualIncome: income ?? 30000,
      hasChildren: (size ?? 1) > 1,
      numberOfChildren: Math.max(0, (size ?? 1) - 1),
    });
    setOnboardingCompleted(true);
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 24, paddingTop: 60 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 8 }}>
          Let's find your benefits
        </Text>
        <Text style={{ color: COLORS.textSecondary, marginBottom: 32 }}>
          Step {step + 1} of 2 — This takes about 1 minute
        </Text>

        {step === 0 ? (
          <>
            <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 16 }}>
              How many people live in your household?
            </Text>
            {HOUSEHOLD_SIZES.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSize(opt.value)}
                style={{
                  backgroundColor: size === opt.value ? COLORS.primary : COLORS.card,
                  borderRadius: 12, padding: 18, marginBottom: 10,
                  borderWidth: 2, borderColor: size === opt.value ? COLORS.primary : COLORS.border,
                }}
              >
                <Text style={{
                  fontSize: 16, fontWeight: '600',
                  color: size === opt.value ? 'white' : COLORS.text,
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setStep(1)}
              disabled={!size}
              style={{
                backgroundColor: size ? COLORS.primary : COLORS.border,
                borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Continue</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 16 }}>
              What is your household's approximate yearly income?
            </Text>
            {INCOME_RANGES.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setIncome(opt.value)}
                style={{
                  backgroundColor: income === opt.value ? COLORS.primary : COLORS.card,
                  borderRadius: 12, padding: 18, marginBottom: 10,
                  borderWidth: 2, borderColor: income === opt.value ? COLORS.primary : COLORS.border,
                }}
              >
                <Text style={{
                  fontSize: 16, fontWeight: '600',
                  color: income === opt.value ? 'white' : COLORS.text,
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={handleFinish}
              disabled={!income}
              style={{
                backgroundColor: income ? COLORS.primary : COLORS.border,
                borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>See My Benefits</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
