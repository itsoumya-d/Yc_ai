import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

const STEPS = ['Household Size', 'Income', 'Household Members', 'Special Status', 'Location'];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function OnboardingScreen() {
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    familySize: '1',
    income: '',
    hasChildren: false,
    childrenUnder5: '0',
    childrenUnder18: '0',
    isPregnant: false,
    isDisabled: false,
    isVeteran: false,
    isStudent: false,
    hasElderly: false,
    elderlyCount: '0',
    age: '',
    state: 'CA',
    citizenshipStatus: 'citizen' as 'citizen' | 'permanent_resident' | 'other',
  });

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  async function handleComplete() {
    setLoading(true);
    const profile = {
      user_id: user?.id,
      family_size: parseInt(form.familySize) || 1,
      annual_income: parseFloat(form.income) || 0,
      has_children: form.hasChildren,
      children_under_5: parseInt(form.childrenUnder5) || 0,
      children_under_18: parseInt(form.childrenUnder18) || 0,
      is_pregnant: form.isPregnant,
      is_disabled: form.isDisabled,
      is_veteran: form.isVeteran,
      is_student: form.isStudent,
      has_elderly: form.hasElderly,
      elderly_count: parseInt(form.elderlyCount) || 0,
      age: parseInt(form.age) || 30,
      state: form.state,
      citizenship_status: form.citizenshipStatus,
    };
    const { error } = await supabase.from('household_profiles').upsert(profile, { onConflict: 'user_id' });
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }
    router.replace('/(tabs)');
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-800">How many people are in your household?</Text>
            <TextInput className="border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 text-center text-2xl" keyboardType="numeric" value={form.familySize} onChangeText={(v) => update('familySize', v)} placeholder="1" />
            <Text className="text-gray-500 text-sm text-center">Include yourself and anyone you live with</Text>
          </View>
        );
      case 1:
        return (
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-800">What is your household's total annual income?</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4">
              <Text className="text-gray-500 text-lg mr-2">$</Text>
              <TextInput className="flex-1 py-3.5 text-gray-900 text-xl" keyboardType="numeric" value={form.income} onChangeText={(v) => update('income', v)} placeholder="45,000" />
            </View>
            <Text className="text-gray-500 text-sm">Before taxes. Include all household members' income.</Text>
          </View>
        );
      case 2:
        return (
          <View className="space-y-5">
            <Text className="text-lg font-semibold text-gray-800">Tell us about your household members</Text>
            {[
              { label: 'Has children', key: 'hasChildren', type: 'switch' },
              form.hasChildren && { label: 'Children under 5', key: 'childrenUnder5', type: 'number' },
              form.hasChildren && { label: 'Children under 18', key: 'childrenUnder18', type: 'number' },
              { label: 'Has elderly members (65+)', key: 'hasElderly', type: 'switch' },
              form.hasElderly && { label: 'Number of elderly members', key: 'elderlyCount', type: 'number' },
            ].filter(Boolean).map((field: { label: string; key: string; type: string } | null) => field && (
              <View key={field.key} className="flex-row items-center justify-between">
                <Text className="text-gray-700">{field.label}</Text>
                {field.type === 'switch' ? (
                  <Switch value={form[field.key as keyof typeof form] as boolean} onValueChange={(v) => update(field.key, v)} trackColor={{ true: '#1a56db' }} />
                ) : (
                  <TextInput className="border border-gray-300 rounded-lg px-3 py-2 w-16 text-center" keyboardType="numeric" value={String(form[field.key as keyof typeof form])} onChangeText={(v) => update(field.key, v)} />
                )}
              </View>
            ))}
          </View>
        );
      case 3:
        return (
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-800">Special circumstances</Text>
            {[
              { label: 'Pregnant', key: 'isPregnant' },
              { label: 'Has a disability', key: 'isDisabled' },
              { label: 'Veteran or active military', key: 'isVeteran' },
              { label: 'Currently a student', key: 'isStudent' },
            ].map(({ label, key }) => (
              <View key={key} className="flex-row items-center justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-700 text-base">{label}</Text>
                <Switch value={form[key as keyof typeof form] as boolean} onValueChange={(v) => update(key, v)} trackColor={{ true: '#1a56db' }} />
              </View>
            ))}
            <View>
              <Text className="text-gray-700 mb-2">Your age</Text>
              <TextInput className="border border-gray-300 rounded-xl px-4 py-3 w-24 text-center" keyboardType="numeric" value={form.age} onChangeText={(v) => update('age', v)} placeholder="30" />
            </View>
          </View>
        );
      case 4:
        return (
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-800">Where do you live?</Text>
            <View className="flex-row flex-wrap gap-2">
              {US_STATES.map((s) => (
                <TouchableOpacity
                  key={s}
                  className={`px-3 py-2 rounded-lg border ${form.state === s ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                  onPress={() => update('state', s)}
                >
                  <Text className={`text-sm font-medium ${form.state === s ? 'text-white' : 'text-gray-700'}`}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View>
              <Text className="text-gray-700 mb-2">Citizenship status</Text>
              {(['citizen', 'permanent_resident', 'other'] as const).map((c) => (
                <TouchableOpacity key={c} className={`mb-2 px-4 py-3 rounded-xl border ${form.citizenshipStatus === c ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-300'}`} onPress={() => update('citizenshipStatus', c)}>
                  <Text className={form.citizenshipStatus === c ? 'text-blue-700 font-medium' : 'text-gray-700'}>{c === 'citizen' ? 'US Citizen' : c === 'permanent_resident' ? 'Permanent Resident (Green Card)' : 'Other Immigration Status'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      default: return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-4">
        <View className="flex-row space-x-1 mb-6">
          {STEPS.map((_, i) => (
            <View key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </View>
        <Text className="text-sm text-gray-500 mb-1">Step {step + 1} of {STEPS.length}</Text>
        <Text className="text-2xl font-bold text-gray-900">{STEPS[step]}</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">{renderStep()}</View>
      </ScrollView>
      <View className="px-6 pb-8 pt-4 flex-row space-x-3">
        {step > 0 && (
          <TouchableOpacity className="flex-1 py-4 rounded-xl border border-gray-300 items-center" onPress={() => setStep((s) => s - 1)}>
            <Text className="text-gray-700 font-semibold">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`flex-1 py-4 rounded-xl items-center ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
          onPress={step === STEPS.length - 1 ? handleComplete : () => setStep((s) => s + 1)}
          disabled={loading}
        >
          <Text className="text-white font-semibold">{loading ? 'Saving...' : step === STEPS.length - 1 ? 'See My Benefits' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
