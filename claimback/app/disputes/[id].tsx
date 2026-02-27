import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getDisputeById } from '../../lib/actions/disputes';
import { Badge } from '../../components/ui/Badge';
import type { Dispute } from '../../types';

const STATUS_TIMELINE = ['draft', 'submitted', 'in_review', 'won', 'lost'];

export default function DisputeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDisputeById(id)
      .then(setDispute)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><ActivityIndicator size="large" color="#16a34a" /></View>
      </SafeAreaView>
    );
  }

  if (!dispute) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><Text style={styles.errorText}>Dispute not found.</Text></View>
      </SafeAreaView>
    );
  }

  const currentStep = STATUS_TIMELINE.indexOf(dispute.status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Provider</Text>
            <Text style={styles.summaryValue}>{dispute.provider_name || 'Unknown'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Disputed</Text>
            <Text style={[styles.summaryValue, styles.greenText]}>${dispute.amount_disputed?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status</Text>
            <Badge label={dispute.status.replace('_', ' ').toUpperCase()} variant={
              dispute.status === 'won' ? 'success' :
              dispute.status === 'lost' ? 'danger' :
              dispute.status === 'in_review' ? 'warning' : 'neutral'
            } />
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Created</Text>
            <Text style={styles.summaryValue}>{new Date(dispute.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {STATUS_TIMELINE.slice(0, 4).map((step, i) => {
            const isDone = i <= currentStep;
            const isCurrent = i === currentStep;
            return (
              <View key={step} style={styles.timelineItem}>
                <View style={[styles.timelineDot, isDone && styles.timelineDotDone, isCurrent && styles.timelineDotCurrent]} />
                {i < STATUS_TIMELINE.length - 2 && (
                  <View style={[styles.timelineLine, isDone && styles.timelineLineDone]} />
                )}
                <Text style={[styles.timelineLabel, isDone && styles.timelineLabelDone]}>
                  {step.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                </Text>
              </View>
            );
          })}
        </View>

        {dispute.dispute_letter && (
          <View style={styles.letterSection}>
            <Text style={styles.sectionTitle}>Dispute Letter</Text>
            <View style={styles.letterCard}>
              <Text style={styles.letterText}>{dispute.dispute_letter}</Text>
            </View>
          </View>
        )}

        {dispute.outcome_notes && (
          <View style={styles.outcomeSection}>
            <Text style={styles.sectionTitle}>Outcome</Text>
            <View style={styles.outcomeCard}>
              <Text style={styles.outcomeText}>{dispute.outcome_notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#64748b' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#16a34a',
  },
  backBtn: { padding: 4, width: 40 },
  backBtnText: { fontSize: 22, color: '#ffffff' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  content: { flex: 1, padding: 16 },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  summaryLabel: { fontSize: 13, color: '#64748b' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  greenText: { color: '#16a34a' },
  timelineSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e2e8f0',
    marginRight: 10,
    marginTop: 2,
  },
  timelineDotDone: { backgroundColor: '#16a34a' },
  timelineDotCurrent: { borderWidth: 2, borderColor: '#16a34a', backgroundColor: '#ffffff' },
  timelineLine: { position: 'absolute', left: 6, top: 14, width: 2, height: 20, backgroundColor: '#e2e8f0' },
  timelineLineDone: { backgroundColor: '#16a34a' },
  timelineLabel: { fontSize: 14, color: '#94a3b8' },
  timelineLabelDone: { color: '#1e293b', fontWeight: '500' },
  letterSection: { marginBottom: 16 },
  letterCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderLeftWidth: 3, borderLeftColor: '#16a34a' },
  letterText: { fontSize: 13, color: '#374151', lineHeight: 22 },
  outcomeSection: { marginBottom: 32 },
  outcomeCard: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#bbf7d0' },
  outcomeText: { fontSize: 14, color: '#166534', lineHeight: 22 },
});
