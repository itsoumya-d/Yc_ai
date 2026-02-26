import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRouteStore } from '../../store/route-store';

const ROUTE_BLUE = '#0369A1';
const GREEN = '#10B981';
const AMBER = '#F59E0B';
const RED = '#EF4444';
const BG = '#F0F7FF';
const CARD = '#FFFFFF';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';

const SERVICE_CHECKLIST: Record<string, string[]> = {
  'HVAC Maintenance': ['Check air filter condition', 'Inspect refrigerant levels', 'Test thermostat calibration', 'Clean condenser coils', 'Check ductwork for leaks', 'Test heating elements'],
  'Electrical Inspection': ['Test GFCI outlets', 'Inspect panel for overload', 'Check grounding', 'Test smoke detectors', 'Inspect wiring condition', 'Load test circuits'],
  'Plumbing Repair': ['Diagnose leak source', 'Shut off water supply', 'Replace worn components', 'Test for leaks under pressure', 'Check water pressure', 'Flush and clean lines'],
  'AC Filter Replacement': ['Remove old filter', 'Measure filter slot dimensions', 'Install new MERV-13 filter', 'Check for gaps around filter', 'Reset filter indicator'],
  'Water Heater Service': ['Check temperature setting', 'Test pressure relief valve', 'Flush sediment from tank', 'Inspect anode rod', 'Check connections for leaks'],
  'Furnace Tune-Up': ['Replace air filter', 'Inspect heat exchanger', 'Test ignition system', 'Clean flame sensor', 'Check gas pressure', 'Test safety controls'],
  'Duct Cleaning': ['Seal supply/return registers', 'Connect vacuum system', 'Clean all supply ducts', 'Clean return air ducts', 'Sanitize with EPA-approved solution', 'Final blower door test'],
  'HVAC Installation': ['Verify unit specifications', 'Mount outdoor unit on pad', 'Install indoor air handler', 'Connect refrigerant lines', 'Complete electrical connections', 'Test system operation', 'Register warranty'],
};

export default function JobsScreen() {
  const { jobs, currentJobId, completeJob, skipJob, startJob } = useRouteStore();
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(currentJobId);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const job = jobs.find(j => j.id === selectedJobId) ?? jobs.find(j => j.status === 'current');
  const allJobs = jobs.filter(j => j.status !== 'completed');

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  if (!job) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.title}>Job Details</Text>
        </View>
        <View style={s.empty}>
          <Ionicons name="checkmark-done-circle" size={56} color={GREEN} />
          <Text style={s.emptyTitle}>All jobs complete!</Text>
          <Text style={s.emptySub}>Great work today. Check your earnings summary.</Text>
          <TouchableOpacity style={s.earningsBtn} onPress={() => router.push('/(tabs)/earnings')}>
            <Text style={s.earningsBtnText}>View Earnings →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const checklist = SERVICE_CHECKLIST[job.serviceType] ?? ['Complete service', 'Document work', 'Collect signature'];
  const allChecked = checklist.every(item => checkedItems[item]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => setSelectedJobId(null)}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={s.title}>Job #{job.stopNumber}</Text>
        <View style={s.headerBadge}>
          <Text style={[s.headerBadgeText, {
            color: job.status === 'current' ? ROUTE_BLUE : job.status === 'completed' ? GREEN : TEXT2
          }]}>
            {job.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Job selector */}
        {allJobs.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.jobPickerRow} contentContainerStyle={s.jobPicker}>
            {allJobs.map(j => (
              <TouchableOpacity
                key={j.id}
                style={[s.jobPickerBtn, selectedJobId === j.id && s.jobPickerBtnActive]}
                onPress={() => setSelectedJobId(j.id)}
              >
                <Text style={[s.jobPickerText, selectedJobId === j.id && s.jobPickerTextActive]}>
                  #{j.stopNumber} {j.customer.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Customer info */}
        <View style={s.customerCard}>
          <View style={s.customerTop}>
            <View style={s.customerAvatar}>
              <Text style={s.customerInitials}>{job.customer.split(' ').map(w => w[0]).join('')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.customerName}>{job.customer}</Text>
              <Text style={s.customerAddress}>{job.address}</Text>
            </View>
            <TouchableOpacity style={s.callBtn} onPress={() => Alert.alert('Call Customer', `Calling ${job.customer}...`)}>
              <Ionicons name="call" size={18} color={GREEN} />
            </TouchableOpacity>
          </View>
          <View style={s.jobMeta}>
            <View style={s.metaItem}>
              <Ionicons name="construct-outline" size={14} color={TEXT2} />
              <Text style={s.metaText}>{job.serviceType}</Text>
            </View>
            <View style={s.metaItem}>
              <Ionicons name="time-outline" size={14} color={TEXT2} />
              <Text style={s.metaText}>{job.timeWindow}</Text>
            </View>
            <View style={s.metaItem}>
              <Ionicons name="timer-outline" size={14} color={TEXT2} />
              <Text style={s.metaText}>{job.estimatedMinutes} min est.</Text>
            </View>
          </View>
          <TouchableOpacity style={s.navBtn} onPress={() => Alert.alert('Navigate', `Opening navigation to:\n${job.address}`)}>
            <Ionicons name="navigate-outline" size={16} color="#fff" />
            <Text style={s.navBtnText}>Navigate to Job</Text>
          </TouchableOpacity>
        </View>

        {/* Service history note */}
        {job.notes && (
          <View style={s.notesCard}>
            <Ionicons name="document-text-outline" size={16} color={AMBER} />
            <Text style={s.notesText}>{job.notes}</Text>
          </View>
        )}

        {/* Service checklist */}
        <View style={s.checklistCard}>
          <View style={s.checklistHeader}>
            <Text style={s.checklistTitle}>Service Checklist</Text>
            <Text style={s.checklistCount}>{Object.values(checkedItems).filter(Boolean).length}/{checklist.length}</Text>
          </View>
          {checklist.map(item => (
            <TouchableOpacity key={item} style={s.checkItem} onPress={() => toggleCheck(item)}>
              <View style={[s.checkBox, checkedItems[item] && s.checkBoxDone]}>
                {checkedItems[item] && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={[s.checkText, checkedItems[item] && s.checkTextDone]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Parts used */}
        <View style={s.partsCard}>
          <Text style={s.partsTitle}>Parts Used</Text>
          {(job.parts ?? []).map(p => (
            <View key={p.id} style={s.partRow}>
              <Text style={s.partName}>{p.name}</Text>
              <Text style={s.partQty}>×{p.quantity}</Text>
              <Text style={s.partCost}>${(p.quantity * p.unitCost).toFixed(2)}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={s.addPartBtn}
            onPress={() => Alert.alert('Add Part', 'In full app: scan part barcode or search catalog.')}
          >
            <Ionicons name="add-circle-outline" size={16} color={ROUTE_BLUE} />
            <Text style={s.addPartText}>Add Part Used</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        {job.status === 'current' && (
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.completeBtn, !allChecked && s.completeBtnDisabled]}
              onPress={() => {
                if (!allChecked) {
                  Alert.alert('Checklist Incomplete', 'Complete all checklist items before marking job done.');
                  return;
                }
                completeJob(job.id, { actualMinutes: job.estimatedMinutes + Math.floor(Math.random() * 10 - 5), rating: 5 });
                router.push('/(tabs)/complete');
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={s.completeBtnText}>Mark Job Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.skipBtn}
              onPress={() => Alert.alert('Skip Job', 'Skip this job and continue to next stop?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Skip', style: 'destructive', onPress: () => skipJob(job.id) },
              ])}
            >
              <Text style={s.skipBtnText}>Skip Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {job.status === 'upcoming' && (
          <TouchableOpacity style={s.startBtn} onPress={() => startJob(job.id)}>
            <Ionicons name="play-circle" size={20} color="#fff" />
            <Text style={s.startBtnText}>Start This Job</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: TEXT },
  headerBadge: { backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText: { fontSize: 11, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { padding: 14 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: TEXT },
  emptySub: { fontSize: 14, color: TEXT2 },
  earningsBtn: { backgroundColor: ROUTE_BLUE, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  earningsBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  jobPickerRow: { marginBottom: 14 },
  jobPicker: { gap: 8, paddingRight: 8 },
  jobPickerBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: CARD, borderWidth: 1, borderColor: '#E2E8F0' },
  jobPickerBtnActive: { backgroundColor: ROUTE_BLUE, borderColor: ROUTE_BLUE },
  jobPickerText: { fontSize: 12, fontWeight: '600', color: TEXT2 },
  jobPickerTextActive: { color: '#fff' },

  customerCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  customerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  customerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  customerInitials: { fontSize: 16, fontWeight: '800', color: ROUTE_BLUE },
  customerName: { fontSize: 16, fontWeight: '700', color: TEXT },
  customerAddress: { fontSize: 12, color: TEXT2, marginTop: 2 },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  jobMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: TEXT2 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ROUTE_BLUE, borderRadius: 10, padding: 12, justifyContent: 'center' },
  navBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  notesCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
  notesText: { flex: 1, fontSize: 13, color: '#78350F', lineHeight: 18 },

  checklistCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  checklistTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  checklistCount: { fontSize: 13, fontWeight: '700', color: ROUTE_BLUE },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  checkBoxDone: { backgroundColor: GREEN, borderColor: GREEN },
  checkText: { flex: 1, fontSize: 13, color: TEXT },
  checkTextDone: { textDecorationLine: 'line-through', color: TEXT2 },

  partsCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  partsTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 10 },
  partRow: { flexDirection: 'row', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  partName: { flex: 1, fontSize: 13, color: TEXT },
  partQty: { fontSize: 13, color: TEXT2, marginRight: 12 },
  partCost: { fontSize: 13, fontWeight: '600', color: GREEN },
  addPartBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  addPartText: { fontSize: 13, color: ROUTE_BLUE, fontWeight: '600' },

  actions: { gap: 10 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: GREEN, borderRadius: 14, padding: 16, justifyContent: 'center' },
  completeBtnDisabled: { backgroundColor: '#94A3B8' },
  completeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  skipBtn: { padding: 12, alignItems: 'center' },
  skipBtnText: { color: RED, fontSize: 14, fontWeight: '600' },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ROUTE_BLUE, borderRadius: 14, padding: 16, justifyContent: 'center' },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
