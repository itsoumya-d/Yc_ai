import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Search, BookOpen, Clock, ChevronRight, Lock } from 'lucide-react-native';
import { ALL_GUIDES } from '@/lib/guides';

const TRADES = ['all', 'plumbing', 'electrical', 'hvac'];
const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];

export default function GuidesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const filtered = useMemo(() =>
    ALL_GUIDES.filter((g) => {
      const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.trade.includes(search.toLowerCase());
      const matchTrade = selectedTrade === 'all' || g.trade === selectedTrade;
      const matchDiff = selectedDifficulty === 'all' || g.difficulty === selectedDifficulty;
      return matchSearch && matchTrade && matchDiff;
    }),
    [search, selectedTrade, selectedDifficulty],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Task Guides</Text>
        <Text style={styles.subtitle}>{ALL_GUIDES.length} guides available</Text>
        <View style={styles.searchRow}>
          <Search size={16} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search guides..."
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {TRADES.map((trade) => (
            <TouchableOpacity
              key={trade}
              onPress={() => setSelectedTrade(trade)}
              style={[styles.filterChip, selectedTrade === trade && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, selectedTrade === trade && styles.filterChipTextActive]}>
                {trade.charAt(0).toUpperCase() + trade.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <BookOpen size={40} color="#374151" />
            <Text style={styles.emptyText}>No guides found</Text>
          </View>
        ) : (
          filtered.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={styles.card}
              onPress={() => router.push(`/guide/${guide.id}`)}
            >
              <View style={styles.cardMain}>
                <View style={styles.cardLeft}>
                  <View style={styles.tradeTag}>
                    <Text style={styles.tradeTagText}>{guide.trade}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{guide.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{guide.description}</Text>
                  <View style={styles.cardMeta}>
                    <Clock size={12} color="#6b7280" />
                    <Text style={styles.cardMetaText}>{guide.estimated_minutes} min</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.cardMetaText}>{guide.steps.length} steps</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={[styles.cardMetaText, guide.difficulty === 'advanced' && { color: '#ef4444' }, guide.difficulty === 'intermediate' && { color: '#f59e0b' }]}>
                      {guide.difficulty}
                    </Text>
                  </View>
                </View>
                {guide.tier_required !== 'free' ? (
                  <Lock size={20} color="#6b7280" />
                ) : (
                  <ChevronRight size={20} color="#6b7280" />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#111827' },
  title: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2, marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 12, height: 42 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 14 },
  filterRow: { marginTop: 10, marginBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1e293b', marginRight: 8 },
  filterChipActive: { backgroundColor: '#d97706' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  filterChipTextActive: { color: '#111827' },
  list: { padding: 20, gap: 12, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#6b7280' },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16 },
  cardMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardLeft: { flex: 1 },
  tradeTag: { alignSelf: 'flex-start', backgroundColor: '#d97706/20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
  tradeTagText: { fontSize: 10, fontWeight: '700', color: '#d97706', textTransform: 'uppercase' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  cardDesc: { marginTop: 4, fontSize: 12, color: '#9ca3af', lineHeight: 17 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  cardMetaText: { fontSize: 11, color: '#6b7280' },
  dot: { fontSize: 11, color: '#374151' },
});
