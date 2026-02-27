import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ChevronRight, Calendar, Camera } from 'lucide-react-native';
import { getSkinChecks } from '@/lib/storage';
import type { SkinCheck, BodyArea } from '@/types/database';

const SEVERITY_COLORS = {
  stable: '#10b981',
  monitor: '#f59e0b',
  see_dermatologist: '#ef4444',
};

const BODY_AREAS: BodyArea[] = ['face', 'neck', 'chest', 'back', 'left_arm', 'right_arm', 'hands', 'scalp', 'other'];

export default function BodyMapScreen() {
  const router = useRouter();
  const [checks, setChecks] = useState<SkinCheck[]>([]);
  const [selectedArea, setSelectedArea] = useState<BodyArea | 'all'>('all');

  useEffect(() => {
    getSkinChecks().then(setChecks);
  }, []);

  const groupedByArea = BODY_AREAS.reduce<Record<string, SkinCheck[]>>((acc, area) => {
    acc[area] = checks.filter((c) => c.body_area === area);
    return acc;
  }, {});

  const filtered = selectedArea === 'all' ? checks : checks.filter((c) => c.body_area === selectedArea);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Body Map</Text>
        <Text style={styles.subtitle}>{checks.length} total checks</Text>
      </View>

      {/* Area selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaFilter}>
        <TouchableOpacity
          style={[styles.areaChip, selectedArea === 'all' && styles.areaChipActive]}
          onPress={() => setSelectedArea('all')}
        >
          <Text style={[styles.areaChipText, selectedArea === 'all' && styles.areaChipTextActive]}>All Areas</Text>
        </TouchableOpacity>
        {BODY_AREAS.map((area) => {
          const areaChecks = groupedByArea[area] ?? [];
          const hasUrgent = areaChecks.some((c) => c.analysis?.overall_severity === 'see_dermatologist');
          const hasMonitor = areaChecks.some((c) => c.analysis?.overall_severity === 'monitor');
          const dotColor = hasUrgent ? '#ef4444' : hasMonitor ? '#f59e0b' : areaChecks.length > 0 ? '#10b981' : '#e2e8f0';

          return (
            <TouchableOpacity
              key={area}
              style={[styles.areaChip, selectedArea === area && styles.areaChipActive]}
              onPress={() => setSelectedArea(area)}
            >
              <View style={[styles.areaDot, { backgroundColor: dotColor }]} />
              <Text style={[styles.areaChipText, selectedArea === area && styles.areaChipTextActive]}>
                {area.replace('_', ' ')}
              </Text>
              {areaChecks.length > 0 && (
                <Text style={[styles.areaCount, selectedArea === area && { color: '#ffffff80' }]}>{areaChecks.length}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Check list */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Camera size={40} color="#e2e8f0" />
          <Text style={styles.emptyTitle}>No checks in this area</Text>
          <TouchableOpacity onPress={() => router.push('/scan')} style={styles.addCheckBtn}>
            <Text style={styles.addCheckBtnText}>Add Check</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: check }) => (
            <TouchableOpacity
              style={styles.checkCard}
              onPress={() => router.push(`/check/${check.id}`)}
            >
              <View style={[styles.severityBar, { backgroundColor: check.analysis ? SEVERITY_COLORS[check.analysis.overall_severity] : '#e2e8f0' }]} />
              <View style={styles.checkInfo}>
                <Text style={styles.checkArea}>{check.body_area.replace('_', ' ')}</Text>
                <View style={styles.checkMeta}>
                  <Calendar size={12} color="#94a3b8" />
                  <Text style={styles.checkDate}>{new Date(check.created_at).toLocaleDateString()}</Text>
                </View>
                {check.analysis && (
                  <Text style={styles.checkSummary} numberOfLines={2}>{check.analysis.summary}</Text>
                )}
              </View>
              <View style={styles.checkRight}>
                {check.analysis && (
                  <Text style={[styles.checkSeverity, { color: SEVERITY_COLORS[check.analysis.overall_severity] }]}>
                    {check.analysis.conditions.length} finding{check.analysis.conditions.length !== 1 ? 's' : ''}
                  </Text>
                )}
                <ChevronRight size={16} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14, backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  areaFilter: { flexGrow: 0, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  areaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
  areaChipActive: { backgroundColor: '#e11d48' },
  areaDot: { width: 7, height: 7, borderRadius: 4 },
  areaChipText: { fontSize: 12, fontWeight: '600', color: '#64748b', textTransform: 'capitalize' },
  areaChipTextActive: { color: '#ffffff' },
  areaCount: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 15, color: '#94a3b8' },
  addCheckBtn: { backgroundColor: '#e11d48', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  addCheckBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  checkCard: { flexDirection: 'row', alignItems: 'stretch', backgroundColor: '#ffffff', borderRadius: 14, overflow: 'hidden' },
  severityBar: { width: 4 },
  checkInfo: { flex: 1, padding: 14, gap: 4 },
  checkArea: { fontSize: 14, fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' },
  checkMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkDate: { fontSize: 12, color: '#94a3b8' },
  checkSummary: { fontSize: 12, color: '#64748b', lineHeight: 17 },
  checkRight: { padding: 14, alignItems: 'flex-end', justifyContent: 'center', gap: 8 },
  checkSeverity: { fontSize: 11, fontWeight: '700' },
});
