'use client';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useVaultStore } from '../../store/vault-store';

const SAGE = '#5B8C5A';
const GOLD = '#C4A35A';
const CREAM = '#FDFBF7';
const IVORY = '#E8DFD0';
const TEXT = '#2D3B2C';
const TEXT2 = '#6B7B6A';

function CompletionRing({ pct }: { pct: number }) {
  const size = 160;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      {/* SVG-like ring using border technique */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: stroke, borderColor: IVORY }} />
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: stroke, borderColor: SAGE, borderRightColor: 'transparent', borderBottomColor: pct > 50 ? SAGE : 'transparent', transform: [{ rotate: `${(pct / 100) * 360}deg` }] }} />
      <View style={ring.inner}>
        <Text style={ring.pct}>{pct}%</Text>
        <Text style={ring.label}>Complete</Text>
      </View>
    </View>
  );
}

const ring = StyleSheet.create({
  inner: { alignItems: 'center', justifyContent: 'center' },
  pct: { fontSize: 36, fontWeight: '700', color: SAGE },
  label: { fontSize: 12, color: TEXT2, fontWeight: '500', marginTop: -2 },
});

const CATEGORY_LABELS: Record<string, { label: string; icon: string; done: boolean }> = {
  will: { label: 'Will & Testament', icon: '📜', done: true },
  financial: { label: 'Financial Accounts', icon: '🏦', done: true },
  healthcare: { label: 'Healthcare Directive', icon: '🏥', done: true },
  letters: { label: 'Personal Letters', icon: '✉️', done: true },
  digital: { label: 'Digital Assets', icon: '🔑', done: true },
  insurance: { label: 'Insurance', icon: '🛡️', done: true },
};

export default function HomeScreen() {
  const { completionPct, documents, trustedPeople } = useVaultStore();
  const router = useRouter();

  const covered = new Set(documents.map(d => d.category));
  const nudge = !covered.has('property')
    ? 'Add your property deed and mortgage documents to complete your vault.'
    : trustedPeople.length < 2
    ? 'Consider adding a backup trusted contact in case your primary person is unavailable.'
    : 'Your legacy plan is looking great. Review it annually to keep it current.';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <Text style={s.logoIcon}>🌿</Text>
            <Text style={s.logoText}>Mortal</Text>
          </View>
          <Text style={s.tagline}>Your legacy, thoughtfully organized.</Text>
        </View>

        {/* Completion Ring */}
        <View style={s.ringCard}>
          <CompletionRing pct={completionPct} />
          <Text style={s.ringTitle}>Legacy Plan</Text>
          <Text style={s.ringSubtitle}>{Object.keys(CATEGORY_LABELS).filter(k => covered.has(k as any)).length} of {Object.keys(CATEGORY_LABELS).length} categories complete</Text>
        </View>

        {/* Gentle nudge */}
        <View style={s.nudgeCard}>
          <Text style={s.nudgeIcon}>💛</Text>
          <Text style={s.nudgeText}>{nudge}</Text>
        </View>

        {/* Progress Checklist */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>What You've Organized</Text>
          {Object.entries(CATEGORY_LABELS).map(([key, { label, icon, done }]) => {
            const isDone = covered.has(key as any);
            return (
              <View key={key} style={s.checkRow}>
                <View style={[s.checkDot, isDone && s.checkDotDone]}>
                  {isDone && <Text style={s.checkMark}>✓</Text>}
                </View>
                <Text style={s.checkIcon}>{icon}</Text>
                <Text style={[s.checkLabel, !isDone && s.checkLabelGray]}>{label}</Text>
                {!isDone && (
                  <TouchableOpacity style={s.addBtn} onPress={() => router.push('/(tabs)/vault')}>
                    <Text style={s.addBtnText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <View style={s.actionsGrid}>
            {[
              { label: 'Open Vault', icon: '🔒', route: '/(tabs)/vault' },
              { label: 'Ask Guide', icon: '💬', route: '/(tabs)/guide' },
              { label: 'Trusted People', icon: '👥', route: '/(tabs)/share' },
              { label: 'Write Letter', icon: '✉️', route: '/(tabs)/vault' },
            ].map(a => (
              <TouchableOpacity key={a.label} style={s.actionCard} onPress={() => router.push(a.route as any)}>
                <Text style={s.actionIcon}>{a.icon}</Text>
                <Text style={s.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trust banner */}
        <View style={s.trustBanner}>
          <Text style={s.trustIcon}>🔐</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.trustTitle}>End-to-end encrypted</Text>
            <Text style={s.trustSubtitle}>Your documents are encrypted on your device before any upload. Only you and your trusted people can access them.</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  scroll: { flex: 1 },
  content: { padding: 24 },
  header: { marginBottom: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  logoIcon: { fontSize: 24 },
  logoText: { fontSize: 26, fontWeight: '800', color: SAGE },
  tagline: { fontSize: 15, color: TEXT2, fontWeight: '400' },
  ringCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: IVORY, shadowColor: SAGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  ringTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginTop: 16 },
  ringSubtitle: { fontSize: 13, color: TEXT2, marginTop: 4 },
  nudgeCard: { backgroundColor: '#FFFBF0', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 24, borderWidth: 1, borderColor: '#F0E4C0' },
  nudgeIcon: { fontSize: 20 },
  nudgeText: { flex: 1, fontSize: 14, color: '#92752A', lineHeight: 20, fontWeight: '500' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: TEXT, marginBottom: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: IVORY },
  checkDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: IVORY, alignItems: 'center', justifyContent: 'center' },
  checkDotDone: { backgroundColor: SAGE, borderColor: SAGE },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  checkIcon: { fontSize: 18 },
  checkLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: TEXT },
  checkLabelGray: { color: TEXT2 },
  addBtn: { backgroundColor: SAGE, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: IVORY },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: TEXT, textAlign: 'center' },
  trustBanner: { backgroundColor: '#F0F5F0', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: '#D4E4D3' },
  trustIcon: { fontSize: 24 },
  trustTitle: { fontSize: 14, fontWeight: '700', color: SAGE, marginBottom: 4 },
  trustSubtitle: { fontSize: 13, color: TEXT2, lineHeight: 18 },
});
