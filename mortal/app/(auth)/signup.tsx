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
    if (!fullName || !email || !password) {
      Alert.alert('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email,
        });
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
          <View style={styles.topSection}>
            <Text style={styles.logoEmoji}>🕊️</Text>
            <Text style={styles.appName}>Mortal</Text>
            <Text style={styles.tagline}>Plan with peace of mind</Text>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.message}>
              "The greatest gift you can give your family is a plan. Let's build yours together, one gentle step at a time."
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Create your account</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your name"
                placeholderTextColor="#6b7280"
                autoComplete="name"
              />
            </View>
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
                placeholder="Choose a strong password"
                placeholderTextColor="#6b7280"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.signupBtn, loading && styles.signupBtnDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.signupBtnText}>Begin Your Plan</Text>}
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
  container: { flex: 1, backgroundColor: '#0f0720' },
  inner: { padding: 24, paddingBottom: 40 },
  topSection: { alignItems: 'center', marginBottom: 24, paddingTop: 16 },
  logoEmoji: { fontSize: 48, marginBottom: 10 },
  appName: { fontSize: 32, fontWeight: '800', color: '#ffffff' },
  tagline: { fontSize: 14, color: '#a78bfa', marginTop: 4 },
  messageBox: {
    backgroundColor: '#1e1030',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  message: { fontSize: 13, color: '#c4b5fd', lineHeight: 22, textAlign: 'center', fontStyle: 'italic' },
  form: {
    backgroundColor: '#1e1030',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 20 },
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
  signupBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  signupBtnDisabled: { opacity: 0.6 },
  signupBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  loginLink: { alignItems: 'center', marginTop: 16 },
  loginLinkText: { fontSize: 14, color: '#6b7280' },
  loginLinkBold: { color: '#a78bfa', fontWeight: '600' },
});
