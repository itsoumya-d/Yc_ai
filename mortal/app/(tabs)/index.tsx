import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { WishCategory } from '../../components/wishes/WishCategory';
import { getWishes } from '../../lib/actions/wishes';
import type { WishesData } from '../../types';

const CATEGORIES = [
  { key: 'funeral', label: 'Funeral & Burial', icon: '🕊️', completionKey: 'funeral_completion' as const },
  { key: 'organ_donation', label: 'Organ Donation', icon: '❤️', completionKey: 'organ_completion' as const },
  { key: 'care_directives', label: 'Care Directives', icon: '📋', completionKey: 'care_completion' as const },
  { key: 'messages', label: 'Personal Messages', icon: '✉️', completionKey: 'messages_completion' as const },
];

export default function WishesScreen() {
  const [wishes, setWishes] = useState<WishesData | null>(null);
  const [overallCompletion, setOverallCompletion] = useState(0);

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const data = await getWishes();
        setWishes(data);
        if (data) {
          const completions = [
            data.funeral_completion ?? 0,
            data.organ_completion ?? 0,
            data.care_completion ?? 0,
            data.messages_completion ?? 0,
          ];
          setOverallCompletion(Math.round(completions.reduce((a, b) => a + b, 0) / 4));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchWishes();
  }, []);

  const getCompletion = (key: 'funeral_completion' | 'organ_completion' | 'care_completion' | 'messages_completion') => {
    if (!wishes) return 0;
    return wishes[key] ?? 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wishes</Text>
        <Text style={styles.subtitle}>Document what matters most</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.completionSection}>
          <View style={styles.completionWheel}>
            <Text style={styles.completionPercent}>{overallCompletion}%</Text>
            <Text style={styles.completionLabel}>Complete</Text>
          </View>
          <View style={styles.completionBar}>
            <View style={[styles.completionFill, { width: `${overallCompletion}%` as any }]} />
          </View>
          <Text style={styles.completionText}>
            {overallCompletion < 50
              ? 'Keep going — your loved ones will thank you'
              : overallCompletion < 100
              ? 'Great progress! Almost there'
              : 'Your wishes are fully documented'}
          </Text>
        </View>

        <View style={styles.categoriesSection}>
          {CATEGORIES.map((cat) => (
            <WishCategory
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              completion={getCompletion(cat.completionKey)}
              onPress={() => router.push('/wishes/conversation')}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.guideBtn}
          onPress={() => router.push('/wishes/conversation')}
        >
          <Text style={styles.guideBtnIcon}>✨</Text>
          <View style={styles.guideBtnText}>
            <Text style={styles.guideBtnTitle}>Continue with AI Guide</Text>
            <Text style={styles.guideBtnSub}>Answer a few gentle questions</Text>
          </View>
          <Text style={styles.guideBtnArrow}>›</Text>
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
  subtitle: { fontSize: 14, color: '#a78bfa', marginTop: 2 },
  content: { flex: 1 },
  completionSection: { padding: 20, alignItems: 'center' },
  completionWheel: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2d1b4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#7c3aed',
  },
  completionPercent: { fontSize: 26, fontWeight: '800', color: '#ffffff' },
  completionLabel: { fontSize: 11, color: '#a78bfa' },
  completionBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#2d1b4e',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 3,
  },
  completionText: { fontSize: 13, color: '#a78bfa', textAlign: 'center' },
  categoriesSection: { padding: 16, gap: 12 },
  guideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    margin: 16,
    borderRadius: 16,
    padding: 18,
    marginBottom: 32,
  },
  guideBtnIcon: { fontSize: 24, marginRight: 14 },
  guideBtnText: { flex: 1 },
  guideBtnTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  guideBtnSub: { fontSize: 13, color: '#ddd6fe', marginTop: 2 },
  guideBtnArrow: { fontSize: 24, color: '#ddd6fe' },
});
