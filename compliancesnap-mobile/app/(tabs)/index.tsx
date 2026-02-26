import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useInspectionStore, SeverityLevel } from '../../store/inspection-store';

const SAFETY_YELLOW = '#FFC107';
const ALERT_RED = '#FF3B30';
const CHARCOAL = '#2D3436';
const DARK_BG = '#1A1E1F';
const CARD_BG = '#242B2E';
const TEXT = '#ECEFF1';
const TEXT2 = '#90A4AE';
const ORANGE = '#FF9800';
const GREEN = '#4CAF50';

const SEVERITY_CONFIG: Record<SeverityLevel, { color: string; label: string; bg: string }> = {
  critical: { color: ALERT_RED, label: 'Critical', bg: '#FF3B3020' },
  high: { color: ORANGE, label: 'High', bg: '#FF980020' },
  medium: { color: SAFETY_YELLOW, label: 'Medium', bg: '#FFC10720' },
  low: { color: '#78909C', label: 'Low', bg: '#78909C20' },
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? GREEN : score >= 70 ? SAFETY_YELLOW : score >= 50 ? ORANGE : ALERT_RED;
  return (
    <View style={ring.wrap}>
      <View style={[ring.outer, { borderColor: color }]}>
        <View style={ring.inner}>
          <Text style={[ring.score, { color }]}>{score}</Text>
          <Text style={ring.label}>Score</Text>
        </View>
      </View>
    </View>
  );
}

const ring = StyleSheet.create({
  wrap: { alignItems: 'center' },
  outer: { width: 90, height: 90, borderRadius: 45, borderWidth: 5, alignItems: 'center', justifyContent: 'center' },
  inner: { alignItems: 'center' },
  score: { fontSize: 26, fontWeight: '800' },
  label: { fontSize: 11, color: TEXT2, fontWeight: '600' },
});

export default function DashboardScreen() {
  const { inspections } = useInspectionStore();
  const router = useRouter();

  const allViolations = inspections.flatMap(i => i.violations);
  const criticalCount = allViolations.filter(v => v.severity === 'critical' && !v.corrected).length;
  const highCount = allViolations.filter(v => v.severity === 'high' && !v.corrected).length;
  const totalOpen = allViolations.filter(v => !v.corrected).length;
  const totalCorrected = allViolations.filter(v => v.corrected).length;
  const avgScore = inspections.length > 0
    ? Math.round(inspections.reduce((s, i) => s + i.complianceScore, 0) / inspections.length)
    : 100;

  const recentInspections = inspections.slice(0, 3);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoIcon}><Ionicons name="shield-checkmark" size={20} color={CHARCOAL} /></View>
          <Text style={s.logoText}>ComplianceSnap</Text>
        </View>
        <TouchableOpacity style={s.newInspBtn} onPress={() => router.push('/(tabs)/scanner')}>
          <Ionicons name="add" size={18} color={CHARCOAL} />
          <Text style={s.newInspBtnText}>New Inspect</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Facility score hero */}
        <View style={s.heroCard}>
          <View style={s.heroLeft}>
            <Text style={s.heroTitle}>Overall Compliance</Text>
            <Text style={s.heroSub}>{inspections.length} facilities inspected</Text>
            <View style={s.heroStats}>
              <View>
                <Text style={[s.heroStatNum, { color: ALERT_RED }]}>{criticalCount}</Text>
                <Text style={s.heroStatLabel}>Critical</Text>
              </View>
              <View style={s.heroDivider} />
              <View>
                <Text style={[s.heroStatNum, { color: ORANGE }]}>{highCount}</Text>
                <Text style={s.heroStatLabel}>High</Text>
              </View>
              <View style={s.heroDivider} />
              <View>
                <Text style={[s.heroStatNum, { color: GREEN }]}>{totalCorrected}</Text>
                <Text style={s.heroStatLabel}>Corrected</Text>
              </View>
            </View>
          </View>
          <ScoreRing score={avgScore} />
        </View>

        {/* Critical alert */}
        {criticalCount > 0 && (
          <TouchableOpacity style={s.criticalAlert} onPress={() => router.push('/(tabs)/inspections')}>
            <View style={s.criticalAlertLeft}>
              <Ionicons name="warning" size={20} color={ALERT_RED} />
              <View>
                <Text style={s.criticalAlertTitle}>⚠️ {criticalCount} Critical Violation{criticalCount > 1 ? 's' : ''}</Text>
                <Text style={s.criticalAlertSub}>Requires immediate action</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={ALERT_RED} />
          </TouchableOpacity>
        )}

        {/* Severity breakdown */}
        <View style={s.severityCard}>
          <Text style={s.cardTitle}>Open Violations by Severity</Text>
          {(['critical', 'high', 'medium', 'low'] as SeverityLevel[]).map(sev => {
            const count = allViolations.filter(v => v.severity === sev && !v.corrected).length;
            const cfg = SEVERITY_CONFIG[sev];
            const pct = totalOpen > 0 ? (count / totalOpen) * 100 : 0;
            return (
              <View key={sev} style={s.sevRow}>
                <View style={[s.sevDot, { backgroundColor: cfg.color }]} />
                <Text style={s.sevLabel}>{cfg.label}</Text>
                <View style={s.sevBarWrap}>
                  <View style={[s.sevBar, { width: `${pct}%` as any, backgroundColor: cfg.color }]} />
                </View>
                <Text style={[s.sevCount, { color: cfg.color }]}>{count}</Text>
              </View>
            );
          })}
        </View>

        {/* Recent inspections */}
        <Text style={s.sectionTitle}>Recent Inspections</Text>
        {recentInspections.map(insp => {
          const open = insp.violations.filter(v => !v.corrected).length;
          const scoreColor = insp.complianceScore >= 90 ? GREEN : insp.complianceScore >= 70 ? SAFETY_YELLOW : ALERT_RED;
          return (
            <TouchableOpacity key={insp.id} style={s.inspCard}>
              <View style={s.inspLeft}>
                <Text style={s.inspName}>{insp.facilityName}</Text>
                <Text style={s.inspDate}>{insp.date} · {open} open violation{open !== 1 ? 's' : ''}</Text>
              </View>
              <View style={[s.inspScore, { backgroundColor: `${scoreColor}20` }]}>
                <Text style={[s.inspScoreNum, { color: scoreColor }]}>{insp.complianceScore}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Quick stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Ionicons name="time-outline" size={20} color={SAFETY_YELLOW} />
            <Text style={s.statNum}>{totalOpen}</Text>
            <Text style={s.statLabel}>Open</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color={GREEN} />
            <Text style={[s.statNum, { color: GREEN }]}>{totalCorrected}</Text>
            <Text style={s.statLabel}>Corrected</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="business-outline" size={20} color={TEXT2} />
            <Text style={s.statNum}>{inspections.length}</Text>
            <Text style={s.statLabel}>Facilities</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK_BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#1E272E', borderBottomWidth: 1, borderBottomColor: CHARCOAL },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: SAFETY_YELLOW, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 18, fontWeight: '800', color: TEXT },
  newInspBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: SAFETY_YELLOW, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  newInspBtnText: { fontSize: 13, fontWeight: '700', color: CHARCOAL },

  scroll: { flex: 1 },
  content: { padding: 16 },

  heroCard: { backgroundColor: CARD_BG, borderRadius: 18, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  heroLeft: { flex: 1 },
  heroTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 4 },
  heroSub: { fontSize: 13, color: TEXT2, marginBottom: 16 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroStatNum: { fontSize: 22, fontWeight: '800' },
  heroStatLabel: { fontSize: 11, color: TEXT2, marginTop: 2 },
  heroDivider: { width: 1, height: 32, backgroundColor: CHARCOAL },

  criticalAlert: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: `${ALERT_RED}15`, borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: `${ALERT_RED}40` },
  criticalAlertLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  criticalAlertTitle: { fontSize: 14, fontWeight: '700', color: ALERT_RED },
  criticalAlertSub: { fontSize: 12, color: `${ALERT_RED}CC`, marginTop: 2 },

  severityCard: { backgroundColor: CARD_BG, borderRadius: 14, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 14 },
  sevRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sevDot: { width: 10, height: 10, borderRadius: 5 },
  sevLabel: { width: 56, fontSize: 13, color: TEXT2, fontWeight: '600' },
  sevBarWrap: { flex: 1, height: 6, backgroundColor: '#374151', borderRadius: 3, overflow: 'hidden' },
  sevBar: { height: '100%', borderRadius: 3 },
  sevCount: { width: 24, fontSize: 13, fontWeight: '800', textAlign: 'right' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 10 },
  inspCard: { backgroundColor: CARD_BG, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  inspLeft: { flex: 1 },
  inspName: { fontSize: 14, fontWeight: '700', color: TEXT },
  inspDate: { fontSize: 12, color: TEXT2, marginTop: 2 },
  inspScore: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  inspScoreNum: { fontSize: 16, fontWeight: '800' },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  statCard: { flex: 1, backgroundColor: CARD_BG, borderRadius: 12, padding: 14, alignItems: 'center', gap: 6 },
  statNum: { fontSize: 22, fontWeight: '800', color: TEXT },
  statLabel: { fontSize: 11, color: TEXT2, fontWeight: '600' },
});
