import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuraStore, SkinConcern } from '../../store/aura-store';

const TEAL = '#0D9488';
const LAVENDER = '#A78BFA';
const CORAL = '#F472B6';
const BG = '#F0FDFA';
const CARD = '#FFFFFF';
const TEXT = '#134E4A';
const TEXT2 = '#6B7280';
const GREEN = '#10B981';
const AMBER = '#F59E0B';
const RED = '#EF4444';

const CONCERN_LABELS: Record<SkinConcern, { label: string; icon: string; color: string }> = {
  dryness: { label: 'Dryness', icon: '💧', color: TEAL },
  oiliness: { label: 'Oiliness', icon: '✨', color: AMBER },
  acne: { label: 'Acne', icon: '🔴', color: CORAL },
  redness: { label: 'Redness', icon: '🌹', color: '#F87171' },
  pigmentation: { label: 'Pigmentation', icon: '🟤', color: '#92400E' },
  sensitivity: { label: 'Sensitivity', icon: '🌸', color: LAVENDER },
  aging: { label: 'Aging', icon: '🌿', color: GREEN },
  texture: { label: 'Texture', icon: '🫧', color: '#67E8F9' },
};

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const color = score >= 80 ? GREEN : score >= 60 ? AMBER : CORAL;
  const label = score >= 80 ? 'Great' : score >= 60 ? 'Fair' : 'Needs care';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 4, borderColor: color, alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}10` }}>
      <Text style={{ fontSize: size * 0.28, fontWeight: '800', color }}>{score}</Text>
      <Text style={{ fontSize: size * 0.13, color: TEXT2 }}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { checkIns, streak, products, skinType, concerns } = useAuraStore();
  const router = useRouter();

  const latest = checkIns[0];
  const previous = checkIns[1];
  const scoreDiff = latest && previous ? latest.overallScore - previous.overallScore : 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.logoText}>✨ AuraCheck</Text>
          <Text style={s.logoSub}>Your personal skin wellness journal</Text>
        </View>
        <View style={s.streakBadge}>
          <Text style={s.streakFire}>🌿</Text>
          <Text style={s.streakNum}>{streak}</Text>
          <Text style={s.streakLabel}>day streak</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={TEXT2} />
          <Text style={s.disclaimerText}>This is not medical advice. Always consult a dermatologist for skin concerns.</Text>
        </View>

        {/* Score hero */}
        {latest && (
          <View style={s.scoreHero}>
            <View style={s.scoreLeft}>
              <Text style={s.scoreTitle}>Today's Skin Score</Text>
              <Text style={s.scoreDate}>{latest.date}</Text>
              {scoreDiff !== 0 && (
                <View style={[s.scoreDiff, { backgroundColor: scoreDiff > 0 ? `${GREEN}20` : `${CORAL}20` }]}>
                  <Ionicons name={scoreDiff > 0 ? 'trending-up' : 'trending-down'} size={14} color={scoreDiff > 0 ? GREEN : CORAL} />
                  <Text style={[s.scoreDiffText, { color: scoreDiff > 0 ? GREEN : CORAL }]}>
                    {scoreDiff > 0 ? '+' : ''}{scoreDiff} from last check-in
                  </Text>
                </View>
              )}
              <Text style={s.skinTypeLabel}>Skin type: {skinType}</Text>
            </View>
            <ScoreRing score={latest.overallScore} size={90} />
          </View>
        )}

        {/* Check-in CTA */}
        <TouchableOpacity style={s.checkinBtn} onPress={() => router.push('/(tabs)/checkin')}>
          <View style={s.checkinBtnIcon}>
            <Ionicons name="camera" size={24} color="#fff" />
          </View>
          <View style={s.checkinBtnText}>
            <Text style={s.checkinBtnTitle}>Daily Skin Check-In</Text>
            <Text style={s.checkinBtnSub}>Take a photo for AI analysis</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Metrics */}
        {latest && (
          <View style={s.metricsCard}>
            <Text style={s.cardTitle}>Skin Metrics</Text>
            {latest.metrics.map(metric => {
              const scoreColor = metric.score >= 80 ? GREEN : metric.score >= 60 ? AMBER : CORAL;
              const trendIcon = metric.trend === 'improving' ? 'arrow-up' : metric.trend === 'worsening' ? 'arrow-down' : 'remove';
              const trendColor = metric.trend === 'improving' ? GREEN : metric.trend === 'worsening' ? CORAL : TEXT2;
              return (
                <View key={metric.label} style={s.metricRow}>
                  <View style={s.metricLeft}>
                    <Text style={s.metricLabel}>{metric.label}</Text>
                    <Text style={s.metricNote}>{metric.note}</Text>
                  </View>
                  <View style={s.metricRight}>
                    <View style={s.metricBar}>
                      <View style={[s.metricBarFill, { width: `${metric.score}%` as any, backgroundColor: scoreColor }]} />
                    </View>
                    <View style={s.metricNumRow}>
                      <Text style={[s.metricNum, { color: scoreColor }]}>{metric.score}</Text>
                      <Ionicons name={trendIcon as any} size={12} color={trendColor} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* AI Summary */}
        {latest && (
          <View style={s.summaryCard}>
            <View style={s.summaryHeader}>
              <Text style={s.summaryIcon}>✨</Text>
              <Text style={s.summaryTitle}>AI Skin Summary</Text>
            </View>
            <Text style={s.summaryText}>{latest.aiSummary}</Text>
            <View style={s.summaryDisclaimer}>
              <Ionicons name="alert-circle-outline" size={12} color={TEXT2} />
              <Text style={s.summaryDisclaimerText}>Not medical advice — consult a dermatologist for diagnosis</Text>
            </View>
          </View>
        )}

        {/* Recommendations */}
        {latest && latest.recommendations.length > 0 && (
          <View style={s.recsCard}>
            <Text style={s.cardTitle}>💡 Recommendations</Text>
            {latest.recommendations.map((rec, i) => (
              <View key={i} style={s.recRow}>
                <View style={s.recDot} />
                <Text style={s.recText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Active concerns */}
        {concerns.length > 0 && (
          <View style={s.concernsCard}>
            <Text style={s.cardTitle}>Tracked Concerns</Text>
            <View style={s.concernsRow}>
              {concerns.map(c => {
                const concern = CONCERN_LABELS[c];
                return (
                  <View key={c} style={[s.concernChip, { backgroundColor: `${concern.color}15`, borderColor: `${concern.color}30` }]}>
                    <Text style={s.concernIcon}>{concern.icon}</Text>
                    <Text style={[s.concernLabel, { color: concern.color }]}>{concern.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Products */}
        <View style={s.productsCard}>
          <View style={s.productsHeader}>
            <Text style={s.cardTitle}>My Routine ({products.length})</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/insights')}>
              <Text style={s.productsViewAll}>Manage →</Text>
            </TouchableOpacity>
          </View>
          {products.slice(0, 2).map(p => (
            <View key={p.id} style={s.productRow}>
              <View style={s.productDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.productName}>{p.name}</Text>
                <Text style={s.productType}>{p.type} · {[p.morningUse && 'AM', p.eveningUse && 'PM'].filter(Boolean).join(' + ')}</Text>
              </View>
            </View>
          ))}
          {products.length > 2 && (
            <Text style={s.productsMore}>+{products.length - 2} more products</Text>
          )}
        </View>

        {/* Lifestyle correlation hint */}
        {latest?.lifestyle && (
          <View style={s.lifestyleCard}>
            <Text style={s.cardTitle}>Lifestyle Impact</Text>
            <View style={s.lifestyleRow}>
              <View style={s.lifestyleStat}>
                <Text style={s.lifestyleIcon}>😴</Text>
                <Text style={s.lifestyleNum}>{latest.lifestyle.sleep}h</Text>
                <Text style={s.lifestyleLabel}>Sleep</Text>
              </View>
              <View style={s.lifestyleStat}>
                <Text style={s.lifestyleIcon}>💧</Text>
                <Text style={s.lifestyleNum}>{latest.lifestyle.hydration}</Text>
                <Text style={s.lifestyleLabel}>Water</Text>
              </View>
              <View style={s.lifestyleStat}>
                <Text style={s.lifestyleIcon}>😌</Text>
                <Text style={[s.lifestyleNum, { color: latest.lifestyle.stress <= 2 ? GREEN : latest.lifestyle.stress >= 4 ? CORAL : AMBER }]}>
                  {['', 'Low', 'Low', 'Med', 'High', 'High'][latest.lifestyle.stress]}
                </Text>
                <Text style={s.lifestyleLabel}>Stress</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  logoText: { fontSize: 20, fontWeight: '800', color: TEXT },
  logoSub: { fontSize: 12, color: TEXT2, marginTop: 2 },
  streakBadge: { backgroundColor: `${TEAL}15`, borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: `${TEAL}30` },
  streakFire: { fontSize: 16 },
  streakNum: { fontSize: 18, fontWeight: '800', color: TEAL },
  streakLabel: { fontSize: 10, color: TEXT2 },
  scroll: { flex: 1 },
  content: { padding: 16 },

  disclaimer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${TEAL}08`, borderRadius: 10, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: `${TEAL}20` },
  disclaimerText: { flex: 1, fontSize: 11, color: TEXT2, lineHeight: 16 },

  scoreHero: { backgroundColor: CARD, borderRadius: 18, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  scoreLeft: { flex: 1, gap: 6 },
  scoreTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  scoreDate: { fontSize: 12, color: TEXT2 },
  scoreDiff: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  scoreDiffText: { fontSize: 12, fontWeight: '600' },
  skinTypeLabel: { fontSize: 12, color: TEXT2 },

  checkinBtn: { backgroundColor: TEAL, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  checkinBtnIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkinBtnText: { flex: 1 },
  checkinBtnTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  checkinBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  metricsCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 14 },
  metricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  metricLeft: { flex: 1, marginRight: 12 },
  metricLabel: { fontSize: 13, fontWeight: '600', color: TEXT },
  metricNote: { fontSize: 11, color: TEXT2, marginTop: 2 },
  metricRight: { width: 100 },
  metricBar: { height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  metricBarFill: { height: '100%', borderRadius: 2 },
  metricNumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  metricNum: { fontSize: 13, fontWeight: '700' },

  summaryCard: { backgroundColor: `${TEAL}08`, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: `${TEAL}20` },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  summaryIcon: { fontSize: 18 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  summaryText: { fontSize: 13, color: '#374151', lineHeight: 20, marginBottom: 10 },
  summaryDisclaimer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summaryDisclaimerText: { fontSize: 11, color: TEXT2 },

  recsCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  recRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL, marginTop: 6 },
  recText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },

  concernsCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  concernsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  concernChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  concernIcon: { fontSize: 14 },
  concernLabel: { fontSize: 12, fontWeight: '600' },

  productsCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  productsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  productsViewAll: { fontSize: 13, color: TEAL, fontWeight: '600' },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  productDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: TEAL },
  productName: { fontSize: 13, fontWeight: '600', color: TEXT },
  productType: { fontSize: 11, color: TEXT2, marginTop: 2 },
  productsMore: { fontSize: 12, color: TEXT2, textAlign: 'center', marginTop: 4 },

  lifestyleCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  lifestyleRow: { flexDirection: 'row', justifyContent: 'space-around' },
  lifestyleStat: { alignItems: 'center', gap: 4 },
  lifestyleIcon: { fontSize: 24 },
  lifestyleNum: { fontSize: 16, fontWeight: '800', color: TEAL },
  lifestyleLabel: { fontSize: 11, color: TEXT2 },
});
