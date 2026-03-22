import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import type { Audit, AuditStatus } from '@/types';

const STATUS_COLORS: Record<AuditStatus, string> = {
  in_progress: '#FF9500', completed: '#007AFF', submitted: '#FFC107', approved: '#34C759',
};
const STATUS_LABEL: Record<AuditStatus, string> = {
  in_progress: 'In Progress', completed: 'Completed', submitted: 'Submitted', approved: 'Approved',
};

const MOCK_AUDITS: Audit[] = [
  { id: '1', site: 'Warehouse A — Floor 1', auditor: 'You', status: 'in_progress', score: 67, total_items: 24, issues_found: 8, created_at: '' },
  { id: '2', site: 'Loading Dock B', auditor: 'Sarah K.', status: 'submitted', score: 72, total_items: 18, issues_found: 5, created_at: '' },
  { id: '3', site: 'Main Office', auditor: 'You', status: 'approved', score: 94, total_items: 20, issues_found: 1, created_at: '' },
  { id: '4', site: 'Storage Unit C', auditor: 'James R.', status: 'completed', score: 81, total_items: 16, issues_found: 3, created_at: '' },
];

const CHECKLIST_ITEMS = [
  { id: '1', category: 'Fire Safety', check: 'Fire extinguishers accessible + tagged', status: 'pass' as const },
  { id: '2', category: 'Fire Safety', check: 'Emergency exits unobstructed', status: 'fail' as const },
  { id: '3', category: 'PPE', check: 'PPE available at entry points', status: 'pass' as const },
  { id: '4', category: 'PPE', check: 'PPE properly stored', status: 'fail' as const },
  { id: '5', category: 'Hazmat', check: 'SDS sheets accessible', status: 'pass' as const },
  { id: '6', category: 'Electrical', check: 'No exposed wiring visible', status: 'na' as const },
];

type FilterTab = 'all' | AuditStatus;
const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'Active' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'approved', label: 'Approved' },
];

type CheckStatus = 'pass' | 'fail' | 'na' | 'pending';
const CHECK_ICONS: Record<CheckStatus, string> = {
  pass: 'checkmark-circle', fail: 'close-circle', na: 'remove-circle', pending: 'ellipse-outline',
};
const CHECK_COLORS: Record<CheckStatus, string> = {
  pass: '#34C759', fail: '#FF3B30', na: '#8E8E93', pending: '#E5E5EA',
};

export default function AuditScreen() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showChecklist, setShowChecklist] = useState(false);
  const filtered = filter === 'all' ? MOCK_AUDITS : MOCK_AUDITS.filter(a => a.status === filter);
  const activeAudit = MOCK_AUDITS.find(a => a.status === 'in_progress');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Audits</Text>
          <Text style={s.subtitle}>{MOCK_AUDITS.length} total</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => Alert.alert('New Audit', 'Start new audit?')}>
          <Ionicons name="add" size={22} color="#2D3436" />
        </TouchableOpacity>
      </View>

      {/* Active Audit Banner */}
      {activeAudit && (
        <TouchableOpacity style={s.activeBanner} onPress={() => setShowChecklist(!showChecklist)}>
          <View style={s.activeBannerLeft}>
            <View style={s.activeDot} />
            <Text style={s.activeBannerTitle}>Active: {activeAudit.site}</Text>
          </View>
          <View style={s.activeBannerRight}>
            <Text style={s.activeBannerScore}>{activeAudit.score}%</Text>
            <Ionicons name={showChecklist ? 'chevron-up' : 'chevron-down'} size={16} color="#2D3436" />
          </View>
        </TouchableOpacity>
      )}

      {/* Checklist Preview */}
      {showChecklist && (
        <ScrollView style={s.checklistBox} showsVerticalScrollIndicator={false}>
          {CHECKLIST_ITEMS.map((item) => (
            <View key={item.id} style={s.checkRow}>
              <Ionicons name={CHECK_ICONS[item.status] as any} size={20} color={CHECK_COLORS[item.status]} />
              <View style={{ flex: 1 }}>
                <Text style={s.checkLabel}>{item.check}</Text>
                <Text style={s.checkCat}>{item.category}</Text>
              </View>
              <TouchableOpacity style={s.checkBtn} onPress={() => Alert.alert('Update', 'Update this check?')}>
                <Text style={s.checkBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 46 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}>
        {FILTER_TABS.map(tab => {
          const active = filter === tab.id;
          const color = tab.id === 'all' ? '#FFC107' : STATUS_COLORS[tab.id as AuditStatus];
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setFilter(tab.id)}
              style={[s.chip, active && { backgroundColor: color + '20', borderColor: color + '60' }]}
            >
              <Text style={[s.chipText, active && { color }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Audit Cards */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingTop: 12, gap: 10 }}>
        {filtered.map((audit) => (
          <TouchableOpacity key={audit.id} style={s.auditCard} activeOpacity={0.8}>
            <View style={s.auditHeader}>
              <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[audit.status] + '20' }]}>
                <Text style={[s.statusText, { color: STATUS_COLORS[audit.status] }]}>{STATUS_LABEL[audit.status]}</Text>
              </View>
              <Text style={s.auditBy}>{audit.auditor}</Text>
            </View>
            <Text style={s.auditSite}>{audit.site}</Text>
            <View style={s.auditStats}>
              <View style={s.auditStat}>
                <Text style={[s.auditStatVal, { color: audit.score >= 85 ? '#34C759' : audit.score >= 70 ? '#FF9500' : '#FF3B30' }]}>{audit.score}%</Text>
                <Text style={s.auditStatLabel}>Score</Text>
              </View>
              <View style={s.auditStat}>
                <Text style={s.auditStatVal}>{audit.total_items}</Text>
                <Text style={s.auditStatLabel}>Checks</Text>
              </View>
              <View style={s.auditStat}>
                <Text style={[s.auditStatVal, { color: audit.issues_found > 0 ? '#FF3B30' : '#34C759' }]}>{audit.issues_found}</Text>
                <Text style={s.auditStatLabel}>Issues</Text>
              </View>
            </View>
            {audit.status === 'in_progress' && (
              <TouchableOpacity style={s.continueBtn} onPress={() => Alert.alert('Resume', 'Resume this audit?')}>
                <Text style={s.continueBtnText}>Continue Audit</Text>
                <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#2D3436' },
  subtitle: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFC107', alignItems: 'center', justifyContent: 'center' },
  activeBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, padding: 12, borderRadius: 10, backgroundColor: '#FFC10720', borderWidth: 1, borderColor: '#FFC10740' },
  activeBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFC107' },
  activeBannerTitle: { fontSize: 13, fontWeight: '700', color: '#2D3436' },
  activeBannerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeBannerScore: { fontSize: 14, fontWeight: '700', color: '#FF9500' },
  checklistBox: { maxHeight: 220, marginHorizontal: 20, marginBottom: 10, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  checkLabel: { fontSize: 13, fontWeight: '600', color: '#2D3436' },
  checkCat: { fontSize: 11, color: '#8E8E93', marginTop: 1 },
  checkBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: '#F2F2F7' },
  checkBtnText: { fontSize: 11, fontWeight: '600', color: '#2D3436' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
  auditCard: { borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA', padding: 14 },
  auditHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  auditBy: { fontSize: 12, color: '#8E8E93' },
  auditSite: { fontSize: 15, fontWeight: '700', color: '#2D3436', marginBottom: 12 },
  auditStats: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  auditStat: { alignItems: 'center' },
  auditStatVal: { fontSize: 18, fontWeight: '800', color: '#2D3436' },
  auditStatLabel: { fontSize: 10, color: '#8E8E93', marginTop: 1 },
  continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFC107', paddingVertical: 10, borderRadius: 8 },
  continueBtnText: { fontSize: 14, fontWeight: '700', color: '#2D3436' },
});
