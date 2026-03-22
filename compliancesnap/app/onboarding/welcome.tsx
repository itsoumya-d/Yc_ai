import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <View style={s.container}>
      <Animated.View style={[s.content, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <View style={s.logoBox}>
          <Ionicons name="shield-checkmark" size={48} color="#F59E0B" />
        </View>
        <Text style={s.appName}>ComplianceSnap</Text>
        <Text style={s.tagline}>Compliance documentation in one snap.</Text>
        <Text style={s.subtext}>ComplianceSnap turns compliance photos into audit-ready documentation instantly.</Text>
        <TouchableOpacity style={s.btn} onPress={() => router.push('/onboarding/industry')}>
          <Text style={s.btnText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.signinLink} onPress={() => router.push('/auth/login')}>
          <Text style={s.signinText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', padding: 28 },
  content: { alignItems: 'center', width: '100%' },
  logoBox: { width: 100, height: 100, borderRadius: 28, backgroundColor: '#F59E0B20', borderWidth: 2, borderColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  appName: { fontSize: 38, fontWeight: '800', color: '#1A1A2E', marginBottom: 16 },
  tagline: { fontSize: 20, fontWeight: '600', color: '#1A1A2E', textAlign: 'center', marginBottom: 12 },
  subtext: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 48, maxWidth: 300 },
  btn: { backgroundColor: '#F59E0B', paddingVertical: 16, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  signinLink: { paddingVertical: 8 },
  signinText: { color: '#64748B', fontSize: 15 },
});
