import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useUserStore } from '@/stores/user';
import { useApplicationStore } from '@/stores/applications';
import { calculateEligibility } from '@/services/eligibility';
import { FEDERAL_PROGRAMS } from '@/constants/programs';
import { COLORS } from '@/constants/theme';

export default function HomeScreen() {
  const { householdInfo, language } = useUserStore();
  const { applications } = useApplicationStore();
  const [refreshing, setRefreshing] = useState(false);

  const eligibilityResults = calculateEligibility(
    { ...householdInfo, age: 35 },
    FEDERAL_PROGRAMS
  );
  const eligible = eligibilityResults.filter((r) => r.isEligible);
  const totalValue = eligible.reduce((sum, r) => sum + r.estimatedAnnualValue, 0);
  const activeApps = applications.filter((a) => ['draft', 'in_progress', 'submitted', 'pending'].includes(a.status));

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ padding: 16, gap: 16 }}>
        {/* Benefits Summary Card */}
        <View style={{ backgroundColor: COLORS.primary, borderRadius: 16, padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 14, opacity: 0.85 }}>
            You may qualify for
          </Text>
          <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 4 }}>
            ${totalValue.toLocaleString()}/year
          </Text>
          <Text style={{ color: 'white', opacity: 0.85, marginTop: 4 }}>
            across {eligible.length} programs
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/eligibility/results')}
            style={{
              marginTop: 16,
              backgroundColor: 'white',
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 16,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
              See all {eligible.length} programs →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scan CTA */}
        <TouchableOpacity
          onPress={() => router.push('/scanner')}
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: COLORS.primary + '15',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 24 }}>📷</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text }}>
              Scan a Document
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>
              Add documents for more accurate results
            </Text>
          </View>
        </TouchableOpacity>

        {/* Top Benefits */}
        <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>
          Your Top Benefits
        </Text>
        {eligible.slice(0, 4).map((result) => (
          <View
            key={result.program.id}
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text }}>
                  {language === 'es' ? result.program.nameEs : result.program.name}
                </Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.success, marginTop: 4 }}>
                  ~${result.estimatedAnnualValue.toLocaleString()}/year
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
                  {language === 'es' ? result.program.descriptionEs : result.program.description}
                </Text>
              </View>
              <View style={{
                backgroundColor: COLORS.success + '20',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginLeft: 8,
              }}>
                <Text style={{ fontSize: 11, color: COLORS.success, fontWeight: '600' }}>
                  ELIGIBLE
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{
                marginTop: 12,
                backgroundColor: COLORS.primary,
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Active Applications */}
        {activeApps.length > 0 && (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>
              Active Applications
            </Text>
            {activeApps.map((app) => (
              <View
                key={app.id}
                style={{
                  backgroundColor: COLORS.card,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>
                  {app.programName}
                </Text>
                <View style={{
                  backgroundColor: COLORS.warning + '20',
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  alignSelf: 'flex-start',
                  marginTop: 6,
                }}>
                  <Text style={{ fontSize: 12, color: COLORS.warning, fontWeight: '600', textTransform: 'uppercase' }}>
                    {app.status}
                  </Text>
                </View>
                {app.nextAction && (
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 8 }}>
                    Next: {app.nextAction}
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
