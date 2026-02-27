import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/services/supabase';
import { COLORS } from '@/constants/theme';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, company } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Success', 'Please check your email to confirm your account.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🛡️</Text>
            </View>
            <Text style={styles.heroTitle}>Get Started</Text>
            <Text style={styles.heroSubtitle}>Create your ComplianceSnap account</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName}
                placeholder="Jane Smith" placeholderTextColor={COLORS.textSecondary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Company</Text>
              <TextInput style={styles.input} value={company} onChangeText={setCompany}
                placeholder="Acme Corp" placeholderTextColor={COLORS.textSecondary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email *</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail}
                placeholder="you@company.com" placeholderTextColor={COLORS.textSecondary}
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password *</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword}
                placeholder="Min. 6 characters" placeholderTextColor={COLORS.textSecondary}
                secureTextEntry />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Create Account</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <Text style={[styles.linkText, styles.linkBold]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1 },
  hero: { padding: 32, alignItems: 'center' },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoEmoji: { fontSize: 40 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  card: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, flex: 1 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  inputWrapper: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: COLORS.text, backgroundColor: COLORS.surface,
  },
  button: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  linkRow: { flexDirection: 'row', justifyContent: 'center' },
  linkText: { fontSize: 14, color: COLORS.textSecondary },
  linkBold: { color: COLORS.primary, fontWeight: '600' },
});
