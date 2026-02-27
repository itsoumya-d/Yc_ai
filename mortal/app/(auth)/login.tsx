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
    if (error) { Alert.alert('Error', error.message); return; }
    router.replace('/(tabs)');
  }

  const inputStyle = { backgroundColor: '#1e1e2e', borderWidth: 1, borderColor: '#2d2d3f', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#e2e8f0', fontSize: 15 };
  
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0f0f1a' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}>
          <View style={{ marginBottom: 40 }}>
            <View style={{ width: 64, height: 64, backgroundColor: '#4c1d95', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 32 }}>🕯️</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#f1f5f9', marginBottom: 8 }}>Mortal</Text>
            <Text style={{ color: '#94a3b8', fontSize: 15 }}>Document your wishes with dignity</Text>
          </View>
          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Email</Text>
              <TextInput style={inputStyle} placeholder="you@example.com" placeholderTextColor="#4a5568" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Password</Text>
              <TextInput style={inputStyle} placeholder="••••••••" placeholderTextColor="#4a5568" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
          </View>

          <TouchableOpacity
            style={{ marginTop: 32, backgroundColor: loading ? '#4c1d95' : '#7c3aed', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
            onPress={handleLogin} disabled={loading}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: '#64748b' }}>New to Mortal? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={{ color: '#a78bfa', fontWeight: '600' }}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
