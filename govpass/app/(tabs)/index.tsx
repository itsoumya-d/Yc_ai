import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEligibilityStore } from '../../store/eligibility-store';

const CIVIC_BLUE = '#1E40AF';
const CIVIC_GREEN = '#059669';
const BG = '#F9FAFB';
const AMBER = '#D97706';

export default function HomeScreen() {
  const { profile, results, applications, computeResults } = useEligibilityStore();
  const router = useRouter();

  const likelyCount = results.filter(r => r.eligibility === 'likely').length;
  const maybeCount = results.filter(r => r.eligibility === 'maybe').length;
  const totalValue = results
    .filter(r => r.eligibility === 'likely' && r.estimatedMonthlyBenefit)
    .reduce((sum, r) => sum + (r.estimatedMonthlyBenefit ?? 0), 0);

  const hasProfile = profile.householdSize > 0;
  const pendingApps = applications.filter(a => a.status !== 'approved' && a.status !== 'denied');

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <Text style={s.logoIcon}>🏛️</Text>
            <Text style={s.logoText}>GovPass</Text>
          </View>
          <Text style={s.tagline}>Find benefits you qualify for</Text>
          <Text style={s.taglineEs}>Encuentre beneficios para los que califica</Text>
        </View>

        {/* Eligibility hero */}
        {hasProfile ? (
          <View style={s.heroCard}>
            <View style={s.heroTop}>
              <View style={s.heroLeft}>
                <Text style={s.heroLabel}>YOU MAY QUALIFY FOR</Text>
                <Text style={s.heroCount}>{likelyCount + maybeCount}</Text>
                <Text style={s.heroSub}>benefit programs</Text>
              </View>
              <View style={s.heroRight}>
                <Text style={s.heroValueLabel}>Est. monthly value</Text>
                <Text style={s.heroValue}>${totalValue.toFixed(0)}</Text>
              </View>
            </View>
            <View style={s.heroStats}>
              <View style={[s.heroStat, { backgroundColor: `${CIVIC_GREEN}15` }]}>
                <Text style={[s.heroStatNum, { color: CIVIC_GREEN }]}>{likelyCount}</Text>
                <Text style={[s.heroStatLabel, { color: CIVIC_GREEN }]}>Likely</Text>
              </View>
              <View style={[s.heroStat, { backgroundColor: `${AMBER}15` }]}>
                <Text style={[s.heroStatNum, { color: AMBER }]}>{maybeCount}</Text>
                <Text style={[s.heroStatLabel, { color: AMBER }]}>Maybe</Text>
              </View>
              <View style={[s.heroStat, { backgroundColor: '#F3F4F6' }]}>
                <Text style={[s.heroStatNum, { color: '#6B7280' }]}>{results.filter(r => r.eligibility === 'not_eligible').length}</Text>
                <Text style={[s.heroStatLabel, { color: '#6B7280' }]}>Not Eligible</Text>
              </View>
            </View>
            <TouchableOpacity style={s.viewBtn} onPress={() => router.push('/(tabs)/benefits')}>
              <Text style={s.viewBtnText}>View All Benefits →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.setupCard} onPress={() => {}}>
            <View style={s.setupIcon}><Text style={{ fontSize: 32 }}>👤</Text></View>
            <Text style={s.setupTitle}>Set Up Your Profile</Text>
            <Text style={s.setupSub}>Tell us about your household to find benefits you qualify for.</Text>
            <Text style={s.setupSubEs}>Cuéntenos sobre su hogar para encontrar beneficios.</Text>
            <View style={s.setupBtn}>
              <Text style={s.setupBtnText}>Get Started / Comenzar</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick actions */}
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.actionsGrid}>
          {[
            { icon: '🔍', label: 'Check Eligibility', labelEs: 'Verificar elegibilidad', color: '#EFF6FF', onPress: () => router.push('/(tabs)/benefits') },
            { icon: '📸', label: 'Scan Documents', labelEs: 'Escanear documentos', color: '#F0FDF4', onPress: () => router.push('/(tabs)/scanner') },
            { icon: '📋', label: 'My Applications', labelEs: 'Mis solicitudes', color: '#FFFBEB', onPress: () => router.push('/(tabs)/applications') },
            { icon: '❓', label: 'Get Help', labelEs: 'Obtener ayuda', color: '#F5F3FF', onPress: () => {} },
          ].map(a => (
            <TouchableOpacity key={a.label} style={[s.actionCard, { backgroundColor: a.color }]} onPress={a.onPress}>
              <Text style={s.actionIcon}>{a.icon}</Text>
              <Text style={s.actionLabel}>{a.label}</Text>
              <Text style={s.actionLabelEs}>{a.labelEs}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pending apps alert */}
        {pendingApps.length > 0 && (
          <TouchableOpacity style={s.alertCard} onPress={() => router.push('/(tabs)/applications')}>
            <Ionicons name="time-outline" size={22} color={AMBER} />
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>{pendingApps.length} application{pendingApps.length > 1 ? 's' : ''} in progress</Text>
              <Text style={s.alertSub}>Tap to check status updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={AMBER} />
          </TouchableOpacity>
        )}

        {/* Top benefits preview */}
        {hasProfile && likelyCount > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Top Benefits For You</Text>
            {results.filter(r => r.eligibility === 'likely').slice(0, 3).map(r => (
              <View key={r.programId} style={s.benefitRow}>
                <View style={s.benefitLeft}>
                  <View style={s.benefitDot} />
                  <View>
                    <Text style={s.benefitName}>{r.programName}</Text>
                    <Text style={s.benefitAgency}>{r.agency}</Text>
                  </View>
                </View>
                {r.estimatedMonthlyBenefit && (
                  <Text style={s.benefitAmt}>${r.estimatedMonthlyBenefit}/mo</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Privacy notice */}
        <View style={s.privacyCard}>
          <Ionicons name="lock-closed" size={18} color={CIVIC_BLUE} />
          <Text style={s.privacyText}>Your information is private and never shared. / Su información es privada y nunca se comparte.</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  content: { padding: 20 },

  header: { marginBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  logoIcon: { fontSize: 28 },
  logoText: { fontSize: 28, fontWeight: '800', color: CIVIC_BLUE },
  tagline: { fontSize: 18, color: '#374151', fontWeight: '600' },
  taglineEs: { fontSize: 14, color: '#6B7280', marginTop: 2 },

  heroCard: { backgroundColor: CIVIC_BLUE, borderRadius: 20, padding: 20, marginBottom: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  heroLeft: {},
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  heroCount: { fontSize: 56, fontWeight: '800', color: '#fff', lineHeight: 60 },
  heroSub: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  heroRight: { alignItems: 'flex-end', justifyContent: 'center' },
  heroValueLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  heroValue: { fontSize: 30, fontWeight: '800', color: '#34D399' },
  heroStats: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  heroStat: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
  heroStatNum: { fontSize: 20, fontWeight: '800' },
  heroStatLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  viewBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  viewBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  setupCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  setupIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  setupTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 6 },
  setupSub: { fontSize: 14, color: '#374151', textAlign: 'center', marginBottom: 4 },
  setupSubEs: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  setupBtn: { backgroundColor: CIVIC_BLUE, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14 },
  setupBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionCard: { width: '48%', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  actionLabelEs: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  alertCard: { backgroundColor: '#FFFBEB', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A' },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  alertSub: { fontSize: 12, color: '#B45309', marginTop: 2 },

  section: { marginBottom: 20 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  benefitLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  benefitDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: CIVIC_GREEN },
  benefitName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  benefitAgency: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  benefitAmt: { fontSize: 16, fontWeight: '800', color: CIVIC_GREEN },

  privacyCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BFDBFE' },
  privacyText: { flex: 1, fontSize: 12, color: '#1E40AF', lineHeight: 18 },
});
