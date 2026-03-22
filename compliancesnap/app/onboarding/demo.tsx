import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { Ionicons } from '@expo/vector-icons';

export default function DemoScreen() {
  const { setOnboardingComplete } = useAuthStore();
  const handleStart = () => { setOnboardingComplete(true); router.replace('/auth/login'); };
  return (
    <View style={s.container}>
      <View style={s.badge}><Text style={s.badgeText}>You are all set!</Text></View>
      <Text style={s.title}>Welcome to ComplianceSnap</Text>
      <Text style={s.sub}>Here is what you can do:</Text>
      <View style={s.features}>
        {['Items Checked', 'Issues Found', 'Reports Ready'].map((f, i) => (
          <View key={i} style={s.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
            <Text style={s.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.btn} onPress={handleStart}>
        <Text style={s.btnText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 28, alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: '#F59E0B20', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 24 },
  badgeText: { color: '#F59E0B', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 30, fontWeight: '800', color: '#1A1A2E', textAlign: 'center', marginBottom: 12 },
  sub: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32 },
  features: { width: '100%', marginBottom: 40, gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 16, color: '#1A1A2E' },
  btn: { backgroundColor: '#F59E0B', paddingVertical: 16, borderRadius: 14, width: '100%', alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
