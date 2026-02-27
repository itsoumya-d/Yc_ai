import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TrendingUp, CheckCircle, AlertOctagon, Clock, Flame } from 'lucide-react-native';

export default function ProgressScreen() {
  const stats = [
    { label: 'Tasks Completed', value: 0, icon: CheckCircle, color: '#10b981' },
    { label: 'AI Analyses', value: 0, icon: TrendingUp, color: '#d97706' },
    { label: 'Errors Caught', value: 0, icon: AlertOctagon, color: '#ef4444' },
    { label: 'Hours Saved', value: 0, icon: Clock, color: '#6366f1' },
    { label: 'Day Streak', value: 0, icon: Flame, color: '#f97316' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your growth as a tradesperson</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <stat.icon size={22} color={stat.color} />
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.empty}>
        <TrendingUp size={48} color="#374151" />
        <Text style={styles.emptyTitle}>Start tracking progress</Text>
        <Text style={styles.emptyText}>Complete tasks and use AI Scan to see your stats grow here.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { paddingBottom: 32 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#111827' },
  title: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  subtitle: { marginTop: 4, fontSize: 13, color: '#9ca3af' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 20 },
  statCard: { width: '47%', backgroundColor: '#1e293b', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#9ca3af', textAlign: 'center' },
  empty: { alignItems: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyText: { fontSize: 13, color: '#4b5563', textAlign: 'center', lineHeight: 19 },
});
