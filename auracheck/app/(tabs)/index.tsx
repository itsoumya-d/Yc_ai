import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Camera, TrendingUp, AlertCircle, CheckCircle, ChevronRight, Sparkles } from 'lucide-react-native';
import { getSkinChecks } from '@/lib/storage';
import type { SkinCheck } from '@/types/database';

const SEVERITY_COLORS = {
  stable: '#10b981',
  monitor: '#f59e0b',
  see_dermatologist: '#ef4444',
};

export default function HomeScreen() {
  const router = useRouter();
  const [recentChecks, setRecentChecks] = useState<SkinCheck[]>([]);

  useEffect(() => {
    getSkinChecks().then((checks) => setRecentChecks(checks.slice(0, 5)));
  }, []);

  const stableCount = recentChecks.filter((c) => c.analysis?.overall_severity === 'stable').length;
  const monitorCount = recentChecks.filter((c) => c.analysis?.overall_severity === 'monitor').length;
  const urgentCount = recentChecks.filter((c) => c.analysis?.overall_severity === 'see_dermatologist').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.title}>Your Skin Dashboard</Text>
        </View>
        <View style={styles.streakBadge}>
          <Sparkles size={14} color="#e11d48" />
          <Text style={styles.streakText}>0 day streak</Text>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.scanCTA} onPress={() => router.push('/scan')}>
        <View style={styles.scanCTALeft}>
          <Camera size={28} color="#ffffff" />
          <View>
            <Text style={styles.scanCTATitle}>Start Skin Check</Text>
            <Text style={styles.scanCTASub}>AI-powered analysis in seconds</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#ffffff" />
      </TouchableOpacity>

      {/* Stats */}
      {recentChecks.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <CheckCircle size={18} color="#10b981" />
            <Text style={[styles.statValue, { color: '#10b981' }]}>{stableCount}</Text>
            <Text style={styles.statLabel}>Stable</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <AlertCircle size={18} color="#f59e0b" />
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>{monitorCount}</Text>
            <Text style={styles.statLabel}>Monitor</Text>
          </View>
          <View style={styles.stat}>
            <AlertCircle size={18} color="#ef4444" />
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{urgentCount}</Text>
            <Text style={styles.statLabel}>See Derm</Text>
          </View>
        </View>
      )}

      {/* Recent checks */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Checks</Text>
          <TouchableOpacity onPress={() => router.push('/body-map')}>
            <Text style={styles.seeAll}>Body Map</Text>
          </TouchableOpacity>
        </View>

        {recentChecks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Camera size={32} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>No checks yet</Text>
            <Text style={styles.emptyText}>Start your first skin check to begin tracking your skin health.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/scan')}>
              <Text style={styles.emptyBtnText}>Start First Check</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentChecks.map((check) => (
            <TouchableOpacity
              key={check.id}
              style={styles.checkCard}
              onPress={() => router.push(`/check/${check.id}`)}
            >
              <View style={[styles.severityDot, { backgroundColor: check.analysis ? SEVERITY_COLORS[check.analysis.overall_severity] : '#cbd5e1' }]} />
              <View style={styles.checkInfo}>
                <Text style={styles.checkArea}>{check.body_area.replace('_', ' ')}</Text>
                <Text style={styles.checkDate}>{new Date(check.created_at).toLocaleDateString()}</Text>
              </View>
              {check.analysis && (
                <Text style={[styles.severityLabel, { color: SEVERITY_COLORS[check.analysis.overall_severity] }]}>
                  {check.analysis.overall_severity === 'see_dermatologist' ? 'See Derm' : check.analysis.overall_severity.charAt(0).toUpperCase() + check.analysis.overall_severity.slice(1)}
                </Text>
              )}
              <ChevronRight size={16} color="#94a3b8" />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Health tip */}
      <View style={styles.tip}>
        <TrendingUp size={16} color="#e11d48" />
        <Text style={styles.tipText}>
          Regular monitoring helps detect changes early. Aim for weekly checks of any areas of concern.
        </Text>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        AuraCheck is not a medical device and does not provide diagnoses. Always consult a dermatologist for medical advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#ffffff' },
  greeting: { fontSize: 13, color: '#94a3b8' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff1f2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  streakText: { fontSize: 12, fontWeight: '600', color: '#e11d48' },
  scanCTA: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e11d48', borderRadius: 20, padding: 20, marginHorizontal: 20, marginTop: 16 },
  scanCTALeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scanCTATitle: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  scanCTASub: { fontSize: 12, color: '#fda4af', marginTop: 2 },
  statsRow: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 16, marginHorizontal: 20, marginTop: 16, padding: 16 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f1f5f9' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#94a3b8' },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  seeAll: { fontSize: 13, color: '#e11d48' },
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  emptyText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 19 },
  emptyBtn: { backgroundColor: '#e11d48', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, marginTop: 4 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  checkCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 8 },
  severityDot: { width: 10, height: 10, borderRadius: 5 },
  checkInfo: { flex: 1 },
  checkArea: { fontSize: 14, fontWeight: '600', color: '#0f172a', textTransform: 'capitalize' },
  checkDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  severityLabel: { fontSize: 12, fontWeight: '600' },
  tip: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 20, backgroundColor: '#fff1f2', borderRadius: 14, padding: 14, alignItems: 'flex-start' },
  tipText: { flex: 1, fontSize: 13, color: '#9f1239', lineHeight: 18 },
  disclaimer: { marginHorizontal: 20, marginTop: 16, fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 16 },
});
