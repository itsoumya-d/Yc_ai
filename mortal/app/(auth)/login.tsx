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
    if (!email || !password) {
      Alert.alert('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.topSection}>
          <Text style={styles.logoEmoji}>🕊️</Text>
          <Text style={styles.appName}>Mortal</Text>
          <Text style={styles.tagline}>Plan with peace of mind</Text>
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.message}>
            Taking care of end-of-life plans is one of the most loving things you can do for the people you care about.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#6b7280"
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
              placeholderTextColor="#6b7280"
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
              New to Mortal? <Text style={styles.signupLinkBold}>Create account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0720' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  topSection: { alignItems: 'center', marginBottom: 24 },
  logoEmoji: { fontSize: 52, marginBottom: 12 },
  appName: { fontSize: 36, fontWeight: '800', color: '#ffffff' },
  tagline: { fontSize: 15, color: '#a78bfa', marginTop: 4 },
  messageBox: {
    backgroundColor: '#1e1030',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  message: { fontSize: 14, color: '#c4b5fd', lineHeight: 22, textAlign: 'center', fontStyle: 'italic' },
  form: {
    backgroundColor: '#1e1030',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#a78bfa', marginBottom: 6 },
  input: {
    backgroundColor: '#0f0720',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  loginBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  signupLink: { alignItems: 'center', marginTop: 16 },
  signupLinkText: { fontSize: 14, color: '#6b7280' },
  signupLinkBold: { color: '#a78bfa', fontWeight: '600' },
});
