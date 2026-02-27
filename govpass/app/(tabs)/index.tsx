import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { calculateEligibility } from '../../lib/actions/eligibility';
import { EligibilityCard } from '../../components/home/EligibilityCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { EligibilityResult, UserProfile } from '../../types';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [eligibilityResults, setEligibilityResults] = useState<EligibilityResult[]>([]);
  const [totalBenefits, setTotalBenefits] = useState(0);
  const [eligibilityScore, setEligibilityScore] = useState(0);

  const fetchData = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);
        const results = calculateEligibility(profileData);
        setEligibilityResults(results);
        const total = results.filter(r => r.eligible).reduce((sum, r) => sum + r.annualBenefit, 0);
        setTotalBenefits(total);
        const score = Math.round((results.filter(r => r.eligible).length / results.length) * 100);
        setEligibilityScore(score);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load your benefits data.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); fetchData(); }}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.subGreeting}>Your benefits overview</Text>
          </View>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{eligibilityScore}%</Text>
            <Text style={styles.scoreLabel}>Match</Text>
          </View>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsLabel}>Estimated Annual Benefits</Text>
          <Text style={styles.benefitsAmount}>
            ${totalBenefits.toLocaleString()}
          </Text>
          <Text style={styles.benefitsSubtext}>Based on your profile</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programs You May Qualify For</Text>
          {eligibilityResults.filter(r => r.eligible).map((result) => (
            <EligibilityCard key={result.program} result={result} />
          ))}
          {eligibilityResults.filter(r => r.eligible).length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Complete your profile to see eligibility results</Text>
              <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/settings')}>
                <Text style={styles.profileButtonText}>Update Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(tabs)/scan')}>
              <Text style={styles.quickActionEmoji}>📄</Text>
              <Text style={styles.quickActionTitle}>Scan Document</Text>
              <Text style={styles.quickActionSub}>Upload ID or tax form</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={() => router.push('/(tabs)/applications')}>
              <Text style={styles.quickActionEmoji}>📋</Text>
              <Text style={styles.quickActionTitle}>My Applications</Text>
              <Text style={styles.quickActionSub}>Track your status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#1d4ed8',
  },
  greeting: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  subGreeting: { fontSize: 14, color: '#bfdbfe', marginTop: 2 },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  scoreLabel: { fontSize: 10, color: '#bfdbfe' },
  benefitsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1d4ed8',
    borderRadius: 16,
    alignItems: 'center',
  },
  benefitsLabel: { fontSize: 14, color: '#bfdbfe', marginBottom: 4 },
  benefitsAmount: { fontSize: 40, fontWeight: '800', color: '#ffffff' },
  benefitsSubtext: { fontSize: 12, color: '#bfdbfe', marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 16 },
  profileButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  profileButtonText: { color: '#ffffff', fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: 12 },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionEmoji: { fontSize: 28, marginBottom: 8 },
  quickActionTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', textAlign: 'center' },
  quickActionSub: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 2 },
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  retryButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
});
