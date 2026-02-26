import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

const TRADE_LABELS: Record<Trade, { label: string; icon: string; color: string }> = {
  electrical: { label: 'Electrical', icon: '⚡', color: '#FFD60A' },
  plumbing: { label: 'Plumbing', icon: '🔧', color: '#30D5C8' },
  hvac: { label: 'HVAC', icon: '❄️', color: '#64D2FF' },
  carpentry: { label: 'Carpentry', icon: '🪚', color: '#FF9F0A' },
  general: { label: 'General', icon: '🔨', color: TEXT2 },
};

export default function HomeScreen() {
  const { tasks, streak, captures } = useFieldLensStore();
  const router = useRouter();

  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const completed = tasks.filter(t => t.status === 'completed');
  const flagged = tasks.filter(t => t.status === 'flagged');
  const avgScore = completed.filter(t => t.aiScore).reduce((s, t, _, a) => s + (t.aiScore ?? 0) / a.length, 0);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <View style={s.logoRow}>
            <Ionicons name="eye" size={22} color={ORANGE} />
            <Text style={s.logoText}>FieldLens</Text>
          </View>
          <Text style={s.headerSub}>AI-powered field guide</Text>
        </View>
        <View style={s.streakBadge}>
          <Text style={s.streakFire}>🔥</Text>
          <Text style={s.streakNum}>{streak}</Text>
          <Text style={s.streakLabel}>day streak</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Hero capture button */}
        <TouchableOpacity style={s.captureHero} onPress={() => router.push('/(tabs)/camera')}>
          <View style={s.captureBtn}>
            <Ionicons name="camera" size={36} color={DARK} />
          </View>
          <View style={s.captureInfo}>
            <Text style={s.captureTitle}>AI Capture</Text>
            <Text style={s.captureSub}>Point camera at your work — AI analyzes quality and safety</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: ORANGE }]}>{inProgress.length}</Text>
            <Text style={s.statLabel}>Active Tasks</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: GREEN }]}>{completed.length}</Text>
            <Text style={s.statLabel}>Completed</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: AMBER }]}>{captures.length}</Text>
            <Text style={s.statLabel}>AI Captures</Text>
          </View>
          {avgScore > 0 && (
            <View style={s.statCard}>
              <Text style={[s.statNum, { color: GREEN }]}>{avgScore.toFixed(0)}</Text>
              <Text style={s.statLabel}>Avg Score</Text>
            </View>
          )}
        </View>

        {/* Flagged items */}
        {flagged.length > 0 && (
          <TouchableOpacity style={s.flaggedAlert} onPress={() => router.push('/(tabs)/tasks')}>
            <Ionicons name="warning" size={20} color={RED} />
            <View style={{ flex: 1 }}>
              <Text style={s.flaggedTitle}>{flagged.length} Flagged Issue{flagged.length > 1 ? 's' : ''}</Text>
              <Text style={s.flaggedSub}>AI detected problems requiring attention</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={RED} />
          </TouchableOpacity>
        )}

        {/* In progress tasks */}
        {inProgress.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>▶ In Progress</Text>
            {inProgress.map(task => {
              const trade = TRADE_LABELS[task.trade];
              const completedSteps = task.steps.filter(s => s.completed).length;
              const pct = (completedSteps / task.steps.length) * 100;
              return (
                <TouchableOpacity key={task.id} style={s.taskCard} onPress={() => router.push('/(tabs)/tasks')}>
                  <View style={s.taskTop}>
                    <Text style={s.taskIcon}>{trade.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.taskTitle}>{task.title}</Text>
                      <Text style={s.taskMeta}>{task.trade.toUpperCase()} · {task.estimatedMinutes} min · {'●'.repeat(task.difficulty) + '○'.repeat(3 - task.difficulty)}</Text>
                    </View>
                    <Text style={s.taskPct}>{completedSteps}/{task.steps.length}</Text>
                  </View>
                  <View style={s.taskBar}>
                    <View style={[s.taskBarFill, { width: `${pct}%` as any }]} />
                  </View>
                  {task.steps.find(s => !s.completed) && (
                    <Text style={s.taskNext}>Next: {task.steps.find(s => !s.completed)?.instruction}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Recent captures */}
        {captures.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Recent AI Captures</Text>
            {captures.slice(0, 2).map(cap => (
              <View key={cap.id} style={s.captureCard}>
                <View style={s.captureCardTop}>
                  <View style={[s.captureScore, { backgroundColor: cap.score >= 90 ? `${GREEN}20` : cap.score >= 70 ? `${AMBER}20` : `${RED}20` }]}>
                    <Text style={[s.captureScoreNum, { color: cap.score >= 90 ? GREEN : cap.score >= 70 ? AMBER : RED }]}>{cap.score}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.captureFinding}>{cap.findings.slice(0, 80)}...</Text>
                    <Text style={s.captureTime}>{cap.timestamp}</Text>
                  </View>
                </View>
                {cap.recommendation && (
                  <Text style={s.captureRec}>💡 {cap.recommendation}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Trade quick access */}
        <Text style={s.sectionTitle}>Browse by Trade</Text>
        <View style={s.tradeGrid}>
          {Object.entries(TRADE_LABELS).map(([key, val]) => {
            const count = tasks.filter(t => t.trade === key as Trade).length;
            return (
              <TouchableOpacity key={key} style={s.tradeCard} onPress={() => router.push('/(tabs)/tasks')}>
                <Text style={s.tradeIcon}>{val.icon}</Text>
                <Text style={s.tradeName}>{val.label}</Text>
                <Text style={[s.tradeCount, { color: val.color }]}>{count} tasks</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  logoText: { fontSize: 20, fontWeight: '800', color: TEXT },
  headerSub: { fontSize: 12, color: TEXT2 },
  streakBadge: { backgroundColor: `${ORANGE}20`, borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: `${ORANGE}40` },
  streakFire: { fontSize: 18 },
  streakNum: { fontSize: 18, fontWeight: '800', color: ORANGE },
  streakLabel: { fontSize: 10, color: TEXT2 },
  scroll: { flex: 1 },
  content: { padding: 16 },
  captureHero: { backgroundColor: ORANGE, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  captureBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  captureInfo: { flex: 1 },
  captureTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  captureSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 12, padding: 12, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: TEXT2, marginTop: 2, textAlign: 'center' },
  flaggedAlert: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: `${RED}15`, borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: `${RED}40` },
  flaggedTitle: { fontSize: 14, fontWeight: '700', color: RED },
  flaggedSub: { fontSize: 12, color: `${RED}CC`, marginTop: 2 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 10 },
  taskCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 8 },
  taskTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  taskIcon: { fontSize: 22 },
  taskTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  taskMeta: { fontSize: 11, color: TEXT2, marginTop: 2 },
  taskPct: { fontSize: 12, fontWeight: '700', color: ORANGE },
  taskBar: { height: 4, backgroundColor: CARD2, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  taskBarFill: { height: '100%', backgroundColor: ORANGE, borderRadius: 2 },
  taskNext: { fontSize: 12, color: TEXT2, fontStyle: 'italic' },
  captureCard: { backgroundColor: CARD, borderRadius: 12, padding: 12, marginBottom: 8 },
  captureCardTop: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  captureScore: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  captureScoreNum: { fontSize: 16, fontWeight: '800' },
  captureFinding: { fontSize: 12, color: TEXT, lineHeight: 17 },
  captureTime: { fontSize: 10, color: TEXT2, marginTop: 3 },
  captureRec: { fontSize: 11, color: AMBER, lineHeight: 16 },
  tradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tradeCard: { width: '48%', backgroundColor: CARD, borderRadius: 12, padding: 14 },
  tradeIcon: { fontSize: 24, marginBottom: 6 },
  tradeName: { fontSize: 13, fontWeight: '700', color: TEXT },
  tradeCount: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
