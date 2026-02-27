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
  const [householdSize, setHouseholdSize] = useState('1');
  const [annualIncome, setAnnualIncome] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
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
          household_size: parseInt(householdSize, 10),
          annual_income: annualIncome ? parseFloat(annualIncome) : null,
          state: state.toUpperCase().trim(),
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
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🏛️</Text>
            </View>
            <Text style={styles.appName}>GovPass</Text>
            <Text style={styles.tagline}>Unlock the benefits you deserve</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Create account</Text>

            {[
              { label: 'Full Name', value: fullName, setter: setFullName, placeholder: 'Jane Smith', autoComplete: 'name' as const },
              { label: 'Email', value: email, setter: setEmail, placeholder: 'you@example.com', keyboardType: 'email-address' as const, autoCapitalize: 'none' as const, autoComplete: 'email' as const },
              { label: 'Password', value: password, setter: setPassword, placeholder: '••••••••', secure: true, autoComplete: 'new-password' as const },
              { label: 'State (e.g. CA)', value: state, setter: setState, placeholder: 'CA', autoCapitalize: 'characters' as const },
            ].map(({ label, value, setter, placeholder, keyboardType, autoCapitalize, autoComplete, secure }) => (
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
                  autoComplete={autoComplete}
                  secureTextEntry={secure}
                />
              </View>
            ))}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Household Size</Text>
                <TextInput
                  style={styles.input}
                  value={householdSize}
                  onChangeText={setHouseholdSize}
                  placeholder="1"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Annual Income ($)</Text>
                <TextInput
                  style={styles.input}
                  value={annualIncome}
                  onChangeText={setAnnualIncome}
                  placeholder="35000"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signupBtn, loading && styles.signupBtnDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.signupBtnText}>Create Account</Text>}
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
  container: { flex: 1, backgroundColor: '#1d4ed8' },
  inner: { padding: 24, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 32, paddingTop: 20 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoIcon: { fontSize: 32 },
  appName: { fontSize: 28, fontWeight: '800', color: '#ffffff' },
  tagline: { fontSize: 13, color: '#bfdbfe', marginTop: 4 },
  form: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24 },
  formTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
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
  row: { flexDirection: 'row' },
  signupBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  signupBtnDisabled: { opacity: 0.6 },
  signupBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  loginLink: { alignItems: 'center', marginTop: 16 },
  loginLinkText: { fontSize: 14, color: '#64748b' },
  loginLinkBold: { color: '#1d4ed8', fontWeight: '600' },
});
