import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { getSkinChecks } from '@/lib/storage';
import type { SkinCheck } from '@/types/database';

const SEVERITY_COLORS = {
  stable: '#10b981',
  monitor: '#f59e0b',
  see_dermatologist: '#ef4444',
};

const SEVERITY_LABELS = {
  stable: 'Stable',
  monitor: 'Monitor',
  see_dermatologist: 'See Dermatologist',
};

export default function CheckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [check, setCheck] = useState<SkinCheck | null>(null);
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);

  useEffect(() => {
    getSkinChecks().then((checks) => {
      setCheck(checks.find((c) => c.id === id) ?? null);
    });
  }, [id]);

  if (!check) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Check not found</Text>
        </View>
      </View>
    );
  }

  const analysis = check.analysis;
  const severityColor = analysis ? SEVERITY_COLORS[analysis.overall_severity] : '#94a3b8';
  const SeverityIcon = analysis?.overall_severity === 'stable' ? CheckCircle : AlertCircle;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check Details</Text>
      </View>

      {check.image_uri && (
        <Image source={{ uri: check.image_uri }} style={styles.image} />
      )}

      {/* Meta */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Area</Text>
          <Text style={styles.metaValue}>{check.body_area.replace('_', ' ')}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Calendar size={14} color="#94a3b8" />
          <Text style={styles.metaValue}>{new Date(check.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      {analysis ? (
        <>
          {/* Severity */}
          <View style={[styles.severityCard, { borderColor: severityColor + '40', backgroundColor: severityColor + '10' }]}>
            <SeverityIcon size={22} color={severityColor} />
            <View>
              <Text style={[styles.severityLabel, { color: severityColor }]}>{SEVERITY_LABELS[analysis.overall_severity]}</Text>
              <Text style={styles.severitySub}>{analysis.conditions.length} condition{analysis.conditions.length !== 1 ? 's' : ''} noted</Text>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{analysis.summary}</Text>
          </View>

          {/* Conditions */}
          {analysis.conditions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Findings</Text>
              {analysis.conditions.map((c) => {
                const isExpanded = expandedCondition === c.id;
                const color = SEVERITY_COLORS[c.severity];
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.conditionCard, { borderLeftColor: color }]}
                    onPress={() => setExpandedCondition(isExpanded ? null : c.id)}
                  >
                    <View style={styles.conditionHeader}>
                      <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.badgeText, { color }]}>{SEVERITY_LABELS[c.severity]}</Text>
                      </View>
                      <Text style={styles.conditionName} numberOfLines={isExpanded ? undefined : 1}>{c.name}</Text>
                      {isExpanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
                    </View>
                    {isExpanded && (
                      <View style={styles.conditionBody}>
                        <Text style={styles.conditionDesc}>{c.description}</Text>
                        {c.abcde && Object.keys(c.abcde).length > 0 && (
                          <View style={styles.abcde}>
                            <Text style={styles.abcdeTitle}>ABCDE Assessment</Text>
                            {Object.entries(c.abcde).map(([key, val]) => val ? (
                              <View key={key} style={styles.abcdeRow}>
                                <Text style={styles.abcdeKey}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                                <Text style={styles.abcdeVal}>{val}</Text>
                              </View>
                            ) : null)}
                          </View>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Positives */}
          {analysis.positive_observations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Positive Signs</Text>
              {analysis.positive_observations.map((obs, i) => (
                <View key={i} style={styles.positive}>
                  <CheckCircle size={14} color="#10b981" />
                  <Text style={styles.positiveText}>{obs}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Urgent notice */}
          {analysis.overall_severity === 'see_dermatologist' && (
            <View style={styles.urgentNotice}>
              <AlertCircle size={18} color="#ef4444" />
              <Text style={styles.urgentText}>
                This check suggests scheduling an appointment with a licensed dermatologist for proper evaluation.
              </Text>
            </View>
          )}
        </>
      ) : (
        <Text style={styles.noAnalysis}>Analysis not available for this check.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#ffffff' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  metaRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, gap: 16 },
  metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaLabel: { fontSize: 12, color: '#94a3b8' },
  metaValue: { fontSize: 14, fontWeight: '600', color: '#0f172a', textTransform: 'capitalize' },
  metaDivider: { width: 1, height: 24, backgroundColor: '#f1f5f9' },
  severityCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, borderWidth: 1, marginHorizontal: 16, marginTop: 12, padding: 16 },
  severityLabel: { fontSize: 16, fontWeight: '700' },
  severitySub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  summaryCard: { backgroundColor: '#ffffff', borderRadius: 14, marginHorizontal: 16, marginTop: 12, padding: 16 },
  summaryText: { fontSize: 14, color: '#334155', lineHeight: 21 },
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  conditionCard: { backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 8, borderLeftWidth: 3, overflow: 'hidden' },
  conditionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  conditionName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#0f172a' },
  conditionBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 10, borderTopWidth: 1, borderTopColor: '#f8fafc' },
  conditionDesc: { fontSize: 13, color: '#475569', lineHeight: 19 },
  abcde: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, gap: 5 },
  abcdeTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 4 },
  abcdeRow: { flexDirection: 'row', gap: 8 },
  abcdeKey: { fontSize: 12, fontWeight: '700', color: '#334155', width: 70 },
  abcdeVal: { flex: 1, fontSize: 12, color: '#64748b' },
  positive: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  positiveText: { flex: 1, fontSize: 13, color: '#166534', lineHeight: 18 },
  urgentNotice: { flexDirection: 'row', gap: 12, backgroundColor: '#fee2e2', borderRadius: 14, marginHorizontal: 16, marginTop: 16, padding: 16, alignItems: 'flex-start' },
  urgentText: { flex: 1, fontSize: 13, color: '#991b1b', lineHeight: 19 },
  noAnalysis: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 40 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: '#94a3b8' },
});
