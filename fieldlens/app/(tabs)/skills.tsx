import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type Skill = {
  id: string;
  name: string;
  level: number; // 1-5
  xp: number;
  xpMax: number;
  sessions: number;
  status: 'mastered' | 'in-progress' | 'locked';
  badge?: string;
};

type Trade = {
  id: string;
  name: string;
  emoji: string;
  level: number;
  totalXP: number;
  skills: Skill[];
  color: string;
};

const TRADES: Trade[] = [
  {
    id: '1', name: 'Electrical', emoji: '⚡', level: 3, totalXP: 4820, color: '#F97316',
    skills: [
      { id: 'e1', name: 'Load Calculations', level: 5, xp: 500, xpMax: 500, sessions: 12, status: 'mastered', badge: '🏆' },
      { id: 'e2', name: 'Panel Wiring', level: 4, xp: 380, xpMax: 500, sessions: 9, status: 'in-progress' },
      { id: 'e3', name: 'Conduit Bending', level: 3, xp: 290, xpMax: 400, sessions: 8, status: 'in-progress' },
      { id: 'e4', name: 'Troubleshooting', level: 3, xp: 310, xpMax: 400, sessions: 7, status: 'in-progress' },
      { id: 'e5', name: 'Motor Controls', level: 2, xp: 140, xpMax: 300, sessions: 4, status: 'in-progress' },
      { id: 'e6', name: 'Three-Phase Systems', level: 1, xp: 60, xpMax: 200, sessions: 2, status: 'in-progress' },
      { id: 'e7', name: 'PLC Programming', level: 0, xp: 0, xpMax: 200, sessions: 0, status: 'locked' },
    ],
  },
  {
    id: '2', name: 'HVAC', emoji: '❄️', level: 2, totalXP: 2140, color: '#38BDF8',
    skills: [
      { id: 'h1', name: 'Refrigerant Handling', level: 3, xp: 310, xpMax: 400, sessions: 8, status: 'in-progress' },
      { id: 'h2', name: 'Duct Sealing', level: 2, xp: 210, xpMax: 300, sessions: 6, status: 'in-progress' },
      { id: 'h3', name: 'Commissioning', level: 1, xp: 90, xpMax: 200, sessions: 3, status: 'in-progress' },
      { id: 'h4', name: 'Zoning Systems', level: 0, xp: 0, xpMax: 200, sessions: 0, status: 'locked' },
    ],
  },
  {
    id: '3', name: 'Plumbing', emoji: '🔧', level: 1, totalXP: 890, color: '#22D3EE',
    skills: [
      { id: 'p1', name: 'PEX Installation', level: 2, xp: 220, xpMax: 300, sessions: 6, status: 'in-progress' },
      { id: 'p2', name: 'Soldering', level: 1, xp: 120, xpMax: 200, sessions: 5, status: 'in-progress' },
      { id: 'p3', name: 'Drain Systems', level: 0, xp: 0, xpMax: 200, sessions: 0, status: 'locked' },
      { id: 'p4', name: 'Gas Lines', level: 0, xp: 0, xpMax: 200, sessions: 0, status: 'locked' },
    ],
  },
];

const LEVEL_LABELS = ['', 'Novice', 'Apprentice', 'Journeyman', 'Advanced', 'Master'];

export default function FieldLensSkillsScreen() {
  const [openTrade, setOpenTrade] = useState<string>('1');

  const totalXP = TRADES.reduce((s, t) => s + t.totalXP, 0);
  const masteredCount = TRADES.flatMap(t => t.skills).filter(s => s.status === 'mastered').length;
  const inProgressCount = TRADES.flatMap(t => t.skills).filter(s => s.status === 'in-progress').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Skill Tree</Text>
          <Text style={styles.subtitle}>Level up your trades</Text>
        </View>

        {/* XP summary */}
        <View style={styles.xpCard}>
          <View style={styles.xpLeft}>
            <Text style={styles.xpTotal}>{totalXP.toLocaleString()}</Text>
            <Text style={styles.xpLabel}>Total XP</Text>
          </View>
          <View style={styles.xpDivider} />
          <View style={styles.xpStats}>
            <View style={styles.xpStat}>
              <Text style={styles.xpStatVal}>{masteredCount}</Text>
              <Text style={styles.xpStatLabel}>Mastered 🏆</Text>
            </View>
            <View style={styles.xpStat}>
              <Text style={styles.xpStatVal}>{inProgressCount}</Text>
              <Text style={styles.xpStatLabel}>In Progress</Text>
            </View>
            <View style={styles.xpStat}>
              <Text style={styles.xpStatVal}>{TRADES.length}</Text>
              <Text style={styles.xpStatLabel}>Trades</Text>
            </View>
          </View>
        </View>

        {/* Badge row */}
        <Text style={styles.sectionTitle}>Earned Badges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
          {[
            { emoji: '🏆', label: 'Load Master', sub: 'NEC calculations' },
            { emoji: '⚡', label: '100 Sessions', sub: 'Milestone' },
            { emoji: '🔥', label: '14-Day Streak', sub: 'Consistency' },
            { emoji: '🎯', label: 'Perfect Score', sub: '100/100 session' },
          ].map(b => (
            <View key={b.label} style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              <Text style={styles.badgeLabel}>{b.label}</Text>
              <Text style={styles.badgeSub}>{b.sub}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Trade sections */}
        <Text style={styles.sectionTitle}>Skill Trees</Text>
        {TRADES.map(trade => {
          const isOpen = openTrade === trade.id;
          return (
            <View key={trade.id} style={styles.tradeSection}>
              <TouchableOpacity
                style={[styles.tradeHeader, { borderLeftColor: trade.color }]}
                onPress={() => setOpenTrade(isOpen ? '' : trade.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.tradeEmoji}>{trade.emoji}</Text>
                <View style={styles.tradeInfo}>
                  <Text style={styles.tradeName}>{trade.name}</Text>
                  <Text style={styles.tradeXP}>{trade.totalXP.toLocaleString()} XP · Level {trade.level}</Text>
                </View>
                <View style={[styles.tradeLevelBadge, { backgroundColor: trade.color + '22', borderColor: trade.color }]}>
                  <Text style={[styles.tradeLevelText, { color: trade.color }]}>Lv {trade.level}</Text>
                </View>
                <Text style={styles.tradeToggle}>{isOpen ? '▾' : '▸'}</Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.skillList}>
                  {trade.skills.map(skill => (
                    <View key={skill.id} style={[styles.skillRow, skill.status === 'locked' && styles.skillRowLocked]}>
                      <View style={styles.skillLeft}>
                        <View style={styles.skillNameRow}>
                          <Text style={[styles.skillName, skill.status === 'locked' && styles.skillNameLocked]}>
                            {skill.status === 'locked' ? '🔒 ' : ''}{skill.name}
                          </Text>
                          {skill.badge && <Text style={styles.skillBadge}>{skill.badge}</Text>}
                        </View>
                        {skill.status !== 'locked' && (
                          <>
                            <Text style={styles.skillMeta}>
                              {LEVEL_LABELS[skill.level]} · {skill.sessions} sessions
                            </Text>
                            <View style={styles.xpBarTrack}>
                              <View style={[styles.xpBarFill, {
                                width: `${(skill.xp / skill.xpMax) * 100}%` as any,
                                backgroundColor: skill.status === 'mastered' ? '#22C55E' : trade.color,
                              }]} />
                            </View>
                            <Text style={styles.xpFraction}>{skill.xp} / {skill.xpMax} XP</Text>
                          </>
                        )}
                      </View>
                      <View style={styles.skillLevelDots}>
                        {[1, 2, 3, 4, 5].map(dot => (
                          <View key={dot} style={[styles.levelDot, dot <= skill.level && { backgroundColor: skill.status === 'mastered' ? '#22C55E' : trade.color }]} />
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 12 },

  xpCard: { backgroundColor: '#161B22', borderRadius: 18, padding: 18, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#21262D' },
  xpLeft: { alignItems: 'center' },
  xpTotal: { fontSize: 32, fontWeight: '900', color: '#F97316' },
  xpLabel: { fontSize: 11, color: '#475569', marginTop: 2 },
  xpDivider: { width: 1, height: 48, backgroundColor: '#21262D' },
  xpStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  xpStat: { alignItems: 'center' },
  xpStatVal: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  xpStatLabel: { fontSize: 10, color: '#475569', marginTop: 2 },

  badgeScroll: { marginBottom: 20 },
  badgeCard: { backgroundColor: '#161B22', borderRadius: 14, padding: 14, marginRight: 10, alignItems: 'center', width: 110, borderWidth: 1, borderColor: '#21262D' },
  badgeEmoji: { fontSize: 28, marginBottom: 6 },
  badgeLabel: { fontSize: 11, fontWeight: '800', color: '#F8FAFC', textAlign: 'center' },
  badgeSub: { fontSize: 10, color: '#475569', marginTop: 2, textAlign: 'center' },

  tradeSection: { marginBottom: 10 },
  tradeHeader: { backgroundColor: '#161B22', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#21262D', borderLeftWidth: 3 },
  tradeEmoji: { fontSize: 24 },
  tradeInfo: { flex: 1 },
  tradeName: { fontSize: 15, fontWeight: '700', color: '#F8FAFC' },
  tradeXP: { fontSize: 11, color: '#475569', marginTop: 2 },
  tradeLevelBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  tradeLevelText: { fontSize: 11, fontWeight: '800' },
  tradeToggle: { fontSize: 16, color: '#475569' },

  skillList: { backgroundColor: '#161B22', borderRadius: 14, marginTop: 2, overflow: 'hidden', borderWidth: 1, borderColor: '#21262D' },
  skillRow: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#21262D', flexDirection: 'row', alignItems: 'center', gap: 12 },
  skillRowLocked: { opacity: 0.45 },
  skillLeft: { flex: 1, gap: 4 },
  skillNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skillName: { fontSize: 13, fontWeight: '700', color: '#F8FAFC' },
  skillNameLocked: { color: '#475569' },
  skillBadge: { fontSize: 14 },
  skillMeta: { fontSize: 10, color: '#475569' },
  xpBarTrack: { height: 5, backgroundColor: '#21262D', borderRadius: 3 },
  xpBarFill: { height: 5, borderRadius: 3 },
  xpFraction: { fontSize: 10, color: '#475569' },
  skillLevelDots: { flexDirection: 'column', gap: 3 },
  levelDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#21262D' },
});
