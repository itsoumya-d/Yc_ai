import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { recordCheckIn } from '../../lib/actions/checkin';

const CHECK_IN_OPTIONS = [
  { label: 'Every week', value: 7 },
  { label: 'Every 2 weeks', value: 14 },
  { label: 'Every month', value: 30 },
  { label: 'Every 3 months', value: 90 },
];

export default function SettingsScreen() {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [checkInFrequency, setCheckInFrequency] = useState(30);
  const [subscription, setSubscription] = useState<'free' | 'pro'>('free');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || '');
    };
    fetchUser();
  }, []);

  const handleCheckIn = async () => {
    try {
      await recordCheckIn();
      Alert.alert('Checked In', 'Your check-in has been recorded. Stay well.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Email</Text>
            <Text style={styles.cardValue}>{userEmail}</Text>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View>
                <Text style={styles.cardLabel}>Subscription</Text>
                <Text style={styles.cardValue}>{subscription === 'pro' ? 'Mortal Pro' : 'Free Plan'}</Text>
              </View>
              {subscription === 'free' && (
                <TouchableOpacity style={styles.upgradeBtn}>
                  <Text style={styles.upgradeBtnText}>Upgrade</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Biometric Authentication</Text>
                <Text style={styles.switchSub}>Require Face ID / fingerprint on open</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#374151', true: '#5b21b6' }}
                thumbColor={biometricEnabled ? '#7c3aed' : '#9ca3af'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dead Man's Switch</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Check-in Frequency</Text>
            <View style={styles.frequencyOptions}>
              {CHECK_IN_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.freqBtn, checkInFrequency === opt.value && styles.freqBtnActive]}
                  onPress={() => setCheckInFrequency(opt.value)}
                >
                  <Text style={[styles.freqBtnText, checkInFrequency === opt.value && styles.freqBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.checkInBtn} onPress={handleCheckIn}>
              <Text style={styles.checkInBtnText}>Check In Now</Text>
            </TouchableOpacity>
            <Text style={styles.checkInSub}>
              If you miss a check-in, your trusted contacts will be notified.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0720' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#1a0d35',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#ffffff' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1e1030',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  cardLabel: { fontSize: 12, color: '#a78bfa', marginBottom: 2 },
  cardValue: { fontSize: 15, color: '#ffffff', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#2d1b4e', marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  upgradeBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  upgradeBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 13 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  switchLabel: { fontSize: 15, color: '#ffffff', fontWeight: '500', flex: 1 },
  switchSub: { fontSize: 12, color: '#a78bfa', marginTop: 2 },
  frequencyOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  freqBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#2d1b4e',
  },
  freqBtnActive: { backgroundColor: '#7c3aed' },
  freqBtnText: { fontSize: 13, color: '#a78bfa' },
  freqBtnTextActive: { color: '#ffffff', fontWeight: '600' },
  checkInBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  checkInBtnText: { color: '#ffffff', fontWeight: '700' },
  checkInSub: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  signOutBtn: {
    backgroundColor: '#2d0a0a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  signOutText: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
});
