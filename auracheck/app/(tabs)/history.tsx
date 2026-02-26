import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type CheckEntry = {
  id: string;
  date: string;
  dayLabel: string;
  score: number;
  delta: number;
  flags: string[];
  zones: { name: string; status: 'clear' | 'mild' | 'moderate' | 'severe' }[];
};

const HISTORY: CheckEntry[] = [
  { id: '1', date: 'Feb 22', dayLabel: 'Today', score: 74, delta: +3, flags: [], zones: [{ name: 'Forehead', status: 'clear' }, { name: 'Cheeks', status: 'mild' }, { name: 'Chin', status: 'clear' }, { name: 'Nose', status: 'mild' }] },
  { id: '2', date: 'Feb 21', dayLabel: 'Yesterday', score: 71, delta: -2, flags: ['Redness increase'], zones: [{ name: 'Forehead', status: 'clear' }, { name: 'Cheeks', status: 'moderate' }, { name: 'Chin', status: 'mild' }, { name: 'Nose', status: 'mild' }] },
  { id: '3', date: 'Feb 20', dayLabel: 'Thu', score: 73, delta: +1, flags: [], zones: [{ name: 'Forehead', status: 'mild' }, { name: 'Cheeks', status: 'mild' }, { name: 'Chin', status: 'clear' }, { name: 'Nose', status: 'clear' }] },
  { id: '4', date: 'Feb 19', dayLabel: 'Wed', score: 72, delta: +5, flags: [], zones: [{ name: 'Forehead', status: 'mild' }, { name: 'Cheeks', status: 'mild' }, { name: 'Chin', status: 'clear' }, { name: 'Nose', status: 'clear' }] },
  { id: '5', date: 'Feb 18', dayLabel: 'Tue', score: 67, delta: -4, flags: ['New breakout detected', 'Inflammation elevated'], zones: [{ name: 'Forehead', status: 'moderate' }, { name: 'Cheeks', status: 'moderate' }, { name: 'Chin', status: 'severe' }, { name: 'Nose', status: 'mild' }] },
  { id: '6', date: 'Feb 17', dayLabel: 'Mon', score: 71, delta: +2, flags: [], zones: [{ name: 'Forehead', status: 'clear' }, { name: 'Cheeks', status: 'mild' }, { name: 'Chin', status: 'moderate' }, { name: 'Nose', status: 'clear' }] },
  { id: '7', date: 'Feb 16', dayLabel: 'Sun', score: 69, delta: -1, flags: ['Dry patch noted'], zones: [{ name: 'Forehead', status: 'mild' }, { name: 'Cheeks', status: 'clear' }, { name: 'Chin', status: 'mild' }, { name: 'Nose', status: 'moderate' }] },
  { id: '8', date: 'Feb 15', dayLabel: 'Sat', score: 70, delta: +3, flags: [], zones: [{ name: 'Forehead', status: 'clear' }, { name: 'Cheeks', status: 'mild' }, { name: 'Chin', status: 'mild' }, { name: 'Nose', status: 'clear' }] },
  { id: '9', date: 'Feb 14', dayLabel: 'Fri', score: 67, delta: 0, flags: [], zones: [{ name: 'Forehead', status: 'mild' }, { name: 'Cheeks', status: 'moderate' }, { name: 'Chin', status: 'mild' }, { name: 'Nose', status: 'mild' }] },
  { id: '10', date: 'Feb 13', dayLabel: 'Thu', score: 67, delta: -3, flags: ['Hormonal flare'], zones: [{ name: 'Forehead', status: 'moderate' }, { name: 'Cheeks', status: 'severe' }, { name: 'Chin', status: 'moderate' }, { name: 'Nose', status: 'mild' }] },
  { id: '11', date: 'Feb 12', dayLabel: 'Wed', score: 70, delta: +2, flags: [], zones: [{ name: 'Forehead', status: 'clear' }, { name: 'Cheeks', status: 'moderate' }, { name: 'Chin', status: 'mild' }, { name: 'Nose', status: 'clear' }] },
  { id: '12', date: 'Feb 11', dayLabel: 'Tue', score: 68, delta: -2, flags: ['Sensitivity spike'], zones: [{ name: 'Forehead', status: 'mild' }, { name: 'Cheeks', status: 'moderate' }, { name: 'Chin', status: 'mild' }, { name: 'Nose', status: 'moderate' }] },
  { id: '13', date: 'Feb 10', dayLabel: 'Mon', score: 70, delta: +1, flags: [], zones: [{ name: 'Forehead', status: 'clear' }, { name: 'Cheeks', status: 'mild' }, { name: 'Chin', status: 'clear' }, { name: 'Nose', status: 'clear' }] },
  { id: '14', date: 'Feb 9', dayLabel: 'Sun', score: 69, delta: -1, flags: [], zones: [{ name: 'Forehead', status: 'mild' }, { name: 'Cheeks', status: 'mild' }, { name: 'Chin', status: 'clear' }, { name: 'Nose', status: 'mild' }] },
];

const STATUS_COLORS: Record<string, string> = {
  clear: '#A21CAF',
  mild: '#F0ABFC',
  moderate: '#F97316',
  severe: '#DC2626',
};
const STATUS_BG: Record<string, string> = {
  clear: '#FDF4FF',
  mild: '#FAE8FF',
  moderate: '#FFF7ED',
  severe: '#FEF2F2',
};

const WEEK_SCORES = HISTORY.slice(0, 7).reverse();
const maxScore = 100;

export default function AuraHistoryScreen() {
  const [expanded, setExpanded] = useState<string | null>('1');

  const trend7 = HISTORY[0].score - HISTORY[6].score;
  const avg7 = Math.round(HISTORY.slice(0, 7).reduce((s, h) => s + h.score, 0) / 7);
  const flagCount = HISTORY.filter(h => h.flags.length > 0).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Skin History</Text>
          <Text style={styles.subtitle}>14-day scan log</Text>
        </View>

        {/* Hero stats */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroScore}>{HISTORY[0].score}</Text>
            <Text style={styles.heroScoreLabel}>Today's Score</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{avg7}</Text>
              <Text style={styles.heroStatLabel}>7-Day Avg</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatVal, { color: trend7 >= 0 ? '#A21CAF' : '#F97316' }]}>
                {trend7 >= 0 ? '+' : ''}{trend7}
              </Text>
              <Text style={styles.heroStatLabel}>Week Trend</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatVal, { color: flagCount > 0 ? '#F97316' : '#A21CAF' }]}>{flagCount}</Text>
              <Text style={styles.heroStatLabel}>Alerts</Text>
            </View>
          </View>
        </View>

        {/* Mini trend chart */}
        <Text style={styles.sectionTitle}>7-Day Trend</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartBars}>
            {WEEK_SCORES.map((entry, i) => (
              <View key={entry.id} style={styles.chartBarCol}>
                <Text style={styles.chartScore}>{entry.score}</Text>
                <View style={styles.chartBarTrack}>
                  <View style={[styles.chartBarFill, {
                    height: `${(entry.score / maxScore) * 100}%` as any,
                    backgroundColor: entry.score >= 72 ? '#A21CAF' : entry.score >= 68 ? '#C084FC' : '#F97316',
                  }]} />
                </View>
                <Text style={styles.chartDayLabel}>{entry.dayLabel.substring(0, 3)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily entries */}
        <Text style={styles.sectionTitle}>Daily Log</Text>
        {HISTORY.map(entry => {
          const isOpen = expanded === entry.id;
          const hasFlags = entry.flags.length > 0;
          return (
            <TouchableOpacity
              key={entry.id}
              style={[styles.entryCard, hasFlags && styles.entryCardFlagged]}
              onPress={() => setExpanded(isOpen ? null : entry.id)}
              activeOpacity={0.85}
            >
              <View style={styles.entryTop}>
                <View style={styles.entryLeft}>
                  <View style={styles.entryPhotoPlaceholder}>
                    <Text style={styles.entryPhotoEmoji}>🪷</Text>
                  </View>
                  <View>
                    <Text style={styles.entryDayLabel}>{entry.dayLabel}</Text>
                    <Text style={styles.entryDate}>{entry.date}</Text>
                  </View>
                </View>
                <View style={styles.entryRight}>
                  {hasFlags && <Text style={styles.flagIcon}>⚠️</Text>}
                  <Text style={[styles.entryScore, { color: entry.score >= 72 ? '#A21CAF' : entry.score >= 68 ? '#C084FC' : '#F97316' }]}>
                    {entry.score}
                  </Text>
                  <Text style={[styles.entryDelta, { color: entry.delta > 0 ? '#A21CAF' : entry.delta < 0 ? '#F97316' : '#94A3B8' }]}>
                    {entry.delta > 0 ? '↑' : entry.delta < 0 ? '↓' : '→'}{Math.abs(entry.delta)}
                  </Text>
                </View>
              </View>

              {isOpen && (
                <View style={styles.entryExpanded}>
                  {entry.flags.map((flag, fi) => (
                    <View key={fi} style={styles.flagRow}>
                      <Text style={styles.flagDot}>⚠️</Text>
                      <Text style={styles.flagText}>{flag}</Text>
                    </View>
                  ))}
                  <View style={styles.zonesGrid}>
                    {entry.zones.map(zone => (
                      <View key={zone.name} style={[styles.zoneChip, { backgroundColor: STATUS_BG[zone.status] }]}>
                        <View style={[styles.zoneDot, { backgroundColor: STATUS_COLORS[zone.status] }]} />
                        <Text style={styles.zoneName}>{zone.name}</Text>
                        <Text style={[styles.zoneStatus, { color: STATUS_COLORS[zone.status] }]}>{zone.status}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

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

  heroCard: { backgroundColor: '#FDF4FF', borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1.5, borderColor: '#E9D5FF' },
  heroLeft: { alignItems: 'center' },
  heroScore: { fontSize: 42, fontWeight: '900', color: '#A21CAF' },
  heroScoreLabel: { fontSize: 11, color: '#C084FC', marginTop: 2 },
  heroDivider: { width: 1, height: 48, backgroundColor: '#E9D5FF' },
  heroStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  heroStat: { alignItems: 'center' },
  heroStatVal: { fontSize: 22, fontWeight: '800', color: '#701A75' },
  heroStatLabel: { fontSize: 11, color: '#C084FC', marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#701A75', marginBottom: 12 },

  chartCard: { backgroundColor: '#FDF4FF', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E9D5FF' },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 90 },
  chartBarCol: { flex: 1, alignItems: 'center', gap: 4 },
  chartScore: { fontSize: 9, color: '#A21CAF', fontWeight: '700' },
  chartBarTrack: { width: 24, height: 60, backgroundColor: '#F3E8FF', borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  chartBarFill: { width: '100%', borderRadius: 6 },
  chartDayLabel: { fontSize: 9, color: '#C084FC', fontWeight: '600' },

  entryCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E9D5FF' },
  entryCardFlagged: { borderColor: '#F9A8D4', borderLeftWidth: 3, borderLeftColor: '#F97316' },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  entryPhotoPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FAE8FF', alignItems: 'center', justifyContent: 'center' },
  entryPhotoEmoji: { fontSize: 22 },
  entryDayLabel: { fontSize: 14, fontWeight: '700', color: '#701A75' },
  entryDate: { fontSize: 11, color: '#C084FC', marginTop: 1 },
  entryRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flagIcon: { fontSize: 14 },
  entryScore: { fontSize: 22, fontWeight: '900' },
  entryDelta: { fontSize: 12, fontWeight: '700' },
  entryExpanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3E8FF', gap: 8 },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flagDot: { fontSize: 12 },
  flagText: { fontSize: 12, color: '#F97316', fontWeight: '600' },
  zonesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  zoneChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  zoneDot: { width: 7, height: 7, borderRadius: 4 },
  zoneName: { fontSize: 11, color: '#701A75', fontWeight: '600' },
  zoneStatus: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
});
