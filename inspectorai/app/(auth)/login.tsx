import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ScanSearch } from 'lucide-react-native';
import { signIn } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <ScanSearch size={40} color="#ffffff" />
          </View>
          <Text style={styles.appName}>InspectorAI</Text>
          <Text style={styles.tagline}>Property Damage Assessment</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formSubtitle}>Sign in to your inspector account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color="#52525b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="inspector@company.com"
                placeholderTextColor="#52525b"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color="#52525b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#52525b"
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#52525b" />
                ) : (
                  <Eye size={18} color="#52525b" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.8}
            style={styles.signupButton}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: { fontSize: 30, fontWeight: '800', color: '#ffffff', letterSpacing: -1 },
  tagline: { fontSize: 14, color: '#71717a', marginTop: 4 },
  form: { gap: 16 },
  formTitle: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  formSubtitle: { fontSize: 14, color: '#71717a', marginTop: -8 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#a1a1aa' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingRight: 14,
  },
  inputIcon: { paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#ffffff' },
  eyeButton: { padding: 4 },
  forgotPassword: { alignSelf: 'flex-end', marginTop: -8 },
  forgotPasswordText: { fontSize: 13, color: '#dc2626' },
  loginButton: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#27272a' },
  dividerText: { fontSize: 12, color: '#52525b' },
  signupButton: {
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  signupButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  footer: { fontSize: 11, color: '#52525b', textAlign: 'center', marginTop: 32 },
});
