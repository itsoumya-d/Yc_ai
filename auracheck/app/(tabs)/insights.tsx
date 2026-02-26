import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type Correlation = {
  id: string;
  factor: string;
  emoji: string;
  impact: 'positive' | 'negative' | 'neutral';
  strength: number; // 0-100
  description: string;
  trend: string;
};

type WeekInsight = {
  category: string;
  emoji: string;
  summary: string;
  detail: string;
  score: number;
};

type Action = {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  emoji: string;
};

const CORRELATIONS: Correlation[] = [
  { id: '1', factor: 'Sleep Quality', emoji: '😴', impact: 'positive', strength: 82, description: '7+ hours strongly correlates with +6 skin score improvement next day.', trend: 'Getting 6.4 hrs avg this week — room to improve' },
  { id: '2', factor: 'Stress Level', emoji: '🧠', impact: 'negative', strength: 78, description: 'High stress days (rated 7+) show 8-point score drop within 48 hours.', trend: 'Stress elevated Mon–Tue this week' },
  { id: '3', factor: 'Hydration', emoji: '💧', impact: 'positive', strength: 71, description: 'Days drinking 8+ glasses show visibly reduced dryness and redness.', trend: 'Averaging 5.2 glasses/day — below target' },
  { id: '4', factor: 'Dairy Intake', emoji: '🥛', impact: 'negative', strength: 65, description: 'Correlated with breakouts in T-zone 2–3 days after consumption.', trend: '3 dairy events detected this week' },
  { id: '5', factor: 'Exercise', emoji: '🏃‍♀️', impact: 'positive', strength: 58, description: 'Post-workout glow effect: +4 brightness score within 24 hours.', trend: 'Active 4 of 7 days this week' },
  { id: '6', factor: 'Screen Time', emoji: '📱', impact: 'negative', strength: 44, description: 'Blue light exposure over 6hrs/day may affect sleep quality and indirectly skin.', trend: 'Averaging 7.1 hrs — above healthy threshold' },
];

const WEEK_INSIGHTS: WeekInsight[] = [
  { category: 'Overall', emoji: '✨', summary: 'Gentle improvement this week', detail: 'Your skin score trended +5 over 7 days, with best results after low-stress, well-hydrated days.', score: 74 },
  { category: 'Inflammation', emoji: '🔴', summary: 'Reduced from last week', detail: 'Cheek redness decreased measurably. Likely linked to consistent niacinamide application.', score: 62 },
  { category: 'Texture', emoji: '🌸', summary: 'Stable with mild improvement', detail: 'Forehead texture refined. No new texture changes detected in jawline zone.', score: 78 },
  { category: 'Moisture', emoji: '💧', summary: 'Below optimal — act now', detail: 'Dryness patches detected 3 of 7 days. Increase humidifier use and AM moisturizer application.', score: 55 },
];

const ACTIONS: Action[] = [
  { id: '1', priority: 'high', title: 'Increase daily water intake', description: 'Aim for 8 glasses/day. Your hydration correlates strongly with skin score. Set hourly reminders.', emoji: '💧' },
  { id: '2', priority: 'high', title: 'Manage Tuesday stress spikes', description: 'Your skin reacts negatively 48hrs after high-stress periods. Try a 10-min evening wind-down routine.', emoji: '🧘‍♀️' },
  { id: '3', priority: 'medium', title: 'Reduce dairy this week', description: 'Try a 5-day dairy-free window to isolate its effect on your T-zone breakouts.', emoji: '🥗' },
  { id: '4', priority: 'medium', title: 'Prioritize 7hrs sleep tonight', description: 'You averaged 6.4hrs this week. Even one restorative night yields measurable improvement.', emoji: '😴' },
  { id: '5', priority: 'low', title: 'Apply AM SPF consistently', description: 'UV exposure is a top skin-aging driver. SPF detected applied only 4 of 7 days.', emoji: '☀️' },
];

const PRIORITY_COLORS = { high: '#A21CAF', medium: '#F97316', low: '#94A3B8' };
const PRIORITY_BG = { high: '#FAE8FF', medium: '#FFF7ED', low: '#F8FAFC' };

export default function AuraInsightsScreen() {
  const [expandedCorr, setExpandedCorr] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Insights</Text>
          <Text style={styles.subtitle}>What your skin is telling you</Text>
        </View>

        {/* Weekly summary cards */}
        <Text style={styles.sectionTitle}>This Week</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insightScroll}>
          {WEEK_INSIGHTS.map(ins => (
            <View key={ins.category} style={styles.insightCard}>
              <Text style={styles.insightEmoji}>{ins.emoji}</Text>
              <Text style={styles.insightCat}>{ins.category}</Text>
              <Text style={[styles.insightScore, { color: ins.score >= 70 ? '#A21CAF' : ins.score >= 55 ? '#F97316' : '#DC2626' }]}>
                {ins.score}
              </Text>
              <Text style={styles.insightSummary}>{ins.summary}</Text>
              <Text style={styles.insightDetail}>{ins.detail}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Correlations */}
        <Text style={styles.sectionTitle}>Factor Correlations</Text>
        <Text style={styles.sectionSubtitle}>AI-analyzed links between lifestyle and your skin score</Text>
        {CORRELATIONS.map(corr => {
          const isOpen = expandedCorr === corr.id;
          return (
            <TouchableOpacity
              key={corr.id}
              style={styles.corrCard}
              onPress={() => setExpandedCorr(isOpen ? null : corr.id)}
              activeOpacity={0.85}
            >
              <View style={styles.corrTop}>
                <Text style={styles.corrEmoji}>{corr.emoji}</Text>
                <View style={styles.corrMid}>
                  <Text style={styles.corrFactor}>{corr.factor}</Text>
                  <View style={styles.corrBarTrack}>
                    <View style={[styles.corrBarFill, {
                      width: `${corr.strength}%` as any,
                      backgroundColor: corr.impact === 'positive' ? '#A21CAF' : '#F97316',
                    }]} />
                  </View>
                </View>
                <View style={[styles.corrBadge, { backgroundColor: corr.impact === 'positive' ? '#FAE8FF' : '#FFF7ED' }]}>
                  <Text style={[styles.corrBadgeText, { color: corr.impact === 'positive' ? '#A21CAF' : '#F97316' }]}>
                    {corr.impact === 'positive' ? '↑ Good' : '↓ Watch'}
                  </Text>
                </View>
              </View>
              {isOpen && (
                <View style={styles.corrExpanded}>
                  <Text style={styles.corrDesc}>{corr.description}</Text>
                  <View style={styles.corrTrendRow}>
                    <Text style={styles.corrTrendDot}>📊</Text>
                    <Text style={styles.corrTrend}>{corr.trend}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Recommended actions */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Recommended Actions</Text>
        {ACTIONS.map(action => (
          <View key={action.id} style={[styles.actionCard, { borderLeftColor: PRIORITY_COLORS[action.priority] }]}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
            </View>
            <View style={styles.actionContent}>
              <View style={styles.actionHeader}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_BG[action.priority] }]}>
                  <Text style={[styles.priorityText, { color: PRIORITY_COLORS[action.priority] }]}>
                    {action.priority}
                  </Text>
                </View>
              </View>
              <Text style={styles.actionDesc}>{action.description}</Text>
            </View>
          </View>
        ))}

        {/* Weekly summary footer */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🤖 AI Weekly Summary</Text>
          <Text style={styles.summaryText}>
            Your skin is responding well to your niacinamide serum. Focus on hydration and sleep this week — these two factors show the highest predictive correlation with your skin score. Your next check is tomorrow morning.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF2F8' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#701A75', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#C084FC', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#701A75', marginBottom: 6 },
  sectionSubtitle: { fontSize: 12, color: '#C084FC', marginBottom: 12 },

  insightScroll: { marginBottom: 20 },
  insightCard: { backgroundColor: '#FDF4FF', borderRadius: 16, padding: 14, marginRight: 12, width: 180, borderWidth: 1, borderColor: '#E9D5FF' },
  insightEmoji: { fontSize: 24, marginBottom: 6 },
  insightCat: { fontSize: 11, color: '#C084FC', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  insightScore: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  insightSummary: { fontSize: 12, fontWeight: '700', color: '#701A75', marginBottom: 6 },
  insightDetail: { fontSize: 11, color: '#9333EA', lineHeight: 16 },

  corrCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E9D5FF' },
  corrTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  corrEmoji: { fontSize: 22 },
  corrMid: { flex: 1, gap: 6 },
  corrFactor: { fontSize: 13, fontWeight: '700', color: '#701A75' },
  corrBarTrack: { height: 6, backgroundColor: '#F3E8FF', borderRadius: 3 },
  corrBarFill: { height: 6, borderRadius: 3 },
  corrBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  corrBadgeText: { fontSize: 10, fontWeight: '800' },
  corrExpanded: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3E8FF', gap: 8 },
  corrDesc: { fontSize: 12, color: '#4B5563', lineHeight: 18 },
  corrTrendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  corrTrendDot: { fontSize: 12 },
  corrTrend: { fontSize: 11, color: '#9333EA', fontStyle: 'italic' },

  actionCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E9D5FF', borderLeftWidth: 3, flexDirection: 'row', gap: 12 },
  actionLeft: {},
  actionEmoji: { fontSize: 24 },
  actionContent: { flex: 1 },
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  actionTitle: { fontSize: 13, fontWeight: '700', color: '#701A75', flex: 1, marginRight: 8 },
  priorityBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  priorityText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  actionDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17 },

  summaryCard: { backgroundColor: '#FAE8FF', borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#E9D5FF' },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: '#701A75', marginBottom: 8 },
  summaryText: { fontSize: 12, color: '#6D28D9', lineHeight: 19 },
});
