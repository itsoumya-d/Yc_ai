import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogle, signInWithApple, signInWithMagicLink } from '@/lib/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const handleMagicLink = async () => {
    if (!email.includes('@')) { Alert.alert('Invalid Email', 'Please enter a valid email.'); return; }
    setLoading(true);
    const { error } = await signInWithMagicLink(email);
    setLoading(false);
    if (error) Alert.alert('Error', error.message); else setSent(true);
  };

  const handleGoogle = async () => {
    setSocialLoading('google');
    const { error } = await signInWithGoogle();
    setSocialLoading(null);
    if (error) Alert.alert('Error', 'Failed to sign in with Google.');
  };

  const handleApple = async () => {
    setSocialLoading('apple');
    const { error } = await signInWithApple();
    setSocialLoading(null);
    if (error) Alert.alert('Error', 'Failed to sign in with Apple.');
  };

  if (sent) return (
    <View style={[s.container, { alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name="mail" size={56} color="#F59E0B" style={{ marginBottom: 24 }} />
      <Text style={s.title}>Check Your Email</Text>
      <Text style={s.sub}>We sent a magic link to {email}</Text>
      <TouchableOpacity style={s.secBtn} onPress={() => setSent(false)}>
        <Text style={s.secBtnText}>Use Different Email</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={s.container}>
            <View style={s.logoBox}>
              <Ionicons name="shield-checkmark" size={36} color="#F59E0B" />
            </View>
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.sub}>Sign in to your ComplianceSnap account</Text>

            <TouchableOpacity style={s.appleBtn} onPress={handleApple} disabled={socialLoading !== null}>
              {socialLoading === 'apple' ? <ActivityIndicator color="#000" size="small" /> : <Ionicons name="logo-apple" size={20} color="#000" />}
              <Text style={s.appleBtnText}>Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.googleBtn} onPress={handleGoogle} disabled={socialLoading !== null}>
              {socialLoading === 'google' ? <ActivityIndicator color="#1A1A2E" size="small" /> : <Ionicons name="logo-google" size={20} color="#1A1A2E" />}
              <Text style={[s.appleBtnText, { color: '#1A1A2E' }]}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={s.divText}>or</Text>
              <View style={s.divLine} />
            </View>

            <Text style={s.label}>Email Address</Text>
            <TextInput
              value={email} onChangeText={setEmail} placeholder="you@example.com"
              placeholderTextColor="#64748B" keyboardType="email-address"
              autoCapitalize="none" autoCorrect={false}
              style={[s.input, email && { borderColor: '#F59E0B' }]}
            />

            <TouchableOpacity style={[s.btn, !email && s.btnDis]} onPress={handleMagicLink} disabled={loading || !email}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnText}>Send Magic Link</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={s.backLink} onPress={() => router.back()}>
              <Text style={s.backText}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 24, paddingTop: 40 },
  logoBox: { width: 72, height: 72, borderRadius: 18, backgroundColor: '#F59E0B20', borderWidth: 2, borderColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', marginBottom: 24, alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
  sub: { fontSize: 15, color: '#64748B', marginBottom: 28 },
  appleBtn: { backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 },
  appleBtnText: { color: '#000000', fontSize: 16, fontWeight: '600' },
  googleBtn: { borderWidth: 1.5, borderColor: '#CBD5E1', paddingVertical: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: '#CBD5E1' },
  divText: { color: '#64748B', fontSize: 13, marginHorizontal: 12 },
  label: { color: '#1A1A2E', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1A1A2E', borderWidth: 1.5, borderColor: '#CBD5E1', marginBottom: 12 },
  btn: { backgroundColor: '#F59E0B', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  btnDis: { backgroundColor: '#E2E8F0' },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secBtn: { marginTop: 24, borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  secBtnText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
  backLink: { alignItems: 'center', paddingVertical: 8 },
  backText: { color: '#64748B', fontSize: 15 },
});
