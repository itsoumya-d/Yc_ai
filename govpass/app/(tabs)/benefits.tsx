import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

type Benefit = {
  id: string;
  name: string;
  agency: string;
  amount: string;
  frequency: string;
  status: 'eligible' | 'applied' | 'enrolled' | 'review';
  description: string;
  deadline?: string;
};

const BENEFITS: Benefit[] = [
  { id: '1', name: 'SNAP Food Benefits', agency: 'USDA', amount: '$281', frequency: '/month', status: 'eligible', description: 'Supplemental Nutrition Assistance Program for groceries and food.' },
  { id: '2', name: 'Medicaid', agency: 'CMS', amount: '$0', frequency: 'premium', status: 'enrolled', description: 'Free or low-cost health coverage for individuals and families.' },
  { id: '3', name: 'SSI', agency: 'SSA', amount: '$914', frequency: '/month', status: 'applied', description: 'Supplemental Security Income for aged, blind, or disabled individuals.', deadline: 'Review Apr 15' },
  { id: '4', name: 'EITC', agency: 'IRS', amount: '$3,995', frequency: '/year', status: 'eligible', description: 'Earned Income Tax Credit for low-to-moderate income workers.' },
  { id: '5', name: 'LIHEAP', agency: 'HHS', amount: '$500', frequency: '/year', status: 'review', description: 'Low Income Home Energy Assistance Program for heating/cooling bills.', deadline: 'Apply by Mar 31' },
  { id: '6', name: 'WIC', agency: 'USDA', amount: '$47', frequency: '/month', status: 'eligible', description: 'Special Supplemental Nutrition Program for Women, Infants, and Children.' },
  { id: '7', name: 'Section 8 Housing', agency: 'HUD', amount: '$900', frequency: '/month', status: 'review', description: 'Housing Choice Voucher Program for rental assistance.' },
];

const STATUS_CONFIG = {
  eligible: { label: 'Eligible', bg: '#D1FAE5', text: '#065F46' },
  applied: { label: 'Applied', bg: '#FEF9C3', text: '#713F12' },
  enrolled: { label: 'Enrolled', bg: '#DBEAFE', text: '#1E40AF' },
  review: { label: 'Action Needed', bg: '#FEE2E2', text: '#991B1B' },
};

const FILTERS = ['All', 'Eligible', 'Enrolled', 'Applied', 'Action Needed'];

export default function BenefitsScreen() {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = BENEFITS.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Action Needed') return b.status === 'review';
    return STATUS_CONFIG[b.status].label === filter;
  });

  const totalValue = BENEFITS
    .filter(b => b.status === 'enrolled' || b.status === 'eligible')
    .reduce((sum, b) => sum + parseInt(b.amount.replace(/\D/g, '') || '0'), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Benefits</Text>
          <Text style={styles.subtitle}>Programs you may qualify for</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Potential Monthly Value</Text>
          <Text style={styles.summaryAmount}>${totalValue.toLocaleString()}</Text>
          <View style={styles.summaryRow}>
            {[
              { label: 'Enrolled', count: BENEFITS.filter(b => b.status === 'enrolled').length, color: '#3B82F6' },
              { label: 'Eligible', count: BENEFITS.filter(b => b.status === 'eligible').length, color: '#10B981' },
              { label: 'Action Needed', count: BENEFITS.filter(b => b.status === 'review').length, color: '#EF4444' },
            ].map(s => (
              <View key={s.label} style={styles.summaryStat}>
                <Text style={[styles.summaryStatNum, { color: s.color }]}>{s.count}</Text>
                <Text style={styles.summaryStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, filter === f && styles.filterPillActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.map(benefit => {
          const cfg = STATUS_CONFIG[benefit.status];
          const isOpen = expanded === benefit.id;
          return (
            <TouchableOpacity
              key={benefit.id}
              style={styles.benefitCard}
              onPress={() => setExpanded(isOpen ? null : benefit.id)}
              activeOpacity={0.8}
            >
              <View style={styles.benefitTop}>
                <View style={styles.benefitLeft}>
                  <Text style={styles.benefitName}>{benefit.name}</Text>
                  <Text style={styles.benefitAgency}>{benefit.agency}</Text>
                </View>
                <View style={styles.benefitRight}>
                  <Text style={styles.benefitAmount}>{benefit.amount}</Text>
                  <Text style={styles.benefitFreq}>{benefit.frequency}</Text>
                </View>
              </View>

              <View style={styles.benefitMeta}>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
                </View>
                {benefit.deadline && (
                  <Text style={styles.deadline}>⚠️ {benefit.deadline}</Text>
                )}
              </View>

              {isOpen && (
                <View style={styles.benefitExpanded}>
                  <Text style={styles.benefitDesc}>{benefit.description}</Text>
                  <TouchableOpacity style={styles.applyBtn}>
                    <Text style={styles.applyBtnText}>
                      {benefit.status === 'eligible' ? 'Start Application' :
                       benefit.status === 'applied' ? 'Check Status' :
                       benefit.status === 'enrolled' ? 'Manage Benefits' : 'Take Action'}
                    </Text>
                  </TouchableOpacity>
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
  safe: { flex: 1, backgroundColor: '#F0F4FF' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#1B4EDE', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  summaryCard: { backgroundColor: '#1B4EDE', borderRadius: 20, padding: 20, marginBottom: 16 },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  summaryAmount: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 14 },
  summaryStat: {},
  summaryStatNum: { fontSize: 22, fontWeight: '800' },
  summaryStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  filterScroll: { marginBottom: 16 },
  filterPill: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1.5, borderColor: '#E0E7FF' },
  filterPillActive: { backgroundColor: '#1B4EDE', borderColor: '#1B4EDE' },
  filterText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  benefitCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E0E7FF' },
  benefitTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  benefitLeft: { flex: 1 },
  benefitName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  benefitAgency: { fontSize: 12, color: '#64748B' },
  benefitRight: { alignItems: 'flex-end' },
  benefitAmount: { fontSize: 20, fontWeight: '800', color: '#1B4EDE' },
  benefitFreq: { fontSize: 11, color: '#64748B' },
  benefitMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  deadline: { fontSize: 11, color: '#DC2626', fontWeight: '600' },
  benefitExpanded: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  benefitDesc: { fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 12 },
  applyBtn: { backgroundColor: '#1B4EDE', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
