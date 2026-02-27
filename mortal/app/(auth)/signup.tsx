import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (\!email || \!password || \!name) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }
    router.replace('/(tabs)');
  }

  const inputStyle = { backgroundColor: '#1e1e2e', borderWidth: 1, borderColor: '#2d2d3f', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#e2e8f0', fontSize: 15 };
  
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#0f0f1a' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
            <Text style={{ color: '#a78bfa', fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontWeight: '700', color: '#f1f5f9', marginBottom: 8 }}>Create Account</Text>
          <Text style={{ color: '#64748b', marginBottom: 32, fontSize: 15 }}>Your data is encrypted and private</Text>

          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Full Name</Text>
              <TextInput style={inputStyle} placeholder="Jane Smith" placeholderTextColor="#4a5568" value={name} onChangeText={setName} autoCapitalize="words" />
            </View>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Email</Text>
              <TextInput style={inputStyle} placeholder="you@example.com" placeholderTextColor="#4a5568" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Password</Text>
              <TextInput style={inputStyle} placeholder="Min. 8 characters" placeholderTextColor="#4a5568" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
          </View>

          <TouchableOpacity
            style={{ marginTop: 32, backgroundColor: loading ? '#4c1d95' : '#7c3aed', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
            onPress={handleSignup} disabled={loading}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{loading ? 'Creating...' : 'Create Account'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
