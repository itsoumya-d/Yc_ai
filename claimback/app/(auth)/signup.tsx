import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-8">
        <View className="mb-8 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
            <Ionicons name="receipt" size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
          <Text className="mt-1 text-sm text-gray-500">Start recovering your money today</Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700">Full Name</Text>
            <TextInput
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900"
              placeholder="Jane Smith"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700">Email</Text>
            <TextInput
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900"
              placeholder="you@example.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700">Password</Text>
            <TextInput
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900"
              placeholder="Min. 8 characters"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className={`mt-2 items-center rounded-xl py-4 ${loading ? 'bg-brand-500 opacity-60' : 'bg-brand-600'}`}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text className="text-base font-semibold text-white">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-gray-500">Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text className="text-sm font-semibold text-brand-600">Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
