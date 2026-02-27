import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { COLORS } from '@/constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) throw error;
      Alert.alert('Account Created', 'Welcome to Mortal! Please check your email to confirm your account.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: unknown) {
      Alert.alert('Sign Up Failed', err instanceof Error ? err.message : 'Could not create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.iconWrap}><Text style={styles.iconText}>📜</Text></View>
            <Text style={styles.appName}>Mortal</Text>
            <Text style={styles.tagline}>Secure Your Legacy</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.heading}>Create Account</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Jane Smith" placeholderTextColor={COLORS.textMuted} autoCapitalize="words" autoCorrect={false} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={COLORS.textMuted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min. 6 characters" placeholderTextColor={COLORS.textMuted} secureTextEntry autoCapitalize="none" />
            </View>
            <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Create Account</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Sign in</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  hero: { alignItems: 'center', marginBottom: 32 },
  iconWrap: { width: 72, height: 72, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  iconText: { fontSize: 36 },
  appName: { color: 'white', fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  heading: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.background },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 14, color: COLORS.textSecondary },
  linkAccent: { color: COLORS.primary, fontWeight: '600' },
});
