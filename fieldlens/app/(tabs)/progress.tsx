import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFieldLensStore, Trade } from '../../store/fieldlens-store';

const ORANGE = '#E8711A';
const SLATE = '#3A506B';
const DARK = '#1C1C1E';
const CARD = '#2C2C2E';
const CARD2 = '#3A3A3C';
const TEXT = '#F2F2F7';
const TEXT2 = '#8E8E93';
const GREEN = '#32D74B';
const AMBER = '#FFD60A';
const RED = '#FF453A';
const BLUE = '#0A84FF';

const TRADE_LABELS: Record<Trade, { label: string; icon: string; color: string }> = {
  electrical: { label: 'Electrical', icon: '⚡', color: AMBER },
  plumbing: { label: 'Plumbing', icon: '🔧', color: '#30D5C8' },
  hvac: { label: 'HVAC', icon: '❄️', color: '#64D2FF' },
  carpentry: { label: 'Carpentry', icon: '🪚', color: '#FF9F0A' },
  general: { label: 'General', icon: '🔨', color: TEXT2 },
};

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Simulated weekly streak data (1 = active, 0 = inactive)
const STREAK_WEEKS = [
  [1, 1, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 0],
  [1, 0, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
];

const SCORE_HISTORY = [
  { week: 'Jan W3', avg: 72 },
  { week: 'Jan W4', avg: 78 },
  { week: 'Feb W1', avg: 81 },
  { week: 'Feb W2', avg: 88 },
  { week: 'Feb W3', avg: 85 },
  { week: 'This wk', avg: 91 },
];

const ACHIEVEMENTS = [
  { id: '1', icon: '🔥', title: '7-Day Streak', desc: 'Captured work 7 days in a row', earned: true, color: ORANGE },
  { id: '2', icon: '⚡', title: 'Electrical Pro', desc: 'Scored 90+ on 3 electrical captures', earned: true, color: AMBER },
  { id: '3', icon: '🏆', title: 'Perfect Score', desc: 'Achieved 100/100 on an AI capture', earned: false, color: TEXT2 },
  { id: '4', icon: '💯', title: '10 Captures', desc: 'Completed 10 AI captures', earned: true, color: GREEN },
  { id: '5', icon: '📚', title: 'Multi-Trade', desc: 'Worked in 3 different trades', earned: false, color: TEXT2 },
  { id: '6', icon: '⭐', title: 'Zero Flags', desc: 'Complete 5 tasks with no issues', earned: false, color: TEXT2 },
];

export default function ProgressScreen() {
  const { tasks, streak, captures } = useFieldLensStore();

  const completed = tasks.filter(t => t.status === 'completed');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const flagged = tasks.filter(t => t.status === 'flagged');
  const avgScore = captures.filter(c => c.score).reduce((s, c, _, a) => s + c.score / a.length, 0);
  const earnedBadges = ACHIEVEMENTS.filter(a => a.earned).length;

  const maxScore = Math.max(...SCORE_HISTORY.map(s => s.avg), 1);

  // Per-trade stats
  const tradeStats = (Object.keys(TRADE_LABELS) as Trade[]).map(trade => {
    const tradeTasks = tasks.filter(t => t.trade === trade);
    const tradeCaptures = captures.filter(c => c.trade === trade);
    const tradeAvg = tradeCaptures.reduce((s, c, _, a) => s + c.score / a.length, 0);
    return {
      trade,
      tasks: tradeTasks.length,
      completed: tradeTasks.filter(t => t.status === 'completed').length,
      captures: tradeCaptures.length,
      avgScore: tradeAvg,
    };
  }).filter(t => t.tasks > 0 || t.captures > 0);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Progress</Text>
          <Text style={s.headerSub}>Your field performance</Text>
        </View>
        <View style={s.levelBadge}>
          <Text style={s.levelText}>Level 4</Text>
          <Text style={s.levelSub}>Field Tech</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Streak + summary hero */}
        <View style={s.heroCard}>
          <View style={s.heroLeft}>
            <View style={s.streakRow}>
              <Text style={s.streakFire}>🔥</Text>
              <Text style={s.streakNum}>{streak}</Text>
              <Text style={s.streakLabel}>day streak</Text>
            </View>
            <Text style={s.heroSub}>Keep it going!</Text>
          </View>
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>{completed.length}</Text>
              <Text style={s.heroStatLabel}>Done</Text>
            </View>
            <View style={s.heroDivider} />
            <View style={s.heroStat}>
              <Text style={[s.heroStatNum, { color: avgScore >= 90 ? GREEN : avgScore >= 70 ? AMBER : TEXT }]}>
                {avgScore > 0 ? avgScore.toFixed(0) : '—'}
              </Text>
              <Text style={s.heroStatLabel}>Avg Score</Text>
            </View>
            <View style={s.heroDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>{captures.length}</Text>
              <Text style={s.heroStatLabel}>Captures</Text>
            </View>
          </View>
        </View>

        {/* Streak calendar */}
        <View style={s.calCard}>
          <Text style={s.cardTitle}>Streak Calendar</Text>
          <View style={s.weekHeader}>
            {WEEK_LABELS.map((d, i) => (
              <Text key={i} style={s.weekDay}>{d}</Text>
            ))}
          </View>
          {STREAK_WEEKS.map((week, wi) => (
            <View key={wi} style={s.weekRow}>
              {week.map((active, di) => (
                <View key={di} style={[s.streakDot, active ? s.streakDotActive : s.streakDotEmpty]} />
              ))}
            </View>
          ))}
          <Text style={s.calNote}>Last 4 weeks · Current streak: {streak} days</Text>
        </View>

        {/* Score history chart */}
        <View style={s.scoreCard}>
          <Text style={s.cardTitle}>AI Score Trend</Text>
          <View style={s.chart}>
            {SCORE_HISTORY.map((d, i) => {
              const heightPct = (d.avg / maxScore) * 100;
              const isLast = i === SCORE_HISTORY.length - 1;
              const scoreColor = d.avg >= 90 ? GREEN : d.avg >= 70 ? AMBER : RED;
              return (
                <View key={d.week} style={s.chartBar}>
                  <Text style={[s.chartVal, { color: isLast ? ORANGE : TEXT2 }]}>{d.avg}</Text>
                  <View style={s.chartTrack}>
                    <View style={[
                      s.chartFill,
                      { height: `${heightPct}%` as any, backgroundColor: isLast ? ORANGE : `${scoreColor}60` },
                    ]} />
                  </View>
                  <Text style={[s.chartDay, isLast && { color: ORANGE, fontWeight: '800' }]}>{d.week}</Text>
                </View>
              );
            })}
          </View>
          <View style={s.scoreSummary}>
            <Text style={s.scoreSummaryText}>Improving! Up {SCORE_HISTORY[5].avg - SCORE_HISTORY[0].avg} pts over 6 weeks</Text>
            <Ionicons name="trending-up" size={16} color={GREEN} />
          </View>
        </View>

        {/* Task overview */}
        <View style={s.tasksCard}>
          <Text style={s.cardTitle}>Task Overview</Text>
          <View style={s.taskOverviewRow}>
            {[
              { label: 'In Progress', count: inProgress.length, color: ORANGE },
              { label: 'Completed', count: completed.length, color: GREEN },
              { label: 'Flagged', count: flagged.length, color: RED },
              { label: 'Total', count: tasks.length, color: TEXT2 },
            ].map(item => (
              <View key={item.label} style={s.taskOverviewItem}>
                <Text style={[s.taskOverviewNum, { color: item.color }]}>{item.count}</Text>
                <Text style={s.taskOverviewLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Per-trade breakdown */}
        {tradeStats.length > 0 && (
          <View style={s.tradeCard}>
            <Text style={s.cardTitle}>By Trade</Text>
            {tradeStats.map(stat => {
              const trade = TRADE_LABELS[stat.trade];
              const pct = stat.tasks > 0 ? (stat.completed / stat.tasks) * 100 : 0;
              return (
                <View key={stat.trade} style={s.tradeRow}>
                  <Text style={s.tradeRowIcon}>{trade.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={s.tradeRowTop}>
                      <Text style={s.tradeRowLabel}>{trade.label}</Text>
                      <Text style={[s.tradeRowScore, { color: trade.color }]}>
                        {stat.avgScore > 0 ? `avg ${stat.avgScore.toFixed(0)}` : `${stat.tasks} tasks`}
                      </Text>
                    </View>
                    <View style={s.tradeBar}>
                      <View style={[s.tradeBarFill, { width: `${pct}%` as any, backgroundColor: trade.color }]} />
                    </View>
                    <Text style={s.tradeBarLabel}>{stat.completed}/{stat.tasks} tasks · {stat.captures} captures</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent captures */}
        {captures.length > 0 && (
          <View style={s.capturesCard}>
            <Text style={s.cardTitle}>Recent AI Captures</Text>
            {captures.slice(0, 3).map(cap => {
              const scoreColor = cap.score >= 90 ? GREEN : cap.score >= 70 ? AMBER : RED;
              const trade = TRADE_LABELS[cap.trade];
              return (
                <View key={cap.id} style={s.captureRow}>
                  <View style={[s.captureScore, { backgroundColor: `${scoreColor}20` }]}>
                    <Text style={[s.captureScoreNum, { color: scoreColor }]}>{cap.score}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.captureTrade}>{trade.icon} {trade.label}</Text>
                    <Text style={s.captureFindings} numberOfLines={2}>{cap.findings}</Text>
                    <Text style={s.captureTime}>{cap.timestamp}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Achievements */}
        <View style={s.achCard}>
          <View style={s.achHeader}>
            <Text style={s.cardTitle}>Achievements</Text>
            <Text style={s.achCount}>{earnedBadges}/{ACHIEVEMENTS.length} earned</Text>
          </View>
          <View style={s.achGrid}>
            {ACHIEVEMENTS.map(ach => (
              <View key={ach.id} style={[s.achItem, !ach.earned && s.achItemLocked]}>
                <Text style={[s.achIcon, !ach.earned && s.achIconLocked]}>{ach.earned ? ach.icon : '🔒'}</Text>
                <Text style={[s.achTitle, !ach.earned && s.achTitleLocked]} numberOfLines={1}>{ach.title}</Text>
                <Text style={s.achDesc} numberOfLines={2}>{ach.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Export */}
        <TouchableOpacity
          style={s.exportBtn}
          onPress={() => Alert.alert('Export', 'Performance report will be generated and ready to share with your supervisor.')}
        >
          <Ionicons name="document-text-outline" size={20} color={ORANGE} />
          <Text style={s.exportBtnText}>Export Performance Report</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD },
  headerTitle: { fontSize: 20, fontWeight: '800', color: TEXT },
  headerSub: { fontSize: 12, color: TEXT2, marginTop: 2 },
  levelBadge: { backgroundColor: `${BLUE}20`, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: `${BLUE}40` },
  levelText: { fontSize: 14, fontWeight: '800', color: BLUE },
  levelSub: { fontSize: 10, color: TEXT2 },
  scroll: { flex: 1 },
  content: { padding: 16 },

  heroCard: { backgroundColor: ORANGE, borderRadius: 18, padding: 18, flexDirection: 'row', gap: 16, marginBottom: 14, alignItems: 'center' },
  heroLeft: { flex: 1 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakFire: { fontSize: 28 },
  streakNum: { fontSize: 36, fontWeight: '800', color: DARK },
  streakLabel: { fontSize: 14, color: `${DARK}CC`, fontWeight: '600' },
  heroSub: { fontSize: 12, color: `${DARK}99`, marginTop: 4 },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: 12 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatNum: { fontSize: 20, fontWeight: '800', color: DARK },
  heroStatLabel: { fontSize: 10, color: `${DARK}CC`, marginTop: 2 },
  heroDivider: { width: 1, backgroundColor: 'rgba(0,0,0,0.15)', marginHorizontal: 6 },

  calCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 14 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  weekDay: { fontSize: 11, color: TEXT2, fontWeight: '600', width: 24, textAlign: 'center' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  streakDot: { width: 24, height: 24, borderRadius: 6 },
  streakDotActive: { backgroundColor: ORANGE },
  streakDotEmpty: { backgroundColor: CARD2 },
  calNote: { fontSize: 11, color: TEXT2, marginTop: 6, textAlign: 'center' },

  scoreCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14 },
  chart: { flexDirection: 'row', height: 100, alignItems: 'flex-end', gap: 6, marginBottom: 8 },
  chartBar: { flex: 1, alignItems: 'center', gap: 3 },
  chartVal: { fontSize: 10, fontWeight: '700', height: 14 },
  chartTrack: { flex: 1, width: '100%', backgroundColor: CARD2, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  chartFill: { width: '100%', borderRadius: 4 },
  chartDay: { fontSize: 9, color: TEXT2, fontWeight: '600', textAlign: 'center' },
  scoreSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: CARD2 },
  scoreSummaryText: { fontSize: 12, color: GREEN },

  tasksCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14 },
  taskOverviewRow: { flexDirection: 'row', justifyContent: 'space-around' },
  taskOverviewItem: { alignItems: 'center' },
  taskOverviewNum: { fontSize: 28, fontWeight: '800' },
  taskOverviewLabel: { fontSize: 11, color: TEXT2, marginTop: 2 },

  tradeCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14 },
  tradeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  tradeRowIcon: { fontSize: 22, width: 30 },
  tradeRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  tradeRowLabel: { fontSize: 13, fontWeight: '700', color: TEXT },
  tradeRowScore: { fontSize: 12, fontWeight: '600' },
  tradeBar: { height: 4, backgroundColor: CARD2, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  tradeBarFill: { height: '100%', borderRadius: 2 },
  tradeBarLabel: { fontSize: 10, color: TEXT2 },

  capturesCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14 },
  captureRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: CARD2 },
  captureScore: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  captureScoreNum: { fontSize: 16, fontWeight: '800' },
  captureTrade: { fontSize: 12, fontWeight: '700', color: TEXT, marginBottom: 3 },
  captureFindings: { fontSize: 12, color: TEXT2, lineHeight: 17 },
  captureTime: { fontSize: 10, color: TEXT2, marginTop: 3 },

  achCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14 },
  achHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  achCount: { fontSize: 12, color: ORANGE, fontWeight: '700' },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achItem: { width: '48%', backgroundColor: CARD2, borderRadius: 12, padding: 12 },
  achItemLocked: { opacity: 0.5 },
  achIcon: { fontSize: 28, marginBottom: 6 },
  achIconLocked: { opacity: 0.4 },
  achTitle: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 4 },
  achTitleLocked: { color: TEXT2 },
  achDesc: { fontSize: 11, color: TEXT2, lineHeight: 15 },

  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: `${ORANGE}15`, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: `${ORANGE}40` },
  exportBtnText: { fontSize: 14, fontWeight: '700', color: ORANGE },
});
