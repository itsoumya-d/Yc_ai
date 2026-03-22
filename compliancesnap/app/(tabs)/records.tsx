import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import type { ComplianceRecord, RecordStatus } from '@/types';

const STATUS_COLORS: Record<RecordStatus, string> = {
  compliant: '#34C759', non_compliant: '#FF3B30', pending: '#FF9500', archived: '#8E8E93',
};
const STATUS_LABEL: Record<RecordStatus, string> = {
  compliant: 'Compliant', non_compliant: 'Non-Compliant', pending: 'Pending', archived: 'Archived',
};
const STATUS_ICONS: Record<RecordStatus, string> = {
  compliant: 'checkmark-circle', non_compliant: 'close-circle', pending: 'time', archived: 'archive',
};

const MOCK_RECORDS: ComplianceRecord[] = [
  { id: '1', title: 'Q1 Safety Audit — Warehouse A', site: 'Warehouse A', type: 'Safety Audit', status: 'compliant', score: 94, created_at: '', submitted_at: 'Mar 5' },
  { id: '2', title: 'Loading Dock Fire Safety', site: 'Loading Dock B', type: 'Fire Safety', status: 'non_compliant', score: 62, created_at: '', submitted_at: 'Mar 4' },
  { id: '3', title: 'PPE Compliance Check', site: 'Main Floor', type: 'PPE', status: 'pending', created_at: '', submitted_at: 'Mar 6' },
  { id: '4', title: 'Electrical Safety Walkthrough', site: 'Storage C', type: 'Electrical', status: 'compliant', score: 89, created_at: '', submitted_at: 'Mar 2' },
  { id: '5', title: 'Annual OSHA Inspection Prep', site: 'All Sites', type: 'OSHA', status: 'archived', score: 78, created_at: '', submitted_at: 'Feb 20' },
];

type FilterTab = 'all' | RecordStatus;
const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'compliant', label: 'Compliant' },
  { id: 'non_compliant', label: 'Non-Compliant' },
  { id: 'pending', label: 'Pending' },
];

export default function RecordsScreen() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const filtered = filter === 'all' ? MOCK_RECORDS : MOCK_RECORDS.filter(r => r.status === filter);

  const compliantCount = MOCK_RECORDS.filter(r => r.status === 'compliant').length;
  const nonCompliantCount = MOCK_RECORDS.filter(r => r.status === 'non_compliant').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Records</Text>
          <Text style={s.subtitle}>{MOCK_RECORDS.length} compliance records</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => Alert.alert('Export', 'Export records?')}>
          <Ionicons name="share-outline" size={18} color="#2D3436" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={[s.summaryCard, { borderColor: '#34C75930' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={[s.summaryVal, { color: '#34C759' }]}>{compliantCount}</Text>
          <Text style={s.summaryLabel}>Compliant</Text>
        </View>
        <View style={[s.summaryCard, { borderColor: '#FF3B3030' }]}>
          <Ionicons name="close-circle" size={20} color="#FF3B30" />
          <Text style={[s.summaryVal, { color: '#FF3B30' }]}>{nonCompliantCount}</Text>
          <Text style={s.summaryLabel}>Non-Compliant</Text>
        </View>
        <View style={[s.summaryCard, { borderColor: '#FF950030' }]}>
          <Ionicons name="time" size={20} color="#FF9500" />
          <Text style={[s.summaryVal, { color: '#FF9500' }]}>{MOCK_RECORDS.filter(r => r.status === 'pending').length}</Text>
          <Text style={s.summaryLabel}>Pending</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 46 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}>
        {FILTER_TABS.map(tab => {
          const active = filter === tab.id;
          const color = tab.id === 'all' ? '#FFC107' : STATUS_COLORS[tab.id as RecordStatus];
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

      {/* Records List */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingTop: 12 }}>
        {filtered.map((record) => (
          <TouchableOpacity key={record.id} style={s.recordCard} activeOpacity={0.8}>
            <View style={[s.iconBox, { backgroundColor: STATUS_COLORS[record.status] + '15' }]}>
              <Ionicons name={STATUS_ICONS[record.status] as any} size={22} color={STATUS_COLORS[record.status]} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.recordTop}>
                <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[record.status] + '15' }]}>
                  <Text style={[s.statusText, { color: STATUS_COLORS[record.status] }]}>{STATUS_LABEL[record.status]}</Text>
                </View>
                {record.score !== undefined && (
                  <Text style={[s.score, { color: record.score >= 85 ? '#34C759' : record.score >= 70 ? '#FF9500' : '#FF3B30' }]}>
                    {record.score}%
                  </Text>
                )}
              </View>
              <Text style={s.recordTitle}>{record.title}</Text>
              <View style={s.recordMeta}>
                <Ionicons name="location-outline" size={12} color="#8E8E93" />
                <Text style={s.metaText}>{record.site}</Text>
                <Text style={s.metaText}>· {record.type}</Text>
                {record.submitted_at && <Text style={s.metaText}>· {record.submitted_at}</Text>}
              </View>
            </View>
            <View style={s.recordActions}>
              <TouchableOpacity style={s.actionBtn} onPress={() => Alert.alert('Share', 'Share this record?')}>
                <Ionicons name="share-outline" size={15} color="#8E8E93" />
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn} onPress={() => Alert.alert('Download', 'Download PDF?')}>
                <Ionicons name="download-outline" size={15} color="#8E8E93" />
              </TouchableOpacity>
            </View>
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
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1 },
  summaryVal: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: '#8E8E93', textAlign: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
  recordCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, padding: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA' },
  iconBox: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  recordTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  score: { fontSize: 14, fontWeight: '800' },
  recordTitle: { fontSize: 13, fontWeight: '700', color: '#2D3436', marginBottom: 4 },
  recordMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: '#8E8E93' },
  recordActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
});
