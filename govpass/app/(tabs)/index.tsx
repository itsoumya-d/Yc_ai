import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const BENEFITS = [
  { id: '1', name: 'SNAP Food Benefits', agency: 'USDA', amount: '$291/mo', eligible: true, applied: false, deadline: '2025-03-15' },
  { id: '2', name: 'Medicaid', agency: 'CMS', amount: 'Free coverage', eligible: true, applied: true, deadline: null },
  { id: '3', name: 'EITC Tax Credit', agency: 'IRS', amount: 'Up to $7,430', eligible: true, applied: false, deadline: '2025-04-15' },
  { id: '4', name: 'Section 8 Housing', agency: 'HUD', amount: 'Varies', eligible: false, applied: false, deadline: null },
  { id: '5', name: 'SSI Benefits', agency: 'SSA', amount: '$943/mo', eligible: true, applied: false, deadline: null },
];

export default function HomeScreen() {
  const [userName] = useState('Maria');
  const eligibleCount = BENEFITS.filter(b => b.eligible).length;
  const appliedCount = BENEFITS.filter(b => b.applied).length;
  const totalValue = '$12,400/yr';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <Text style={styles.greeting}>Good morning, {userName} 👋</Text>
          <Text style={styles.subtitle}>We found benefits you may qualify for</Text>
          <View style={styles.valueRow}>
            <Text style={styles.valueAmount}>{totalValue}</Text>
            <Text style={styles.valueLabel}>in potential benefits</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{eligibleCount}</Text>
              <Text style={styles.statLabel}>Eligible</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{appliedCount}</Text>
              <Text style={styles.statLabel}>Applied</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {[
            { icon: '📷', label: 'Scan Document', onPress: () => router.push('/scanner') },
            { icon: '💰', label: 'Check Benefits', onPress: () => router.push('/benefits') },
            { icon: '📋', label: 'Apply Now', onPress: () => router.push('/benefits') },
          ].map((action) => (
            <TouchableOpacity key={action.label} style={styles.actionCard} onPress={action.onPress}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Urgent actions */}
        <Text style={styles.sectionTitle}>Action Required</Text>
        {BENEFITS.filter(b => b.eligible && !b.applied && b.deadline).map((b) => (
          <TouchableOpacity key={b.id} style={styles.urgentCard}>
            <View style={styles.urgentBadge}><Text style={styles.urgentBadgeText}>DEADLINE</Text></View>
            <Text style={styles.urgentTitle}>{b.name}</Text>
            <Text style={styles.urgentDesc}>{b.agency} · Apply before {b.deadline}</Text>
            <View style={styles.urgentFooter}>
              <Text style={styles.urgentAmount}>{b.amount}</Text>
              <Text style={styles.urgentCta}>Apply Now →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Recent benefits */}
        <Text style={styles.sectionTitle}>Your Benefits</Text>
        {BENEFITS.slice(0, 3).map((b) => (
          <TouchableOpacity key={b.id} style={styles.benefitCard} onPress={() => router.push(`/benefit/${b.id}`)}>
            <View style={styles.benefitLeft}>
              <Text style={styles.benefitName}>{b.name}</Text>
              <Text style={styles.benefitAgency}>{b.agency}</Text>
            </View>
            <View style={styles.benefitRight}>
              <Text style={styles.benefitAmount}>{b.amount}</Text>
              <View style={[styles.benefitStatus, b.applied ? styles.statusApplied : styles.statusEligible]}>
                <Text style={[styles.statusText, b.applied ? styles.statusTextApplied : styles.statusTextEligible]}>
                  {b.applied ? 'Applied' : b.eligible ? 'Eligible' : 'Check'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 40 },
  headerCard: { backgroundColor: '#1B4EDE', borderRadius: 20, padding: 20, marginBottom: 24 },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 16 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  valueAmount: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  valueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12, marginTop: 8 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' },
  urgentCard: { backgroundColor: '#FFF7ED', borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  urgentBadge: { backgroundColor: '#FEF3C7', alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 8 },
  urgentBadgeText: { fontSize: 10, fontWeight: '700', color: '#D97706' },
  urgentTitle: { fontSize: 15, fontWeight: '700', color: '#1C1917', marginBottom: 4 },
  urgentDesc: { fontSize: 13, color: '#78716C', marginBottom: 12 },
  urgentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  urgentAmount: { fontSize: 16, fontWeight: '800', color: '#F59E0B' },
  urgentCta: { fontSize: 14, fontWeight: '700', color: '#1B4EDE' },
  benefitCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  benefitLeft: { flex: 1 },
  benefitName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  benefitAgency: { fontSize: 12, color: '#64748B' },
  benefitRight: { alignItems: 'flex-end', gap: 6 },
  benefitAmount: { fontSize: 14, fontWeight: '700', color: '#1B4EDE' },
  benefitStatus: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 },
  statusApplied: { backgroundColor: '#DBEAFE' },
  statusEligible: { backgroundColor: '#DCFCE7' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextApplied: { color: '#1D4ED8' },
  statusTextEligible: { color: '#16A34A' },
});
