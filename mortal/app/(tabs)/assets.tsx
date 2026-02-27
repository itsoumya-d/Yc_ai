import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { getAssets } from '../../lib/actions/assets';
import { AssetCard } from '../../components/assets/AssetCard';
import type { DigitalAsset } from '../../types';

const GROUP_LABELS: Record<string, string> = {
  social_media: 'Social Media',
  financial: 'Financial',
  email: 'Email',
  crypto: 'Cryptocurrency',
  other: 'Other',
};

export default function AssetsScreen() {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, []);

  const grouped = assets.reduce<Record<string, DigitalAsset[]>>((acc, asset) => {
    const group = asset.category || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(asset);
    return acc;
  }, {});

  const sections = Object.entries(grouped).map(([key, data]) => ({
    title: GROUP_LABELS[key] || key,
    data,
  }));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchAssets}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Digital Assets</Text>
          <Text style={styles.subtitle}>{assets.length} assets documented</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/assets/add')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {assets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No assets yet</Text>
          <Text style={styles.emptyText}>
            Document your digital accounts and assets so your loved ones know what to do with them.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/assets/add')}>
            <Text style={styles.emptyBtnText}>Add First Asset</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item }) => <AssetCard asset={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0720' },
  centered: {
    flex: 1,
    backgroundColor: '#0f0720',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#a78bfa', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  retryBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#1a0d35',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#a78bfa', marginTop: 2 },
  addBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 32 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#a78bfa', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  emptyBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#ffffff', fontWeight: '700' },
});
