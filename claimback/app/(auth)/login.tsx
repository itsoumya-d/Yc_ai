import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Please enter email and password.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Login Failed', error.message);
    else router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.logoSection}>
          <Text style={styles.logoEmoji}>💰</Text>
          <Text style={styles.appName}>Claimback</Text>
          <Text style={styles.tagline}>Get money back on overbilled statements</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.loginBtnText}>Sign In</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.signupLink} onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signupLinkText}>
              New here? <Text style={styles.signupLinkBold}>Create account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16a34a' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoEmoji: { fontSize: 52, marginBottom: 12 },
  appName: { fontSize: 36, fontWeight: '800', color: '#ffffff' },
  tagline: { fontSize: 14, color: '#bbf7d0', marginTop: 6, textAlign: 'center' },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  formTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loginBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  signupLink: { alignItems: 'center', marginTop: 16 },
  signupLinkText: { fontSize: 14, color: '#64748b' },
  signupLinkBold: { color: '#16a34a', fontWeight: '600' },
});
