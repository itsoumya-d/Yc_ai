import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SavingsCounter } from '../../components/home/SavingsCounter';
import { getTotalSavings, getRecentSavingsEvents } from '../../lib/actions/savings';
import { getDisputes } from '../../lib/actions/disputes';
import type { SavingsEvent, Dispute } from '../../types';

export default function HomeScreen() {
  const [totalSavings, setTotalSavings] = useState(0);
  const [recentEvents, setRecentEvents] = useState<SavingsEvent[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setError(null);
    try {
      const [savings, events, disputeData] = await Promise.all([
        getTotalSavings(),
        getRecentSavingsEvents(5),
        getDisputes(),
      ]);
      setTotalSavings(savings);
      setRecentEvents(events);
      setDisputes(disputeData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const won = disputes.filter(d => d.status === 'won').length;
  const total = disputes.length;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Claimback</Text>
        <Text style={styles.subtitle}>Your money, reclaimed</Text>
      </View>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <View style={styles.savingsHero}>
          <Text style={styles.savingsLabel}>Total Saved</Text>
          <SavingsCounter amount={totalSavings} />
          <Text style={styles.savingsTagline}>disputed and recovered</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{won}</Text>
            <Text style={styles.statLabel}>Disputes Won</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total Disputes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{total > 0 ? Math.round((won / total) * 100) : 0}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Savings</Text>
          {recentEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No savings yet. Scan a bill to get started!</Text>
            </View>
          ) : (
            recentEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventLeft}>
                  <Text style={styles.eventProvider}>{event.provider_name || 'Unknown'}</Text>
                  <Text style={styles.eventDate}>{new Date(event.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.eventAmount}>+${event.amount_saved.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  centered: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#14532d', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#16a34a', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  retryBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#16a34a',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#bbf7d0', marginTop: 2 },
  content: { flex: 1 },
  savingsHero: {
    backgroundColor: '#16a34a',
    paddingBottom: 32,
    paddingTop: 8,
    alignItems: 'center',
  },
  savingsLabel: { fontSize: 14, color: '#bbf7d0', marginBottom: 4 },
  savingsTagline: { fontSize: 13, color: '#86efac', marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#16a34a' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 8 },
  section: { paddingHorizontal: 16, marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  eventLeft: {},
  eventProvider: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  eventDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  eventAmount: { fontSize: 16, fontWeight: '700', color: '#16a34a' },
});
