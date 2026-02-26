import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type Session = {
  id: string;
  date: string;
  trade: string;
  task: string;
  score: number;
  duration: string;
  reps: number;
  topFeedback: string;
  improvement: string;
};

const SESSIONS: Session[] = [
  { id: '1', date: 'Feb 22', trade: 'Electrical', task: 'Panel Wiring', score: 91, duration: '42 min', reps: 8, topFeedback: 'Excellent wire management and labeling technique.', improvement: 'Torque specs on neutral bar connections' },
  { id: '2', date: 'Feb 20', trade: 'Electrical', task: 'Conduit Bending', score: 84, duration: '31 min', reps: 12, topFeedback: 'Good consistency on 90° bends.', improvement: 'Reduce spring-back compensation on tight radius bends' },
  { id: '3', date: 'Feb 18', trade: 'HVAC', task: 'Refrigerant Line', score: 78, duration: '55 min', reps: 6, topFeedback: 'Correct flare angles achieved on 3rd try.', improvement: 'Flaring tool grip pressure on copper tubing' },
  { id: '4', date: 'Feb 15', trade: 'Electrical', task: 'Troubleshooting', score: 88, duration: '28 min', reps: 5, topFeedback: 'Systematic approach to fault isolation.', improvement: 'Multimeter probe placement speed' },
  { id: '5', date: 'Feb 13', trade: 'Plumbing', task: 'PEX Manifold', score: 72, duration: '47 min', reps: 9, topFeedback: 'Clean crimps with proper ring placement.', improvement: 'Flow balancing on manifold legs' },
  { id: '6', date: 'Feb 11', trade: 'Electrical', task: 'Load Calculation', score: 95, duration: '19 min', reps: 3, topFeedback: 'Perfect NEC calculation methodology.', improvement: 'Speed — target under 15 min at your level' },
  { id: '7', date: 'Feb 8', trade: 'HVAC', task: 'Duct Sealing', score: 76, duration: '38 min', reps: 14, topFeedback: 'Good mastic application consistency.', improvement: 'Properly address duct board joint seams' },
  { id: '8', date: 'Feb 6', trade: 'Plumbing', task: 'Solder Joints', score: 69, duration: '52 min', reps: 18, topFeedback: 'Heat distribution improving.', improvement: 'Flux coverage and heat application timing' },
];

const TRADE_FILTERS = ['All', 'Electrical', 'HVAC', 'Plumbing'];

const SCORE_COLOR = (score: number) =>
  score >= 90 ? '#22C55E' : score >= 80 ? '#F97316' : score >= 70 ? '#FBBF24' : '#EF4444';

export default function FieldLensSessionsScreen() {
  const [trade, setTrade] = useState('All');
  const [expanded, setExpanded] = useState<string | null>('1');

  const filtered = SESSIONS.filter(s => trade === 'All' || s.trade === trade);

  const avgScore = Math.round(SESSIONS.reduce((s, sess) => s + sess.score, 0) / SESSIONS.length);
  const totalHours = SESSIONS.reduce((s, sess) => {
    const mins = parseInt(sess.duration);
    return s + mins;
  }, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Sessions</Text>
          <Text style={styles.subtitle}>AI coaching history</Text>
        </View>

        {/* Stats hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{SESSIONS.length}</Text>
            <Text style={styles.heroStatLabel}>Total</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatVal, { color: SCORE_COLOR(avgScore) }]}>{avgScore}</Text>
            <Text style={styles.heroStatLabel}>Avg Score</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{Math.floor(totalHours / 60)}h</Text>
            <Text style={styles.heroStatLabel}>Coached</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{SESSIONS.reduce((s, sess) => s + sess.reps, 0)}</Text>
            <Text style={styles.heroStatLabel}>Reps</Text>
          </View>
        </View>

        {/* Trade filter */}
        <View style={styles.filterRow}>
          {TRADE_FILTERS.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.filterBtn, trade === t && styles.filterBtnActive]}
              onPress={() => setTrade(t)}
            >
              <Text style={[styles.filterBtnText, trade === t && styles.filterBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Session list */}
        {filtered.map(sess => {
          const isOpen = expanded === sess.id;
          return (
            <TouchableOpacity
              key={sess.id}
              style={[styles.sessionCard, { borderLeftColor: SCORE_COLOR(sess.score) }]}
              onPress={() => setExpanded(isOpen ? null : sess.id)}
              activeOpacity={0.85}
            >
              <View style={styles.sessionTop}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionTask}>{sess.task}</Text>
                  <Text style={styles.sessionMeta}>
                    {sess.trade} · {sess.date} · {sess.duration} · {sess.reps} reps
                  </Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={[styles.sessionScore, { color: SCORE_COLOR(sess.score) }]}>{sess.score}</Text>
                  <Text style={styles.sessionScoreLabel}>/ 100</Text>
                </View>
              </View>
              {isOpen && (
                <View style={styles.sessionExpanded}>
                  <View style={styles.feedbackRow}>
                    <Text style={styles.feedbackIcon}>✅</Text>
                    <Text style={styles.feedbackText}>{sess.topFeedback}</Text>
                  </View>
                  <View style={styles.feedbackRow}>
                    <Text style={styles.feedbackIcon}>🎯</Text>
                    <Text style={[styles.feedbackText, { color: '#F97316' }]}>{sess.improvement}</Text>
                  </View>
                  <TouchableOpacity style={styles.replayBtn}>
                    <Text style={styles.replayBtnText}>▶ Replay Coaching Clip</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Score chart mini */}
        <Text style={styles.sectionTitle}>Score Trend</Text>
        <View style={styles.trendCard}>
          {SESSIONS.slice(0, 7).reverse().map((sess, i) => (
            <View key={sess.id} style={styles.trendBar}>
              <View style={styles.trendBarTrack}>
                <View style={[styles.trendBarFill, {
                  height: `${(sess.score / 100) * 100}%` as any,
                  backgroundColor: SCORE_COLOR(sess.score),
                }]} />
              </View>
              <Text style={styles.trendScore}>{sess.score}</Text>
              <Text style={styles.trendDay}>{sess.date.split(' ')[1]}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1117' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#F8FAFC', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#475569', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 12, marginTop: 8 },

  heroCard: { backgroundColor: '#161B22', borderRadius: 18, padding: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: '#21262D' },
  heroStat: { alignItems: 'center' },
  heroStatVal: { fontSize: 24, fontWeight: '900', color: '#F97316' },
  heroStatLabel: { fontSize: 11, color: '#475569', marginTop: 3 },
  heroDivider: { width: 1, height: 36, backgroundColor: '#21262D' },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { flex: 1, backgroundColor: '#161B22', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#21262D' },
  filterBtnActive: { backgroundColor: '#1A1208', borderColor: '#F97316' },
  filterBtnText: { fontSize: 12, color: '#475569', fontWeight: '700' },
  filterBtnTextActive: { color: '#F97316' },

  sessionCard: { backgroundColor: '#161B22', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#21262D', borderLeftWidth: 3 },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionLeft: { flex: 1, marginRight: 12 },
  sessionTask: { fontSize: 14, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  sessionMeta: { fontSize: 11, color: '#475569' },
  sessionRight: { alignItems: 'center' },
  sessionScore: { fontSize: 26, fontWeight: '900' },
  sessionScoreLabel: { fontSize: 10, color: '#475569' },
  sessionExpanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#21262D', gap: 8 },
  feedbackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  feedbackIcon: { fontSize: 14, marginTop: 1 },
  feedbackText: { flex: 1, fontSize: 12, color: '#94A3B8', lineHeight: 18 },
  replayBtn: { backgroundColor: '#1A1208', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F97316', marginTop: 4 },
  replayBtnText: { color: '#F97316', fontWeight: '700', fontSize: 13 },

  trendCard: { backgroundColor: '#161B22', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderWidth: 1, borderColor: '#21262D', height: 120 },
  trendBar: { flex: 1, alignItems: 'center', gap: 4 },
  trendBarTrack: { flex: 1, width: 20, backgroundColor: '#21262D', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  trendBarFill: { width: '100%', borderRadius: 4 },
  trendScore: { fontSize: 9, color: '#64748B', fontWeight: '700' },
  trendDay: { fontSize: 9, color: '#475569' },
});
