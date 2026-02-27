import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch } from 'react-native';

const STREAK_CALENDAR = [
  // Last 4 weeks (newest at bottom)
  [true, false, true, true, true, true, false],
  [true, true, true, false, true, true, true],
  [false, true, true, true, true, false, true],
  [true, true, false, true, true, true, true],
];
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const CERT_LEVELS = [
  { id: '1', trade: 'Electrical', level: 'Journeyman (Level 3)', progress: 68, next: 'Master', xpNeeded: 680, color: '#F97316' },
  { id: '2', trade: 'HVAC', level: 'Apprentice (Level 2)', progress: 44, next: 'Journeyman', xpNeeded: 1260, color: '#38BDF8' },
  { id: '3', trade: 'Plumbing', level: 'Novice (Level 1)', progress: 22, next: 'Apprentice', xpNeeded: 1410, color: '#22D3EE' },
];

export default function FieldLensProfileScreen() {
  const [available, setAvailable] = useState(true);
  const [notifSessions, setNotifSessions] = useState(true);
  const [notifCoach, setNotifCoach] = useState(true);

  const currentStreak = 14;
  const totalSessions = 38;
  const totalHoursCoached = 26;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Technician dashboard</Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JR</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Jake Rivera</Text>
              <Text style={styles.profileTrade}>Multi-Trade Technician</Text>
              <Text style={styles.profileSince}>Member since Nov 2024</Text>
            </View>
            <View style={[styles.availBadge, { backgroundColor: available ? '#052E16' : '#1F1F1F' }]}>
              <View style={[styles.availDot, { backgroundColor: available ? '#22C55E' : '#475569' }]} />
              <Text style={[styles.availText, { color: available ? '#22C55E' : '#475569' }]}>
                {available ? 'Active' : 'Away'}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak 🔥</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalHoursCoached}h</Text>
              <Text style={styles.statLabel}>Coached</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>83</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>
        </View>

        {/* Streak calendar */}
        <Text style={styles.sectionTitle}>Practice Streak</Text>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            {DAY_LABELS.map((d, i) => (
              <Text key={i} style={styles.calDayLabel}>{d}</Text>
            ))}
          </View>
          {STREAK_CALENDAR.map((week, wi) => (
            <View key={wi} style={styles.calendarRow}>
              {week.map((active, di) => (
                <View key={di} style={[styles.calCell, active && styles.calCellActive]} />
              ))}
            </View>
          ))}
          <Text style={styles.calFooter}>🔥 {currentStreak}-day streak · Keep it up!</Text>
        </View>

        {/* Certification levels */}
        <Text style={styles.sectionTitle}>Cert Progress</Text>
        {CERT_LEVELS.map(cert => (
          <View key={cert.id} style={[styles.certCard, { borderLeftColor: cert.color }]}>
            <View style={styles.certHeader}>
              <View>
                <Text style={styles.certTrade}>{cert.trade}</Text>
                <Text style={[styles.certLevel, { color: cert.color }]}>{cert.level}</Text>
              </View>
              <Text style={[styles.certPct, { color: cert.color }]}>{cert.progress}%</Text>
            </View>
            <View style={styles.certBarTrack}>
              <View style={[styles.certBarFill, { width: `${cert.progress}%` as any, backgroundColor: cert.color }]} />
            </View>
            <Text style={styles.certNext}>→ {cert.xpNeeded} XP to {cert.next}</Text>
          </View>
        ))}

        {/* Availability toggle */}
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Available for Coaching</Text>
              <Text style={styles.settingSub}>Toggle your training availability</Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ false: '#21262D', true: '#F97316' }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.settingRow, styles.settingRowBorder]}>
            <View>
              <Text style={styles.settingLabel}>Session reminders</Text>
              <Text style={styles.settingSub}>Daily at 6:00 PM</Text>
            </View>
            <Switch
              value={notifSessions}
              onValueChange={setNotifSessions}
              trackColor={{ false: '#21262D', true: '#F97316' }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.settingRow, styles.settingRowBorder]}>
            <View>
              <Text style={styles.settingLabel}>AI Coach feedback</Text>
              <Text style={styles.settingSub}>Instant post-session analysis</Text>
            </View>
            <Switch
              value={notifCoach}
              onValueChange={setNotifCoach}
              trackColor={{ false: '#21262D', true: '#F97316' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Export */}
        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>📄 Export Training Record PDF</Text>
        </TouchableOpacity>

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

  profileCard: { backgroundColor: '#161B22', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#21262D' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  profileTrade: { fontSize: 13, color: '#F97316', marginTop: 2, fontWeight: '600' },
  profileSince: { fontSize: 11, color: '#475569', marginTop: 2 },
  availBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  availDot: { width: 7, height: 7, borderRadius: 4 },
  availText: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#21262D' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#F97316' },
  statLabel: { fontSize: 10, color: '#475569', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: '#21262D' },

  calendarCard: { backgroundColor: '#161B22', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#21262D' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  calDayLabel: { fontSize: 11, color: '#475569', fontWeight: '700', width: 24, textAlign: 'center' },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5 },
  calCell: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#21262D' },
  calCellActive: { backgroundColor: '#F97316' },
  calFooter: { fontSize: 12, color: '#F97316', marginTop: 10, textAlign: 'center', fontWeight: '600' },

  certCard: { backgroundColor: '#161B22', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#21262D', borderLeftWidth: 3, gap: 8 },
  certHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  certTrade: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  certLevel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  certPct: { fontSize: 22, fontWeight: '900' },
  certBarTrack: { height: 6, backgroundColor: '#21262D', borderRadius: 3 },
  certBarFill: { height: 6, borderRadius: 3 },
  certNext: { fontSize: 11, color: '#475569' },

  settingsCard: { backgroundColor: '#161B22', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#21262D', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  settingRowBorder: { borderTopWidth: 1, borderTopColor: '#21262D' },
  settingLabel: { fontSize: 13, fontWeight: '600', color: '#F8FAFC' },
  settingSub: { fontSize: 11, color: '#475569', marginTop: 2 },

  exportBtn: { backgroundColor: '#161B22', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#21262D' },
  exportBtnText: { color: '#F97316', fontWeight: '700', fontSize: 13 },
});
