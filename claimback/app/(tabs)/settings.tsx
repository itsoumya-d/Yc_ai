import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const [email, setEmail] = useState('');
  const [subscription, setSubscription] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();
        if (profile?.subscription_tier) setSubscription(profile.subscription_tier);
      }
    };
    fetchUser();
  }, []);

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
            <Text style={styles.cardValue}>{email || '—'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>
                  {subscription === 'pro' ? 'Claimback Pro' : 'Free Plan'}
                </Text>
                <Text style={styles.planDesc}>
                  {subscription === 'pro'
                    ? 'Unlimited scans & disputes'
                    : '3 scans/month, 1 dispute'}
                </Text>
              </View>
              {subscription === 'free' && (
                <TouchableOpacity style={styles.upgradeBtn}>
                  <Text style={styles.upgradeBtnText}>Upgrade $9/mo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Connect Bank Account</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Connect Insurance</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            {[
              { label: 'Privacy Policy', arrow: true },
              { label: 'Terms of Service', arrow: true },
              { label: 'Help & Support', arrow: true },
            ].map(({ label }, i, arr) => (
              <View key={label}>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuItemText}>{label}</Text>
                  <Text style={styles.menuItemArrow}>›</Text>
                </TouchableOpacity>
                {i < arr.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
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
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#16a34a',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
  cardValue: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  planDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  upgradeBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  upgradeBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 12 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  menuItemText: { fontSize: 15, color: '#1e293b' },
  menuItemArrow: { fontSize: 20, color: '#94a3b8' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
  signOutBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  signOutText: { color: '#dc2626', fontWeight: '700', fontSize: 16 },
});
