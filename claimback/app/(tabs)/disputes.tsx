import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { getDisputes } from '../../lib/actions/disputes';
import { DisputeCard } from '../../components/disputes/DisputeCard';
import type { Dispute } from '../../types';

type Filter = 'all' | 'open' | 'won' | 'lost';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
];

export default function DisputesScreen() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const fetchDisputes = useCallback(async () => {
    try {
      setError(null);
      const data = await getDisputes();
      setDisputes(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load disputes.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);

  const filtered = filter === 'all'
    ? disputes
    : disputes.filter(d => {
        if (filter === 'open') return ['draft', 'submitted', 'in_review'].includes(d.status);
        return d.status === filter;
      });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading disputes...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Couldn't load disputes</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => { setLoading(true); fetchDisputes(); }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Disputes</Text>
        <Text style={styles.subtitle}>{disputes.length} total</Text>
      </View>

      <View style={styles.filterBar}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterTab, filter === f.value && styles.filterTabActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterTabText, filter === f.value && styles.filterTabTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDisputes(); }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No disputes yet</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'Scan a bill to find overcharges and start your first dispute.'
                : `No ${filter} disputes found.`}
            </Text>
          </View>
        }
        renderItem={({ item }) => <DisputeCard dispute={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#16a34a',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#bbf7d0', marginTop: 2 },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: { borderBottomColor: '#16a34a' },
  filterTabText: { fontSize: 13, fontWeight: '500', color: '#94a3b8' },
  filterTabTextActive: { color: '#16a34a', fontWeight: '700' },
  listContent: { padding: 16, gap: 12, paddingBottom: 32 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center', paddingHorizontal: 32 },
  // Loading & error states
  loadingText: { marginTop: 12, fontSize: 14, color: '#16a34a' },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  retryButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
});
