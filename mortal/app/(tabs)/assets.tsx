import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

type Asset = {
  id: string;
  name: string;
  category: 'financial' | 'crypto' | 'social' | 'subscription' | 'property';
  emoji: string;
  value?: string;
  institution?: string;
  notes: string;
  accessLevel: 'executor' | 'spouse' | 'family' | 'public';
  lastUpdated: string;
};

const ASSETS: Asset[] = [
  { id: '1', name: 'Chase Checking', category: 'financial', emoji: '🏦', value: '$12,400', institution: 'JPMorgan Chase', notes: 'Primary account. Credentials in vault. Beneficiary: Sarah.', accessLevel: 'executor', lastUpdated: 'Feb 1, 2025' },
  { id: '2', name: 'Vanguard 401(k)', category: 'financial', emoji: '📈', value: '$184,200', institution: 'Vanguard', notes: 'Beneficiary designation on file. ROTH IRA also linked.', accessLevel: 'spouse', lastUpdated: 'Jan 15, 2025' },
  { id: '3', name: 'Bitcoin Wallet', category: 'crypto', emoji: '₿', value: '$31,000', institution: 'Self-custodied', notes: 'Seed phrase in fireproof safe. Hardware wallet in desk drawer.', accessLevel: 'executor', lastUpdated: 'Jan 20, 2025' },
  { id: '4', name: 'Ethereum', category: 'crypto', emoji: '◆', value: '$8,500', institution: 'Coinbase', notes: 'Account email and 2FA backup codes in vault.', accessLevel: 'executor', lastUpdated: 'Jan 20, 2025' },
  { id: '5', name: 'Gmail / Google', category: 'social', emoji: '✉️', value: undefined, institution: 'Google', notes: 'Inactive Account Manager set to notify Sarah after 3 months inactivity.', accessLevel: 'family', lastUpdated: 'Dec 10, 2024' },
  { id: '6', name: 'LinkedIn', category: 'social', emoji: '💼', value: undefined, institution: 'LinkedIn', notes: 'Memorialization requested. Profile to remain as tribute.', accessLevel: 'public', lastUpdated: 'Dec 10, 2024' },
  { id: '7', name: 'Netflix', category: 'subscription', emoji: '🎬', value: '$22.99/mo', institution: 'Netflix', notes: 'Cancel within 30 days. Payment on Visa ending 4221.', accessLevel: 'executor', lastUpdated: 'Feb 10, 2025' },
  { id: '8', name: 'Home (Primary)', category: 'property', emoji: '🏠', value: '$520,000', institution: 'Trust', notes: 'In living trust. Title with Sarah as joint tenant. Deed in safe deposit box.', accessLevel: 'spouse', lastUpdated: 'Jan 5, 2025' },
];

const CATEGORIES = ['All', 'Financial', 'Crypto', 'Social', 'Property', 'Subscription'];
const CAT_MAP: Record<string, Asset['category'][]> = {
  'All': ['financial', 'crypto', 'social', 'property', 'subscription'],
  'Financial': ['financial'],
  'Crypto': ['crypto'],
  'Social': ['social'],
  'Property': ['property'],
  'Subscription': ['subscription'],
};

const ACCESS_COLORS: Record<string, { bg: string; text: string }> = {
  executor: { bg: '#292524', text: '#D97706' },
  spouse: { bg: '#1C2128', text: '#60A5FA' },
  family: { bg: '#14210F', text: '#4ADE80' },
  public: { bg: '#1E1A1A', text: '#A1A1AA' },
};

export default function AssetsScreen() {
  const [filter, setFilter] = useState('All');

  const filtered = ASSETS.filter(a => CAT_MAP[filter].includes(a.category));
  const totalFinancial = ASSETS
    .filter(a => a.value && !a.value.includes('/mo'))
    .reduce((sum, a) => sum + parseFloat((a.value || '0').replace(/[$,]/g, '')), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Digital Assets</Text>
          <Text style={styles.subtitle}>Your legacy inventory</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Documented Value</Text>
          <Text style={styles.heroAmount}>${totalFinancial.toLocaleString()}</Text>
          <View style={styles.heroPills}>
            {[
              { label: `${ASSETS.filter(a => a.category === 'financial').length} Financial`, color: '#D97706' },
              { label: `${ASSETS.filter(a => a.category === 'crypto').length} Crypto`, color: '#F59E0B' },
              { label: `${ASSETS.filter(a => a.category === 'social').length} Social`, color: '#6B7280' },
            ].map(p => (
              <View key={p.label} style={[styles.heroPill, { borderColor: p.color }]}>
                <Text style={[styles.heroPillText, { color: p.color }]}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, filter === cat && styles.catPillActive]}
              onPress={() => setFilter(cat)}
            >
              <Text style={[styles.catText, filter === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.map(asset => {
          const ac = ACCESS_COLORS[asset.accessLevel];
          return (
            <View key={asset.id} style={styles.assetCard}>
              <View style={styles.assetTop}>
                <View style={styles.assetLeft}>
                  <Text style={styles.assetEmoji}>{asset.emoji}</Text>
                  <View>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    {asset.institution && <Text style={styles.assetInst}>{asset.institution}</Text>}
                  </View>
                </View>
                <View style={styles.assetRight}>
                  {asset.value && <Text style={styles.assetValue}>{asset.value}</Text>}
                  <View style={[styles.accessBadge, { backgroundColor: ac.bg }]}>
                    <Text style={[styles.accessText, { color: ac.text }]}>{asset.accessLevel}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.assetNotes}>{asset.notes}</Text>
              <Text style={styles.assetUpdated}>Updated {asset.lastUpdated}</Text>
            </View>
          );
        })}

        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Asset</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0A09' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#F5F5F4', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#78716C', marginTop: 2 },
  heroCard: { backgroundColor: '#1C1917', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#292524' },
  heroLabel: { fontSize: 12, color: '#78716C', marginBottom: 6 },
  heroAmount: { fontSize: 36, fontWeight: '900', color: '#D97706', marginBottom: 14 },
  heroPills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  heroPill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  heroPillText: { fontSize: 11, fontWeight: '700' },
  filterScroll: { marginBottom: 16 },
  catPill: { backgroundColor: '#1C1917', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: '#292524' },
  catPillActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
  catText: { color: '#78716C', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#0C0A09' },
  assetCard: { backgroundColor: '#1C1917', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#292524' },
  assetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  assetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  assetEmoji: { fontSize: 26 },
  assetName: { fontSize: 15, fontWeight: '700', color: '#F5F5F4', marginBottom: 2 },
  assetInst: { fontSize: 12, color: '#78716C' },
  assetRight: { alignItems: 'flex-end', gap: 6 },
  assetValue: { fontSize: 16, fontWeight: '800', color: '#D97706' },
  accessBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  accessText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  assetNotes: { fontSize: 13, color: '#A8A29E', lineHeight: 18, marginBottom: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#292524' },
  assetUpdated: { fontSize: 10, color: '#57534E' },
  addBtn: { backgroundColor: '#1C1917', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#D97706', borderStyle: 'dashed', marginTop: 4 },
  addBtnText: { color: '#D97706', fontWeight: '700', fontSize: 14 },
});
