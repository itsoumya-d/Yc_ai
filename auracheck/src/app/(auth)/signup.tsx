import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { COLORS } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  function validate() {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password';
    else if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSignup() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (error) throw error;
      Alert.alert(
        'Account Created',
        'Please check your email to verify your account before signing in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
      );
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message ?? 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  function clearError(field: keyof typeof errors) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🔬</Text>
            </View>
            <Text style={styles.appName}>AuraCheck</Text>
            <Text style={styles.tagline}>Skin Health Intelligence</Text>
          </View>

          {/* Form Card */}
          <Card style={styles.formCard} elevated>
            <Text style={styles.formTitle}>Create your account</Text>
            <Text style={styles.formSubtitle}>Start monitoring your skin health today</Text>

            <View style={styles.fields}>
              <Input
                label="Full name"
                value={fullName}
                onChangeText={(v) => { setFullName(v); clearError('fullName'); }}
                placeholder="Jane Smith"
                autoComplete="name"
                autoCapitalize="words"
                error={errors.fullName}
              />
              <Input
                label="Email address"
                value={email}
                onChangeText={(v) => { setEmail(v); clearError('email'); }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email}
              />
              <Input
                label="Password"
                value={password}
                onChangeText={(v) => { setPassword(v); clearError('password'); }}
                placeholder="At least 8 characters"
                secureToggle
                hint="Use a mix of letters, numbers, and symbols"
                error={errors.password}
              />
              <Input
                label="Confirm password"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
                placeholder="Re-enter your password"
                secureToggle
                error={errors.confirmPassword}
              />
            </View>

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.submitBtn}
            />
          </Card>

          {/* Health disclaimer */}
          <Card style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
            <Text style={styles.disclaimerBody}>
              AuraCheck is an AI-powered screening tool and does not replace professional medical
              advice. Always consult a dermatologist for diagnosis and treatment.
            </Text>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },

  // Hero
  hero: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  logoEmoji: { fontSize: 34 },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // Form card
  formCard: { marginBottom: 16 },
  formTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 22,
  },
  fields: { marginBottom: 8 },
  submitBtn: { marginTop: 4 },

  // Medical disclaimer card
  disclaimerCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    marginBottom: 20,
    padding: 14,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  disclaimerBody: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 18,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 14, color: COLORS.textSecondary },
  footerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
});
