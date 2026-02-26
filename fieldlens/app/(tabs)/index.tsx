import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const TRADE_TYPES = ['Electrician', 'Plumber', 'HVAC', 'Carpenter', 'Welder', 'Mason'];

const RECENT_SESSIONS = [
  { id: '1', trade: 'Electrical', task: 'Panel Wiring', date: 'Today', duration: '24 min', score: 94, improvement: '+12%' },
  { id: '2', trade: 'Electrical', task: 'Conduit Bending', date: 'Yesterday', duration: '18 min', score: 87, improvement: '+8%' },
  { id: '3', trade: 'Electrical', task: 'Junction Box Install', date: '2 days ago', duration: '31 min', score: 91, improvement: '+5%' },
];

const SKILLS = [
  { name: 'Wire Termination', level: 82, trend: 'up' },
  { name: 'Panel Organization', level: 76, trend: 'up' },
  { name: 'Conduit Bending', level: 68, trend: 'flat' },
  { name: 'Load Calculation', level: 71, trend: 'up' },
];
export default function CoachScreen() {
  const [selectedTrade, setSelectedTrade] = useState('Electrician');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, Marcus</Text>
            <Text style={styles.subtitle}>Ready for your coaching session?</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNum}>12</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        <View style={styles.coachCard}>
          <View style={styles.coachCardBg}>
            <View style={styles.cameraPreview}>
              <Text style={styles.cameraIcon}>📷</Text>
              <View style={styles.aiOverlay}>
                <View style={styles.aiDot} />
                <Text style={styles.aiLabel}>AI Ready</Text>
              </View>
              <View style={[styles.detectionBox, { top: 30, left: 20, width: 80, height: 60 }]} />
              <View style={[styles.detectionBox, { top: 50, right: 20, width: 60, height: 80, borderColor: '#22C55E' }]} />
            </View>
          </View>
          <View style={styles.coachCardContent}>
            <Text style={styles.coachTitle}>AI Coaching Session</Text>
            <Text style={styles.coachDesc}>Point your camera at your work. FieldLens AI analyzes technique, safety, and efficiency in real time.</Text>
            <View style={styles.coachFeatures}>
              {['Real-time feedback', 'Voice coaching', 'Safety alerts'].map(f => (
                <Text key={f} style={styles.coachFeature}>✓ {f}</Text>
              ))}
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/coach')}>
              <Text style={styles.startBtnText}>Start Session</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Your Trade</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tradeScroll}>
          {TRADE_TYPES.map(trade => (
            <TouchableOpacity
              key={trade}
              style={[styles.tradePill, selectedTrade === trade && styles.tradePillActive]}
              onPress={() => setSelectedTrade(trade)}
            >
              <Text style={[styles.tradePillText, selectedTrade === trade && styles.tradePillTextActive]}>{trade}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Skill Progress</Text>
        <View style={styles.skillsCard}>
          {SKILLS.map(skill => (
            <View key={skill.name} style={styles.skillRow}>
              <View style={styles.skillMeta}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={[styles.skillTrend, { color: skill.trend === 'up' ? '#22C55E' : '#F97316' }]}>
                  {skill.trend === 'up' ? '↑' : '→'}
                </Text>
              </View>
              <View style={styles.skillBarBg}>
                <View style={[styles.skillBarFill, { width: (skill.level + '%') as any }]} />
              </View>
              <Text style={styles.skillLevel}>{skill.level}%</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {RECENT_SESSIONS.map(session => (
          <TouchableOpacity key={session.id} style={styles.sessionCard} onPress={() => router.push('/sessions')}>
            <View style={styles.sessionLeft}>
              <Text style={styles.sessionTask}>{session.task}</Text>
              <Text style={styles.sessionMeta}>{session.trade} · {session.duration} · {session.date}</Text>
            </View>
            <View style={styles.sessionRight}>
              <Text style={styles.sessionScore}>{session.score}</Text>
              <Text style={styles.sessionImprovement}>{session.improvement}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1117' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 20, paddingBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#E6EDF3', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8B949E' },
  streakBadge: { backgroundColor: '#1C2128', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F97316' },
  streakEmoji: { fontSize: 18 },
  streakNum: { fontSize: 20, fontWeight: '800', color: '#F97316' },
  streakLabel: { fontSize: 9, color: '#8B949E' },
  coachCard: { backgroundColor: '#161B22', borderRadius: 16, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#21262D' },
  coachCardBg: { height: 160, backgroundColor: '#0D1117' },
  cameraPreview: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cameraIcon: { fontSize: 48, opacity: 0.3 },
  aiOverlay: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(249,115,22,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 6, borderWidth: 1, borderColor: '#F97316' },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316' },
  aiLabel: { color: '#F97316', fontSize: 11, fontWeight: '700' },
  detectionBox: { position: 'absolute', borderWidth: 1.5, borderColor: '#F97316', borderRadius: 4 },
  coachCardContent: { padding: 16 },
  coachTitle: { fontSize: 18, fontWeight: '800', color: '#E6EDF3', marginBottom: 6 },
  coachDesc: { fontSize: 13, color: '#8B949E', lineHeight: 19, marginBottom: 12 },
  coachFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  coachFeature: { fontSize: 12, color: '#22C55E' },
  startBtn: { backgroundColor: '#F97316', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#E6EDF3', marginBottom: 12 },
  tradeScroll: { marginBottom: 24 },
  tradePill: { backgroundColor: '#161B22', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#21262D' },
  tradePillActive: { backgroundColor: '#F97316', borderColor: '#F97316' },
  tradePillText: { color: '#8B949E', fontSize: 13, fontWeight: '600' },
  tradePillTextActive: { color: '#fff' },
  skillsCard: { backgroundColor: '#161B22', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#21262D', gap: 14 },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  skillMeta: { width: 140, flexDirection: 'row', alignItems: 'center', gap: 4 },
  skillName: { fontSize: 13, color: '#C9D1D9', flex: 1 },
  skillTrend: { fontSize: 14, fontWeight: '700' },
  skillBarBg: { flex: 1, height: 6, backgroundColor: '#21262D', borderRadius: 3 },
  skillBarFill: { height: 6, backgroundColor: '#F97316', borderRadius: 3 },
  skillLevel: { width: 36, fontSize: 12, color: '#8B949E', textAlign: 'right' },
  sessionCard: { backgroundColor: '#161B22', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#21262D' },
  sessionLeft: { flex: 1 },
  sessionTask: { fontSize: 15, fontWeight: '700', color: '#E6EDF3', marginBottom: 3 },
  sessionMeta: { fontSize: 12, color: '#8B949E' },
  sessionRight: { alignItems: 'flex-end' },
  sessionScore: { fontSize: 24, fontWeight: '800', color: '#22C55E' },
  sessionImprovement: { fontSize: 12, color: '#22C55E' },
});
