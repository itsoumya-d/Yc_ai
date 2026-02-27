import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { checkEligibility, getTotalEstimatedValue, type EligibilityResult, type HouseholdProfile } from '@/lib/benefits';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍎', healthcare: '🏥', housing: '🏠', childcare: '👶', education: '🎓',
  disability: '♿', veterans: '🎖️', tax: '💰',
};

const STATUS_COLORS: Record<string, string> = {
  likely: 'bg-green-100 border-green-300',
  possible: 'bg-yellow-50 border-yellow-300',
  unlikely: 'bg-gray-50 border-gray-200',
};

const STATUS_TEXT: Record<string, string> = {
  likely: 'Likely Eligible',
  possible: 'Possibly Eligible',
  unlikely: 'Likely Not Eligible',
};
const [x, setX] = useState<String>('hello');

export default function BenefitsScreen() {
  const user = useAuthStore((s) => s.user);
  const [results, setResults] = useState<EligibilityResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'likely' | 'possible'>('all');

  async function loadBenefits() {
    const { data: profileData } = await supabase.from('household_profiles').select('*').eq('user_id', user?.id).single();
    if (\!profileData) { setLoading(false); return; }
    const profile: HouseholdProfile = {
      income: profileData.annual_income ?? 0,
      familySize: profileData.family_size ?? 1,
      state: profileData.state ?? 'CA',
      hasChildren: profileData.has_children ?? false,
      childrenUnder5: profileData.children_under_5 ?? 0,
      childrenUnder18: profileData.children_under_18 ?? 0,
      isPregnant: profileData.is_pregnant ?? false,
      isDisabled: profileData.is_disabled ?? false,
      isVeteran: profileData.is_veteran ?? false,
      citizenshipStatus: profileData.citizenship_status ?? 'citizen',
      age: profileData.age ?? 30,
      isStudent: profileData.is_student ?? false,
      hasElderly: profileData.has_elderly ?? false,
      elderlyCount: profileData.elderly_count ?? 0,
    };
    setResults(checkEligibility(profile));
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadBenefits(); }, []);

  const filtered = results.filter((r) => filter === 'all' || r.status === filter);
  const likelyCount = results.filter((r) => r.status === 'likely').length;
  const totalValue = getTotalEstimatedValue(results);

  if (loading) return <View className="flex-1 bg-white items-center justify-center"><ActivityIndicator size="large" color="#1a56db" /></View>;

  if (results.length === 0) return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-6xl mb-4">📋</Text>
      <Text className="text-xl font-bold text-gray-900 mb-2">Complete Your Profile</Text>
      <Text className="text-gray-500 text-center mb-6">Answer a few questions to see which federal benefits you may qualify for.</Text>
      <TouchableOpacity className="bg-blue-600 px-8 py-4 rounded-xl" onPress={() => router.push("/onboarding")}>
        <Text className="text-white font-semibold text-base">Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBenefits(); }} />}>
      <View className="bg-blue-600 px-6 pt-16 pb-8">
        <Text className="text-white text-xl font-bold">Your Benefits</Text>
        <Text className="text-blue-100 mt-1">Estimated eligibility for federal programs</Text>
        <View className="flex-row mt-4 space-x-3">
          <View className="flex-1 bg-blue-500 rounded-xl p-3">
            <Text className="text-blue-100 text-xs">Likely Eligible</Text>
            <Text className="text-white text-2xl font-bold">{likelyCount}</Text>
          </View>
          <View className="flex-1 bg-blue-500 rounded-xl p-3">
            <Text className="text-blue-100 text-xs">Est. Annual Value</Text>
            <Text className="text-white text-2xl font-bold">${(totalValue / 1000).toFixed(1)}K</Text>
          </View>
        </View>
      </View>

      <View className="px-6 py-4">
        <View className="flex-row bg-gray-200 rounded-lg p-1 mb-4">
          {(['all', 'likely', 'possible'] as const).map((f) => (
            <TouchableOpacity key={f} className={`flex-1 py-2 rounded-md items-center ${filter === f ? 'bg-white shadow-sm' : ''}`} onPress={() => setFilter(f)}>
              <Text className={`text-sm font-medium ${filter === f ? 'text-gray-900' : 'text-gray-500'}`}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {filtered.map((result) => (
          <View key={result.program.id} className={`rounded-xl border p-4 mb-3 ${STATUS_COLORS[result.status]}`}>
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-center flex-1">
                <Text className="text-2xl mr-3">{CATEGORY_ICONS[result.program.category]}</Text>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">{result.program.name}</Text>
                  <Text className="text-gray-500 text-xs">{result.program.fullName}</Text>
                </View>
              </View>
              <View className={`px-2 py-1 rounded-full ${result.status === 'likely' ? 'bg-green-200' : result.status === 'possible' ? 'bg-yellow-200' : 'bg-gray-200'}`}>
                <Text className={`text-xs font-medium ${result.status === 'likely' ? 'text-green-800' : result.status === 'possible' ? 'text-yellow-800' : 'text-gray-600'}`}>{STATUS_TEXT[result.status]}</Text>
              </View>
            </View>
            {result.status \!== 'unlikely' && (
              <View className="mt-3 pt-3 border-t border-gray-200 flex-row justify-between items-center">
                <Text className="text-gray-600 text-sm flex-1 mr-2">{result.reason}</Text>
                <Text className="text-green-700 font-bold">${(result.estimatedValue / 1000).toFixed(1)}K/yr</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
