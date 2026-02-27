import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuraStore, SkinCheckIn, SkinConcern } from '../../store/aura-store';

const TEAL = '#0D9488';
const LAVENDER = '#A78BFA';
const CORAL = '#F472B6';
const BG = '#F0FDFA';
const CARD = '#FFFFFF';
const TEXT = '#134E4A';
const TEXT2 = '#6B7280';
const GREEN = '#10B981';
const AMBER = '#F59E0B';

const CONCERN_ICONS: Record<SkinConcern, string> = {
  dryness: '💧', oiliness: '✨', acne: '🔴', redness: '🌹',
  pigmentation: '🟤', sensitivity: '🌸', aging: '🌿', texture: '🫧',
};

function CheckInCard({ checkIn, expanded, onToggle }: { checkIn: SkinCheckIn; expanded: boolean; onToggle: () => void }) {
  const scoreColor = checkIn.overallScore >= 80 ? GREEN : checkIn.overallScore >= 60 ? AMBER : CORAL;

  return (
    <TouchableOpacity style={s.checkInCard} onPress={onToggle} activeOpacity={0.8}>
      <View style={s.checkInTop}>
        <View style={s.checkInDate}>
          <Text style={s.checkInDateText}>{checkIn.date}</Text>
        </View>
        <View style={s.checkInMid}>
          <Text style={s.checkInSummary} numberOfLines={expanded ? undefined : 2}>{checkIn.aiSummary}</Text>
          {checkIn.concerns.length > 0 && (
            <View style={s.concernRow}>
              {checkIn.concerns.map(c => (
                <Text key={c} style={s.concernPill}>{CONCERN_ICONS[c]}</Text>
              ))}
            </View>
          )}
        </View>
        <View style={[s.checkInScore, { borderColor: scoreColor }]}>
          <Text style={[s.checkInScoreNum, { color: scoreColor }]}>{checkIn.overallScore}</Text>
        </View>
      </View>

      {expanded && (
        <View style={s.checkInDetail}>
          {/* Metrics */}
          <Text style={s.detailLabel}>Metrics</Text>
          {checkIn.metrics.map(metric => {
            const color = metric.score >= 80 ? GREEN : metric.score >= 60 ? AMBER : CORAL;
            const trendIcon = metric.trend === 'improving' ? '↑' : metric.trend === 'worsening' ? '↓' : '→';
            return (
              <View key={metric.label} style={s.metricRow}>
                <Text style={s.metricLabel}>{metric.label}</Text>
                <View style={s.metricBarWrap}>
                  <View style={[s.metricBarFill, { width: `${metric.score}%` as any, backgroundColor: color }]} />
                </View>
                <Text style={[s.metricNum, { color }]}>{metric.score}</Text>
                <Text style={[s.metricTrend, { color }]}>{trendIcon}</Text>
              </View>
            );
          })}

          {/* Lifestyle */}
          {checkIn.lifestyle && (
            <>
              <Text style={[s.detailLabel, { marginTop: 12 }]}>Lifestyle</Text>
              <View style={s.lifestyleRow}>
                <View style={s.lifestyleStat}>
                  <Text style={s.lifestyleIcon}>😴</Text>
                  <Text style={s.lifestyleVal}>{checkIn.lifestyle.sleep}h</Text>
                  <Text style={s.lifestyleLabel}>Sleep</Text>
                </View>
                <View style={s.lifestyleStat}>
                  <Text style={s.lifestyleIcon}>💧</Text>
                  <Text style={s.lifestyleVal}>{checkIn.lifestyle.hydration}</Text>
                  <Text style={s.lifestyleLabel}>Water</Text>
                </View>
                <View style={s.lifestyleStat}>
                  <Text style={s.lifestyleIcon}>😌</Text>
                  <Text style={s.lifestyleVal}>{['', 'Low', 'Low', 'Med', 'High', 'V.High'][checkIn.lifestyle.stress]}</Text>
                  <Text style={s.lifestyleLabel}>Stress</Text>
                </View>
              </View>
            </>
          )}

          {/* Recommendations */}
          {checkIn.recommendations.length > 0 && (
            <>
              <Text style={[s.detailLabel, { marginTop: 12 }]}>Recommendations</Text>
              {checkIn.recommendations.map((rec, i) => (
                <View key={i} style={s.recRow}>
                  <View style={s.recDot} />
                  <Text style={s.recText}>{rec}</Text>
                </View>
              ))}
            </>
          )}

          <View style={s.detailDisclaimer}>
            <Text style={s.detailDisclaimerText}>⚠️ Not medical advice — consult a dermatologist for skin concerns</Text>
          </View>
        </View>
      )}

      <View style={s.expandRow}>
        <Text style={s.expandText}>{expanded ? 'Less details' : 'More details'}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={TEXT2} />
      </View>
    </TouchableOpacity>
  );
}

export default function JournalScreen() {
  const { checkIns, streak } = useAuraStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const avgScore = checkIns.reduce((s, c, _, a) => s + c.overallScore / a.length, 0);
  const trend = checkIns.length >= 2 ? checkIns[0].overallScore - checkIns[1].overallScore : 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Skin Journal</Text>
        <Text style={s.headerSub}>{checkIns.length} check-ins tracked</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Summary stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: TEAL }]}>{checkIns.length}</Text>
            <Text style={s.statLabel}>Check-ins</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: avgScore >= 80 ? GREEN : AMBER }]}>
              {avgScore > 0 ? avgScore.toFixed(0) : '—'}
            </Text>
            <Text style={s.statLabel}>Avg Score</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: trend > 0 ? GREEN : trend < 0 ? CORAL : TEXT2 }]}>
              {trend > 0 ? `+${trend}` : trend === 0 ? '—' : trend}
            </Text>
            <Text style={s.statLabel}>Last Trend</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: TEAL }]}>🔥{streak}</Text>
            <Text style={s.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Score mini-chart */}
        <View style={s.chartCard}>
          <Text style={s.cardTitle}>Score History</Text>
          <View style={s.chart}>
            {[...checkIns].reverse().map((c, i) => {
              const heightPct = c.overallScore;
              const color = c.overallScore >= 80 ? GREEN : c.overallScore >= 60 ? AMBER : CORAL;
              return (
                <View key={c.id} style={s.chartBar}>
                  <Text style={s.chartVal}>{c.overallScore}</Text>
                  <View style={s.chartTrack}>
                    <View style={[s.chartFill, { height: `${heightPct}%` as any, backgroundColor: color }]} />
                  </View>
                  <Text style={s.chartDate}>{c.date.split(' ')[0]}</Text>
                </View>
              );
            })}
          </View>
          <View style={s.scoreLegend}>
            {[
              { color: GREEN, label: 'Great (80+)' },
              { color: AMBER, label: 'Fair (60-79)' },
              { color: CORAL, label: 'Needs care (<60)' },
            ].map(l => (
              <View key={l.label} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: l.color }]} />
                <Text style={s.legendLabel}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Check-in entries */}
        <Text style={s.sectionTitle}>Check-In History</Text>
        {checkIns.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📔</Text>
            <Text style={s.emptyTitle}>No check-ins yet</Text>
            <Text style={s.emptySub}>Start your first daily check-in to begin tracking your skin health.</Text>
          </View>
        ) : (
          checkIns.map(checkIn => (
            <CheckInCard
              key={checkIn.id}
              checkIn={checkIn}
              expanded={expandedId === checkIn.id}
              onToggle={() => setExpandedId(expandedId === checkIn.id ? null : checkIn.id)}
            />
          ))
        )}

        <View style={s.journalDisclaimer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={TEXT2} />
          <Text style={s.journalDisclaimerText}>Your skin data is stored securely and never shared. This app provides wellness tracking only — not medical diagnosis. Please consult a certified dermatologist for professional advice.</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: TEXT },
  headerSub: { fontSize: 12, color: TEXT2, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 16 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, color: TEXT2, marginTop: 2, textAlign: 'center' },

  chartCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 14 },
  chart: { flexDirection: 'row', height: 80, alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  chartBar: { flex: 1, alignItems: 'center', gap: 3 },
  chartVal: { fontSize: 10, color: TEXT2, fontWeight: '600', height: 13 },
  chartTrack: { flex: 1, width: '100%', backgroundColor: '#F3F4F6', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  chartFill: { width: '100%', borderRadius: 4 },
  chartDate: { fontSize: 9, color: TEXT2, fontWeight: '600', textAlign: 'center' },
  scoreLegend: { flexDirection: 'row', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: TEXT2 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 10 },

  checkInCard: { backgroundColor: CARD, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  checkInTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkInDate: { backgroundColor: `${TEAL}15`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center' },
  checkInDateText: { fontSize: 11, color: TEAL, fontWeight: '700' },
  checkInMid: { flex: 1 },
  checkInSummary: { fontSize: 12, color: TEXT2, lineHeight: 17 },
  concernRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  concernPill: { fontSize: 14 },
  checkInScore: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkInScoreNum: { fontSize: 14, fontWeight: '800' },

  expandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  expandText: { fontSize: 12, color: TEXT2 },

  checkInDetail: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  detailLabel: { fontSize: 12, fontWeight: '700', color: TEXT2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  metricLabel: { width: 72, fontSize: 12, color: TEXT, fontWeight: '600' },
  metricBarWrap: { flex: 1, height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden' },
  metricBarFill: { height: '100%', borderRadius: 2 },
  metricNum: { width: 24, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  metricTrend: { fontSize: 12, fontWeight: '700', width: 14 },

  lifestyleRow: { flexDirection: 'row', gap: 16 },
  lifestyleStat: { alignItems: 'center', gap: 2 },
  lifestyleIcon: { fontSize: 18 },
  lifestyleVal: { fontSize: 13, fontWeight: '700', color: TEAL },
  lifestyleLabel: { fontSize: 10, color: TEXT2 },

  recRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL, marginTop: 5 },
  recText: { flex: 1, fontSize: 12, color: '#374151', lineHeight: 17 },

  detailDisclaimer: { backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, marginTop: 10 },
  detailDisclaimerText: { fontSize: 11, color: '#92400E', textAlign: 'center' },

  empty: { alignItems: 'center', paddingVertical: 50 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: TEXT, marginBottom: 6 },
  emptySub: { fontSize: 13, color: TEXT2, textAlign: 'center', lineHeight: 18 },

  journalDisclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  journalDisclaimerText: { flex: 1, fontSize: 11, color: TEXT2, lineHeight: 17 },
});
