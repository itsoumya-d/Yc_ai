import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEligibilityStore, EligibilityResult } from '../../store/eligibility-store';

const CIVIC_BLUE = '#1E40AF';
const CIVIC_GREEN = '#059669';
const AMBER = '#D97706';
const BG = '#F9FAFB';

type FilterTab = 'all' | 'likely' | 'maybe';

function EligibilityBadge({ eligibility }: { eligibility: EligibilityResult['eligibility'] }) {
  const configs = {
    likely: { label: 'Likely Eligible', labelEs: 'Probablemente elegible', color: CIVIC_GREEN, bg: '#ECFDF5' },
    maybe: { label: 'Possibly Eligible', labelEs: 'Posiblemente elegible', color: AMBER, bg: '#FFFBEB' },
    not_eligible: { label: 'Not Eligible', labelEs: 'No elegible', color: '#6B7280', bg: '#F3F4F6' },
  }[eligibility];

  return (
    <View style={[badge.wrap, { backgroundColor: configs.bg }]}>
      <Text style={[badge.text, { color: configs.color }]}>{configs.label}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontSize: 12, fontWeight: '700' },
});

function ProgramCard({ result, onApply }: { result: EligibilityResult; onApply: () => void }) {
  const [expanded, setExpanded] = useState(false);

  if (result.eligibility === 'not_eligible') return null;

  return (
    <TouchableOpacity style={pc.card} onPress={() => setExpanded(!expanded)} activeOpacity={0.9}>
      <View style={pc.top}>
        <View style={{ flex: 1 }}>
          <Text style={pc.name}>{result.programName}</Text>
          <Text style={pc.agency}>{result.agency}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#9CA3AF" />
      </View>

      <View style={pc.mid}>
        <EligibilityBadge eligibility={result.eligibility} />
        {result.estimatedMonthlyBenefit && (
          <View style={pc.amtBadge}>
            <Text style={pc.amtText}>Up to ${result.estimatedMonthlyBenefit}/mo</Text>
          </View>
        )}
      </View>

      {expanded && (
        <View style={pc.detail}>
          {result.requirements.length > 0 && (
            <View style={pc.reqs}>
              <Text style={pc.reqsTitle}>Requirements / Requisitos:</Text>
              {result.requirements.map((r, i) => (
                <View key={i} style={pc.reqRow}>
                  <View style={[pc.reqDot, result.meetsRequirements[i] !== false ? pc.reqDotMet : pc.reqDotFail]} />
                  <Text style={pc.reqText}>{r}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={pc.applyBtn} onPress={onApply}>
            <Ionicons name="document-text-outline" size={16} color="#fff" />
            <Text style={pc.applyText}>Start Application / Solicitar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const pc = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  agency: { fontSize: 12, color: '#6B7280' },
  mid: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 },
  amtBadge: { backgroundColor: `${CIVIC_GREEN}15`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  amtText: { fontSize: 12, fontWeight: '700', color: CIVIC_GREEN },
  detail: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  reqs: { marginBottom: 14 },
  reqsTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reqDot: { width: 8, height: 8, borderRadius: 4 },
  reqDotMet: { backgroundColor: CIVIC_GREEN },
  reqDotFail: { backgroundColor: '#EF4444' },
  reqText: { fontSize: 13, color: '#374151', flex: 1 },
  applyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CIVIC_BLUE, borderRadius: 12, padding: 14, justifyContent: 'center' },
  applyText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default function BenefitsScreen() {
  const { results, profile, computeResults } = useEligibilityStore();
  const [filter, setFilter] = useState<FilterTab>('all');

  const displayResults = results.filter(r => {
    if (filter === 'all') return r.eligibility !== 'not_eligible';
    return r.eligibility === filter;
  });

  const totalPotential = results
    .filter(r => r.eligibility === 'likely' && r.estimatedMonthlyBenefit)
    .reduce((sum, r) => sum + (r.estimatedMonthlyBenefit ?? 0), 0);

  const handleApply = (programId: string) => {
    Alert.alert(
      'Start Application',
      'GovPass will pre-fill your application using your profile. You will be guided step-by-step.\n\nIniciar solicitud — GovPass pre-llenará su solicitud.',
      [
        { text: 'Cancel / Cancelar', style: 'cancel' },
        { text: 'Start / Iniciar', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Your Benefits</Text>
        <Text style={s.titleEs}>Sus beneficios</Text>
        {totalPotential > 0 && (
          <View style={s.potentialBadge}>
            <Text style={s.potentialText}>Up to ${totalPotential}/month available</Text>
          </View>
        )}
      </View>

      {/* Filter tabs */}
      <View style={s.filterRow}>
        {[
          { key: 'all', label: `All (${results.filter(r => r.eligibility !== 'not_eligible').length})` },
          { key: 'likely', label: `✅ Likely (${results.filter(r => r.eligibility === 'likely').length})` },
          { key: 'maybe', label: `⚠️ Maybe (${results.filter(r => r.eligibility === 'maybe').length})` },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterTab, filter === f.key && s.filterTabActive]}
            onPress={() => setFilter(f.key as FilterTab)}
          >
            <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {displayResults.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyTitle}>No results yet</Text>
            <Text style={s.emptySub}>Complete your profile to see which programs you qualify for.</Text>
            <Text style={s.emptySubEs}>Complete su perfil para ver los programas para los que califica.</Text>
          </View>
        ) : (
          displayResults.map(r => (
            <ProgramCard key={r.programId} result={r} onApply={() => handleApply(r.programId)} />
          ))
        )}

        {/* Not eligible section */}
        {filter === 'all' && results.filter(r => r.eligibility === 'not_eligible').length > 0 && (
          <View style={s.notEligSection}>
            <Text style={s.notEligTitle}>Not Currently Eligible / No elegible actualmente</Text>
            {results.filter(r => r.eligibility === 'not_eligible').map(r => (
              <View key={r.programId} style={s.notEligRow}>
                <Ionicons name="close-circle-outline" size={16} color="#9CA3AF" />
                <View style={{ flex: 1 }}>
                  <Text style={s.notEligName}>{r.programName}</Text>
                  {r.requirements[0] && <Text style={s.notEligReason}>Requirement: {r.requirements[0]}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  titleEs: { fontSize: 14, color: '#6B7280', marginTop: 2, marginBottom: 8 },
  potentialBadge: { backgroundColor: `${CIVIC_GREEN}15`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start' },
  potentialText: { fontSize: 13, fontWeight: '700', color: CIVIC_GREEN },

  filterRow: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: '#F3F4F6' },
  filterTabActive: { backgroundColor: CIVIC_BLUE },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterTextActive: { color: '#fff' },

  scroll: { flex: 1 },
  content: { padding: 16 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 4 },
  emptySubEs: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },

  notEligSection: { marginTop: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  notEligTitle: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 10 },
  notEligRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  notEligName: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  notEligReason: { fontSize: 11, color: '#D1D5DB', marginTop: 2 },
});
