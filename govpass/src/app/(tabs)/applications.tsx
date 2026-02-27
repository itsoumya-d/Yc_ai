import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useApplicationStore } from '@/stores/applications';
import { COLORS } from '@/constants/theme';

const STATUS_COLORS: Record<string, string> = {
  draft: COLORS.textMuted,
  in_progress: COLORS.primary,
  submitted: COLORS.warning,
  pending: COLORS.warning,
  approved: COLORS.success,
  denied: COLORS.error,
};

export default function ApplicationsScreen() {
  const { applications } = useApplicationStore();

  if (applications.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text, textAlign: 'center' }}>
          No Applications Yet
        </Text>
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          Start applying for benefits you're eligible for.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/eligibility/results')}
          style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Check My Eligibility</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 12 }}>
        {applications.map((app) => (
          <View
            key={app.id}
            style={{
              backgroundColor: COLORS.card, borderRadius: 12, padding: 16,
              borderWidth: 1, borderColor: COLORS.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text, flex: 1 }}>
                {app.programName}
              </Text>
              <View style={{
                backgroundColor: STATUS_COLORS[app.status] + '20',
                borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
              }}>
                <Text style={{ fontSize: 11, color: STATUS_COLORS[app.status], fontWeight: '700', textTransform: 'uppercase' }}>
                  {app.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {app.status === 'draft' || app.status === 'in_progress' ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>
                  Step {app.currentStep} of {app.totalSteps}
                </Text>
                <View style={{ height: 6, backgroundColor: COLORS.border, borderRadius: 3 }}>
                  <View style={{
                    height: 6,
                    width: `${(app.currentStep / app.totalSteps) * 100}%`,
                    backgroundColor: COLORS.primary,
                    borderRadius: 3,
                  }} />
                </View>
              </View>
            ) : null}

            {app.nextAction && (
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 8 }}>
                Next: {app.nextAction}
              </Text>
            )}

            <TouchableOpacity style={{
              marginTop: 12, backgroundColor: COLORS.primary, borderRadius: 8,
              paddingVertical: 10, alignItems: 'center',
            }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>
                {app.status === 'approved' ? 'View Details' : 'Continue Application'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
