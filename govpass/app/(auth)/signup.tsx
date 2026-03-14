import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (\!email || \!password || \!fullName) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    setLoading(false);
    if (error) { Alert.alert('Sign Up Failed', error.message); return; }
    router.replace('/onboarding');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-16 pb-10">
          <TouchableOpacity onPress={() => router.back()} className="mb-8">
            <Text className="text-blue-600 text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Create account</Text>
          <Text className="text-gray-500 mb-8">Check eligibility for 15+ federal benefit programs</Text>
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
              <TextInput className="border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 bg-gray-50" placeholder="Jane Smith" value={fullName} onChangeText={setFullName} autoComplete="name" />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Email address</Text>
              <TextInput className="border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 bg-gray-50" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <TextInput className="border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 bg-gray-50" placeholder="Min. 8 characters" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
          </View>
          <TouchableOpacity className={`mt-8 py-4 rounded-xl items-center ${loading ? 'bg-blue-300' : 'bg-blue-600'}`} onPress={handleSignup} disabled={loading}>
            <Text className="text-white font-semibold text-base">{loading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>
          <Text className="text-gray-400 text-xs text-center mt-6">Your data is encrypted and never shared without your consent.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
