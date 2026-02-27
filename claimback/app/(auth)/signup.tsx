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
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) { Alert.alert('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName, email });
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
          <View style={styles.logoSection}>
            <Text style={styles.logoEmoji}>💰</Text>
            <Text style={styles.appName}>Claimback</Text>
            <View style={styles.taglineBadge}>
              <Text style={styles.tagline}>Users save avg $847/year</Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Create account</Text>
            {[
              { label: 'Full Name', value: fullName, setter: setFullName, placeholder: 'Jane Smith' },
              { label: 'Email', value: email, setter: setEmail, placeholder: 'you@example.com', keyboardType: 'email-address' as const, autoCapitalize: 'none' as const },
              { label: 'Password', value: password, setter: setPassword, placeholder: 'At least 8 characters', secure: true },
            ].map(({ label, value, setter, placeholder, keyboardType, autoCapitalize, secure }) => (
              <View key={label} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={setter}
                  placeholder={placeholder}
                  placeholderTextColor="#94a3b8"
                  keyboardType={keyboardType}
                  autoCapitalize={autoCapitalize}
                  secureTextEntry={secure}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.signupBtn, loading && styles.signupBtnDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.signupBtnText}>Start Saving</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#16a34a' },
  inner: { padding: 24, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 32, paddingTop: 20 },
  logoEmoji: { fontSize: 48, marginBottom: 10 },
  appName: { fontSize: 32, fontWeight: '800', color: '#ffffff' },
  taglineBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  tagline: { fontSize: 13, color: '#ffffff', fontWeight: '600' },
  form: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 },
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
  signupBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  signupBtnDisabled: { opacity: 0.6 },
  signupBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  loginLink: { alignItems: 'center', marginTop: 16 },
  loginLinkText: { fontSize: 14, color: '#64748b' },
  loginLinkBold: { color: '#16a34a', fontWeight: '600' },
});
