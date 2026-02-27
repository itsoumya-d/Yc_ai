import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, BookOpen, TrendingUp, Zap, ChevronRight } from 'lucide-react-native';
import { ALL_GUIDES } from '@/lib/guides';

export default function HomeScreen() {
  const router = useRouter();
  const featuredGuides = ALL_GUIDES.filter((g) => g.tier_required === 'free').slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoMark}>
            <Zap size={20} color="#d97706" />
          </View>
          <Text style={styles.logo}>FieldLens</Text>
        </View>
        <Text style={styles.greeting}>Good morning, Tradesperson</Text>
        <Text style={styles.subtext}>AI-powered coaching for every job</Text>
      </View>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.primaryAction]} onPress={() => router.push('/scan')}>
          <Camera size={28} color="#111827" />
          <Text style={styles.primaryActionText}>AI Photo Check</Text>
          <Text style={styles.primaryActionSub}>Analyze your work instantly</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryAction} onPress={() => router.push('/guides')}>
          <BookOpen size={24} color="#d97706" />
          <Text style={styles.secondaryActionText}>Task Guides</Text>
          <Text style={styles.secondaryActionSub}>{ALL_GUIDES.length} guides</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Tasks Done', value: '0', color: '#d97706' },
          { label: 'Errors Caught', value: '0', color: '#ef4444' },
          { label: 'Day Streak', value: '0', color: '#10b981' },
        ].map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Featured guides */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Start a Task</Text>
          <TouchableOpacity onPress={() => router.push('/guides')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {featuredGuides.map((guide) => (
          <TouchableOpacity
            key={guide.id}
            style={styles.guideCard}
            onPress={() => router.push(`/guide/${guide.id}`)}
          >
            <View style={styles.guideCardLeft}>
              <Text style={styles.guideTitle}>{guide.title}</Text>
              <Text style={styles.guideMeta}>
                {guide.trade.charAt(0).toUpperCase() + guide.trade.slice(1)} • {guide.estimated_minutes} min • {guide.difficulty}
              </Text>
              <Text style={styles.guideSteps}>{guide.steps.length} steps</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Tip */}
      <View style={styles.tip}>
        <Zap size={16} color="#d97706" />
        <Text style={styles.tipText}>
          Tip: Use AI Scan after each step to catch errors early before they cause rework.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { paddingBottom: 32 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24, backgroundColor: '#111827' },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  logoMark: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#d97706', alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  greeting: { fontSize: 22, fontWeight: '700', color: '#ffffff' },
  subtext: { marginTop: 2, fontSize: 14, color: '#9ca3af' },
  quickActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 20 },
  primaryAction: { flex: 2, backgroundColor: '#d97706', borderRadius: 16, padding: 20 },
  primaryActionText: { marginTop: 8, fontSize: 16, fontWeight: '700', color: '#111827' },
  primaryActionSub: { marginTop: 2, fontSize: 12, color: '#92400e' },
  secondaryAction: { flex: 1, backgroundColor: '#1e293b', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 6 },
  secondaryActionText: { fontSize: 13, fontWeight: '700', color: '#ffffff', textAlign: 'center' },
  secondaryActionSub: { fontSize: 11, color: '#6b7280', textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#1e293b', borderRadius: 16, padding: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { marginTop: 2, fontSize: 11, color: '#9ca3af' },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  seeAll: { fontSize: 13, color: '#d97706' },
  guideCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 10 },
  guideCardLeft: { flex: 1 },
  guideTitle: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  guideMeta: { marginTop: 3, fontSize: 12, color: '#9ca3af' },
  guideSteps: { marginTop: 2, fontSize: 11, color: '#d97706' },
  tip: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 20, backgroundColor: '#1e293b', borderRadius: 12, padding: 14, alignItems: 'flex-start' },
  tipText: { flex: 1, fontSize: 13, color: '#9ca3af', lineHeight: 18 },
});
