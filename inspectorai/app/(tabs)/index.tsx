import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useInspectionStore, PropertyInspection, InspectionStatus } from '../../store/inspection-store';

const NAVY = '#1B2A4A';
const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const TEXT = '#1E293B';
const TEXT2 = '#64748B';
const GREEN = '#10B981';
const AMBER = '#F59E0B';
const RED = '#EF4444';
const BLUE = '#3B82F6';

const STATUS_CONFIG: Record<InspectionStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Draft', color: TEXT2, icon: 'create-outline' },
  in_progress: { label: 'In Progress', color: AMBER, icon: 'time-outline' },
  completed: { label: 'Completed', color: GREEN, icon: 'checkmark-circle-outline' },
  submitted: { label: 'Submitted', color: BLUE, icon: 'send-outline' },
};

const CONDITION_CONFIG = {
  excellent: { label: 'Excellent', color: GREEN },
  good: { label: 'Good', color: '#34D399' },
  fair: { label: 'Fair', color: AMBER },
  poor: { label: 'Poor', color: '#F97316' },
  critical: { label: 'Critical', color: RED },
};

function InspectionCard({ inspection, onPress }: { inspection: PropertyInspection; onPress: () => void }) {
  const status = STATUS_CONFIG[inspection.status];
  const condition = CONDITION_CONFIG[inspection.overallCondition];
  const completedRooms = inspection.rooms.filter(r => r.completed).length;
  const totalFindings = inspection.rooms.reduce((s, r) => s + r.findings.length, 0);
  const criticalFindings = inspection.rooms.flatMap(r => r.findings).filter(f => f.severity === 'critical').length;

  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      {criticalFindings > 0 && (
        <View style={s.criticalBanner}>
          <Ionicons name="warning" size={12} color={RED} />
          <Text style={s.criticalBannerText}>{criticalFindings} critical finding{criticalFindings > 1 ? 's' : ''}</Text>
        </View>
      )}

      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardAddress} numberOfLines={2}>{inspection.propertyAddress}</Text>
          <Text style={s.cardType}>{inspection.propertyType}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: `${status.color}15` }]}>
          <Ionicons name={status.icon as any} size={12} color={status.color} />
          <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={s.cardMeta}>
        {inspection.claimNumber && (
          <View style={s.metaItem}>
            <Ionicons name="document-outline" size={12} color={TEXT2} />
            <Text style={s.metaText}>{inspection.claimNumber}</Text>
          </View>
        )}
        <View style={s.metaItem}>
          <Ionicons name="person-outline" size={12} color={TEXT2} />
          <Text style={s.metaText}>{inspection.clientName}</Text>
        </View>
        <View style={s.metaItem}>
          <Ionicons name="calendar-outline" size={12} color={TEXT2} />
          <Text style={s.metaText}>{inspection.date}</Text>
        </View>
      </View>

      <View style={s.cardStats}>
        <View style={s.cardStat}>
          <Text style={[s.cardStatNum, { color: condition.color }]}>{condition.label}</Text>
          <Text style={s.cardStatLabel}>Condition</Text>
        </View>
        <View style={s.cardStatDivider} />
        <View style={s.cardStat}>
          <Text style={[s.cardStatNum, { color: totalFindings > 0 ? AMBER : GREEN }]}>{totalFindings}</Text>
          <Text style={s.cardStatLabel}>Findings</Text>
        </View>
        <View style={s.cardStatDivider} />
        <View style={s.cardStat}>
          <Text style={s.cardStatNum}>{completedRooms}/{inspection.rooms.length}</Text>
          <Text style={s.cardStatLabel}>Rooms</Text>
        </View>
        <View style={s.cardStatDivider} />
        <View style={s.cardStat}>
          <Text style={[s.cardStatNum, { color: GREEN }]}>${(inspection.totalEstimatedCost.low / 1000).toFixed(0)}k+</Text>
          <Text style={s.cardStatLabel}>Est. Cost</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function InspectionsScreen() {
  const { inspections, addInspection, setActiveInspection } = useInspectionStore();
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [address, setAddress] = useState('');
  const [client, setClient] = useState('');
  const [claimNum, setClaimNum] = useState('');

  const handleSelectInspection = (inspection: PropertyInspection) => {
    setActiveInspection(inspection.id);
    router.push('/(tabs)/scan');
  };

  const handleCreateInspection = () => {
    if (!address.trim()) {
      Alert.alert('Required', 'Property address is required.');
      return;
    }
    const defaultRooms = [
      { id: `r${Date.now()}1`, name: 'Exterior', findings: [], completed: false },
      { id: `r${Date.now()}2`, name: 'Living Areas', findings: [], completed: false },
      { id: `r${Date.now()}3`, name: 'Bedrooms', findings: [], completed: false },
      { id: `r${Date.now()}4`, name: 'Kitchen', findings: [], completed: false },
      { id: `r${Date.now()}5`, name: 'Bathrooms', findings: [], completed: false },
      { id: `r${Date.now()}6`, name: 'Basement/Attic', findings: [], completed: false },
    ];
    const newInspection: PropertyInspection = {
      id: Date.now().toString(),
      propertyAddress: address,
      propertyType: 'Single Family Residential',
      claimNumber: claimNum || undefined,
      inspectorName: 'James Park',
      date: 'Today',
      status: 'in_progress',
      rooms: defaultRooms,
      totalEstimatedCost: { low: 0, high: 0 },
      overallCondition: 'fair',
      notes: '',
      clientName: client || 'Not specified',
    };
    addInspection(newInspection);
    setActiveInspection(newInspection.id);
    setShowNew(false);
    setAddress('');
    setClient('');
    setClaimNum('');
    router.push('/(tabs)/scan');
  };

  const inProgress = inspections.filter(i => i.status === 'in_progress');
  const completed = inspections.filter(i => ['completed', 'submitted'].includes(i.status));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <View style={s.logoRow}>
            <Ionicons name="search" size={20} color={NAVY} />
            <Text style={s.logoText}>InspectorAI</Text>
          </View>
          <Text style={s.headerSub}>Property inspection & AI damage detection</Text>
        </View>
        <TouchableOpacity style={s.newBtn} onPress={() => setShowNew(!showNew)}>
          <Ionicons name={showNew ? 'close' : 'add'} size={18} color="#fff" />
          <Text style={s.newBtnText}>{showNew ? 'Cancel' : 'New'}</Text>
        </TouchableOpacity>
      </View>

      {showNew && (
        <View style={s.newForm}>
          <Text style={s.newFormTitle}>New Inspection</Text>
          <TextInput style={s.input} value={address} onChangeText={setAddress} placeholder="Property address *" placeholderTextColor={TEXT2} />
          <TextInput style={s.input} value={client} onChangeText={setClient} placeholder="Client name" placeholderTextColor={TEXT2} />
          <TextInput style={s.input} value={claimNum} onChangeText={setClaimNum} placeholder="Claim number (optional)" placeholderTextColor={TEXT2} />
          <TouchableOpacity style={[s.createBtn, !address.trim() && s.createBtnDisabled]} onPress={handleCreateInspection}>
            <Text style={s.createBtnText}>Create & Start Inspection</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={[s.summaryNum, { color: NAVY }]}>{inspections.length}</Text>
            <Text style={s.summaryLabel}>Total</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryNum, { color: AMBER }]}>{inProgress.length}</Text>
            <Text style={s.summaryLabel}>Active</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryNum, { color: GREEN }]}>{completed.length}</Text>
            <Text style={s.summaryLabel}>Done</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryNum, { color: RED }]}>
              {inspections.flatMap(i => i.rooms.flatMap(r => r.findings)).filter(f => f.severity === 'critical').length}
            </Text>
            <Text style={s.summaryLabel}>Critical</Text>
          </View>
        </View>

        {inProgress.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🔍 Active Inspections</Text>
            {inProgress.map(i => <InspectionCard key={i.id} inspection={i} onPress={() => handleSelectInspection(i)} />)}
          </View>
        )}

        {completed.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>✅ Completed</Text>
            {completed.map(i => <InspectionCard key={i.id} inspection={i} onPress={() => handleSelectInspection(i)} />)}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  logoText: { fontSize: 20, fontWeight: '800', color: NAVY },
  headerSub: { fontSize: 11, color: TEXT2 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: NAVY, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  newBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  newForm: { backgroundColor: CARD, padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 10 },
  newFormTitle: { fontSize: 15, fontWeight: '700', color: TEXT },
  input: { backgroundColor: BG, borderRadius: 10, padding: 12, fontSize: 14, color: TEXT, borderWidth: 1, borderColor: '#E5E7EB' },
  createBtn: { backgroundColor: NAVY, borderRadius: 12, padding: 14, alignItems: 'center' },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  scroll: { flex: 1 },
  content: { padding: 16 },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: CARD, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  summaryNum: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: TEXT2, marginTop: 2, textAlign: 'center' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 10 },

  card: { backgroundColor: CARD, borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  criticalBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${RED}10`, paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: `${RED}20` },
  criticalBannerText: { fontSize: 11, color: RED, fontWeight: '600' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, paddingBottom: 8 },
  cardAddress: { fontSize: 14, fontWeight: '700', color: TEXT },
  cardType: { fontSize: 12, color: TEXT2, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 14, paddingBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: TEXT2 },
  cardStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  cardStat: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  cardStatNum: { fontSize: 14, fontWeight: '800', color: TEXT },
  cardStatLabel: { fontSize: 10, color: TEXT2, marginTop: 2 },
  cardStatDivider: { width: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
});
