import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (\!email || \!password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { Alert.alert('Login Failed', error.message); return; }
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-20 pb-10">
          <View className="mb-10">
            <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-6">
              <Text className="text-white text-3xl font-bold">G</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900">Welcome back</Text>
            <Text className="text-gray-500 mt-2">Sign in to check your benefits</Text>
          </View>
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Email address</Text>
              <TextInput className="border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 bg-gray-50" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <TextInput className="border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 bg-gray-50" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
          </View>
          <TouchableOpacity className={`mt-8 py-4 rounded-xl items-center ${loading ? 'bg-blue-300' : 'bg-blue-600'}`} onPress={handleLogin} disabled={loading}>
            <Text className="text-white font-semibold text-base">{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-blue-600 font-semibold">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
