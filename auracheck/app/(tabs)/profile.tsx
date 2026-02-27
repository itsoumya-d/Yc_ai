import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch } from 'react-native';

type SkinConcern = { id: string; label: string; active: boolean; emoji: string };
type RoutineStep = { id: string; time: 'AM' | 'PM'; product: string; type: string; streakDays: number };

const CONCERNS_DATA: SkinConcern[] = [
  { id: '1', label: 'Acne', active: true, emoji: '🔴' },
  { id: '2', label: 'Redness', active: true, emoji: '🌸' },
  { id: '3', label: 'Dryness', active: true, emoji: '💧' },
  { id: '4', label: 'Dark Spots', active: false, emoji: '🟤' },
  { id: '5', label: 'Fine Lines', active: false, emoji: '〰️' },
  { id: '6', label: 'Oiliness', active: false, emoji: '✨' },
  { id: '7', label: 'Sensitivity', active: true, emoji: '🌡️' },
  { id: '8', label: 'Texture', active: false, emoji: '🌀' },
];

const ROUTINE: RoutineStep[] = [
  { id: '1', time: 'AM', product: 'CeraVe Hydrating Cleanser', type: 'Cleanser', streakDays: 14 },
  { id: '2', time: 'AM', product: 'Paula\'s Choice Niacinamide 10%', type: 'Serum', streakDays: 10 },
  { id: '3', time: 'AM', product: 'Neutrogena Hydro Boost', type: 'Moisturizer', streakDays: 14 },
  { id: '4', time: 'AM', product: 'EltaMD UV Clear SPF 46', type: 'Sunscreen', streakDays: 9 },
  { id: '5', time: 'PM', product: 'La Roche-Posay Toleriane', type: 'Cleanser', streakDays: 14 },
  { id: '6', time: 'PM', product: 'The Ordinary Retinol 0.5%', type: 'Retinol', streakDays: 7 },
  { id: '7', time: 'PM', product: 'First Aid Beauty Ultra Repair', type: 'Moisturizer', streakDays: 12 },
];

const NOTIFICATION_SETTINGS = [
  { id: 'daily_reminder', label: 'Daily check reminder', sub: '8:00 AM every morning', enabled: true },
  { id: 'weekly_report', label: 'Weekly AI report', sub: 'Every Sunday at 9:00 AM', enabled: true },
  { id: 'flag_alerts', label: 'Skin change alerts', sub: 'When AI detects significant changes', enabled: true },
  { id: 'routine_reminder', label: 'Routine reminders', sub: 'AM 7:30 · PM 9:30', enabled: false },
  { id: 'tips', label: 'Personalized tips', sub: '3x per week', enabled: false },
];

export default function AuraProfileScreen() {
  const [concerns, setConcerns] = useState<SkinConcern[]>(CONCERNS_DATA);
  const [notifs, setNotifs] = useState(NOTIFICATION_SETTINGS);
  const [skinType, setSkinType] = useState<'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'>('combination');

  const toggleConcern = (id: string) => {
    setConcerns(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };
  const toggleNotif = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  const SKIN_TYPES: { key: typeof skinType; label: string }[] = [
    { key: 'dry', label: 'Dry' },
    { key: 'oily', label: 'Oily' },
    { key: 'combination', label: 'Combo' },
    { key: 'normal', label: 'Normal' },
    { key: 'sensitive', label: 'Sensitive' },
  ];

  const amSteps = ROUTINE.filter(r => r.time === 'AM');
  const pmSteps = ROUTINE.filter(r => r.time === 'PM');
  const avgStreak = Math.round(ROUTINE.reduce((s, r) => s + r.streakDays, 0) / ROUTINE.length);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Skin profile & preferences</Text>
        </View>

        {/* Avatar + stats */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🪷</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sarah M.</Text>
            <Text style={styles.profileSince}>Tracking since Oct 2024 · 135 scans</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakNum}>14</Text>
            <Text style={styles.streakLabel}>Day streak 🔥</Text>
          </View>
        </View>

        {/* Skin type */}
        <Text style={styles.sectionTitle}>Skin Type</Text>
        <View style={styles.skinTypeRow}>
          {SKIN_TYPES.map(st => (
            <TouchableOpacity
              key={st.key}
              style={[styles.skinTypeBtn, skinType === st.key && styles.skinTypeBtnActive]}
              onPress={() => setSkinType(st.key)}
            >
              <Text style={[styles.skinTypeBtnText, skinType === st.key && styles.skinTypeBtnTextActive]}>
                {st.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Concerns */}
        <Text style={styles.sectionTitle}>Active Concerns</Text>
        <View style={styles.concernsGrid}>
          {concerns.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.concernChip, c.active && styles.concernChipActive]}
              onPress={() => toggleConcern(c.id)}
            >
              <Text style={styles.concernEmoji}>{c.emoji}</Text>
              <Text style={[styles.concernLabel, c.active && styles.concernLabelActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Routine tracking */}
        <View style={styles.routineHeader}>
          <Text style={styles.sectionTitle}>My Skincare Routine</Text>
          <View style={styles.routineStreakBadge}>
            <Text style={styles.routineStreakText}>~{avgStreak}d avg streak</Text>
          </View>
        </View>

        <Text style={styles.routineTime}>☀️ Morning</Text>
        {amSteps.map(step => (
          <View key={step.id} style={styles.routineCard}>
            <View style={styles.routineLeft}>
              <Text style={styles.routineType}>{step.type}</Text>
              <Text style={styles.routineProduct}>{step.product}</Text>
            </View>
            <View style={styles.routineRight}>
              <Text style={styles.routineStreak}>{step.streakDays}d 🔥</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.routineTime, { marginTop: 8 }]}>🌙 Evening</Text>
        {pmSteps.map(step => (
          <View key={step.id} style={styles.routineCard}>
            <View style={styles.routineLeft}>
              <Text style={styles.routineType}>{step.type}</Text>
              <Text style={styles.routineProduct}>{step.product}</Text>
            </View>
            <View style={styles.routineRight}>
              <Text style={styles.routineStreak}>{step.streakDays}d 🔥</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addProductBtn}>
          <Text style={styles.addProductBtnText}>+ Add Product</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Notifications</Text>
        <View style={styles.notifsCard}>
          {notifs.map((n, i) => (
            <View key={n.id} style={[styles.notifRow, i < notifs.length - 1 && styles.notifRowBorder]}>
              <View style={styles.notifInfo}>
                <Text style={styles.notifLabel}>{n.label}</Text>
                <Text style={styles.notifSub}>{n.sub}</Text>
              </View>
              <Switch
                value={n.enabled}
                onValueChange={() => toggleNotif(n.id)}
                trackColor={{ false: '#E9D5FF', true: '#A21CAF' }}
                thumbColor="#FFF"
              />
            </View>
          ))}
        </View>

        {/* Account */}
        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>📤 Export 30-Day Skin Report (PDF)</Text>
        </TouchableOpacity>

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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#701A75', marginBottom: 12 },

  profileCard: { backgroundColor: '#FDF4FF', borderRadius: 20, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#E9D5FF' },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FAE8FF', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 30 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '800', color: '#701A75' },
  profileSince: { fontSize: 11, color: '#C084FC', marginTop: 2 },
  streakBadge: { alignItems: 'center', backgroundColor: '#FAE8FF', borderRadius: 12, padding: 10 },
  streakNum: { fontSize: 22, fontWeight: '900', color: '#A21CAF' },
  streakLabel: { fontSize: 10, color: '#C084FC' },

  skinTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  skinTypeBtn: { flex: 1, minWidth: 60, backgroundColor: '#FFF', borderRadius: 20, paddingVertical: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#E9D5FF' },
  skinTypeBtnActive: { backgroundColor: '#A21CAF', borderColor: '#A21CAF' },
  skinTypeBtnText: { fontSize: 12, fontWeight: '700', color: '#9333EA' },
  skinTypeBtnTextActive: { color: '#FFF' },

  concernsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  concernChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5, borderColor: '#E9D5FF' },
  concernChipActive: { backgroundColor: '#FAE8FF', borderColor: '#A21CAF' },
  concernEmoji: { fontSize: 14 },
  concernLabel: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  concernLabelActive: { color: '#701A75' },

  routineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  routineStreakBadge: { backgroundColor: '#FAE8FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  routineStreakText: { fontSize: 11, color: '#A21CAF', fontWeight: '700' },
  routineTime: { fontSize: 13, fontWeight: '700', color: '#9333EA', marginBottom: 8 },
  routineCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E9D5FF' },
  routineLeft: { flex: 1 },
  routineType: { fontSize: 10, fontWeight: '700', color: '#C084FC', textTransform: 'uppercase', marginBottom: 2 },
  routineProduct: { fontSize: 13, fontWeight: '600', color: '#701A75' },
  routineRight: {},
  routineStreak: { fontSize: 12, fontWeight: '700', color: '#A21CAF' },
  addProductBtn: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#A21CAF', borderStyle: 'dashed', marginBottom: 20 },
  addProductBtnText: { color: '#A21CAF', fontWeight: '700', fontSize: 14 },

  notifsCard: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E9D5FF', overflow: 'hidden' },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, gap: 10 },
  notifRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3E8FF' },
  notifInfo: { flex: 1 },
  notifLabel: { fontSize: 13, fontWeight: '600', color: '#701A75' },
  notifSub: { fontSize: 11, color: '#C084FC', marginTop: 2 },

  exportBtn: { backgroundColor: '#FAE8FF', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E9D5FF' },
  exportBtnText: { color: '#A21CAF', fontWeight: '700', fontSize: 13 },
});
