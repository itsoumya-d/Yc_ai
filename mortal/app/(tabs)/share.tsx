import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVaultStore, TrustedPerson } from '../../store/vault-store';

const SAGE = '#5B8C5A';
const GOLD = '#C4A35A';
const CREAM = '#FDFBF7';
const IVORY = '#E8DFD0';
const TEXT = '#2D3B2C';
const TEXT2 = '#6B7B6A';

const ACCESS_CONFIG: Record<TrustedPerson['accessLevel'], { label: string; color: string; desc: string; icon: string }> = {
  full: { label: 'Full Access', color: SAGE, desc: 'Can see all documents and messages', icon: 'key' },
  executor: { label: 'Executor', color: GOLD, desc: 'Legal executor — full document access', icon: 'hammer' },
  emergency_only: { label: 'Emergency', color: '#DC2626', desc: 'Only healthcare & emergency docs', icon: 'medkit' },
  specific_docs: { label: 'Specific', color: '#6B7280', desc: 'Access to selected categories only', icon: 'documents' },
};

function PersonCard({ person }: { person: TrustedPerson }) {
  const ac = ACCESS_CONFIG[person.accessLevel];

  return (
    <View style={pc.card}>
      <View style={pc.header}>
        <View style={pc.avatarWrap}>
          <Text style={pc.avatarText}>{person.avatarInitials}</Text>
        </View>
        <View style={pc.info}>
          <Text style={pc.name}>{person.name}</Text>
          <Text style={pc.relationship}>{person.relationship}</Text>
          <Text style={pc.email}>{person.email}</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Edit Access', `Modify ${person.name}'s access settings.`)}>
          <Ionicons name="ellipsis-horizontal" size={20} color={TEXT2} />
        </TouchableOpacity>
      </View>

      <View style={pc.accessRow}>
        <View style={[pc.accessBadge, { backgroundColor: `${ac.color}18` }]}>
          <Ionicons name={ac.icon as any} size={12} color={ac.color} />
          <Text style={[pc.accessLabel, { color: ac.color }]}>{ac.label}</Text>
        </View>
        {person.canReceiveOnDeath && (
          <View style={pc.receivesBadge}>
            <Text style={pc.receivesText}>📩 Notified on passing</Text>
          </View>
        )}
      </View>

      <Text style={pc.accessDesc}>{ac.desc}</Text>

      {person.accessibleCategories && (
        <View style={pc.cats}>
          {person.accessibleCategories.map(c => (
            <View key={c} style={pc.catPill}>
              <Text style={pc.catText}>{c}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const pc = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: IVORY },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  avatarWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8F0E8', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: SAGE },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: TEXT },
  relationship: { fontSize: 13, color: GOLD, fontWeight: '600', marginTop: 1 },
  email: { fontSize: 12, color: TEXT2, marginTop: 2 },
  accessRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 },
  accessBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  accessLabel: { fontSize: 12, fontWeight: '700' },
  receivesBadge: { backgroundColor: '#F0F5F0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  receivesText: { fontSize: 12, color: SAGE },
  accessDesc: { fontSize: 12, color: TEXT2, marginBottom: 8 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catPill: { backgroundColor: '#F8F5F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  catText: { fontSize: 12, color: TEXT, textTransform: 'capitalize' },
});

export default function ShareScreen() {
  const { trustedPeople } = useVaultStore();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Trusted People</Text>
          <Text style={s.sub}>{trustedPeople.length} people with access</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => Alert.alert('Add Person', 'In the full app, you can invite trusted contacts via email with customized access levels.')}>
          <Ionicons name="person-add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Access Level Guide */}
        <View style={s.guide}>
          <Text style={s.guideTitle}>Access Levels Explained</Text>
          <View style={s.guideGrid}>
            {Object.entries(ACCESS_CONFIG).map(([key, val]) => (
              <View key={key} style={s.guideItem}>
                <View style={[s.guideIcon, { backgroundColor: `${val.color}18` }]}>
                  <Ionicons name={val.icon as any} size={14} color={val.color} />
                </View>
                <View>
                  <Text style={[s.guideName, { color: val.color }]}>{val.label}</Text>
                  <Text style={s.guideDesc}>{val.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* People List */}
        {trustedPeople.map(p => <PersonCard key={p.id} person={p} />)}

        {/* Emergency QR Card */}
        <View style={s.qrCard}>
          <View style={s.qrLeft}>
            <Text style={s.qrTitle}>Emergency QR Card</Text>
            <Text style={s.qrSub}>Generate a wallet card that first responders can scan to access your healthcare directive instantly — without login required.</Text>
            <TouchableOpacity style={s.qrBtn} onPress={() => Alert.alert('QR Card', 'Generate an emergency access card for first responders.')}>
              <Ionicons name="qr-code-outline" size={16} color="#fff" />
              <Text style={s.qrBtnText}>Generate Card</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.qrIcon}>📲</Text>
        </View>

        {/* Time-lock release */}
        <View style={s.infoCard}>
          <Ionicons name="time-outline" size={20} color={GOLD} />
          <View style={{ flex: 1 }}>
            <Text style={s.infoTitle}>Time-Locked Releases</Text>
            <Text style={s.infoSub}>Personal letters and farewell messages can be released on a schedule — or unlocked by your executor when the time is right.</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: IVORY },
  title: { fontSize: 22, fontWeight: '800', color: TEXT },
  sub: { fontSize: 13, color: TEXT2, marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: SAGE, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { padding: 20 },
  guide: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: IVORY },
  guideTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 12 },
  guideGrid: { gap: 12 },
  guideItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  guideIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  guideName: { fontSize: 13, fontWeight: '700' },
  guideDesc: { fontSize: 12, color: TEXT2, marginTop: 1 },
  qrCard: { backgroundColor: '#FFFBF0', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F0E4C0' },
  qrLeft: { flex: 1 },
  qrTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 4 },
  qrSub: { fontSize: 13, color: TEXT2, lineHeight: 18, marginBottom: 12 },
  qrBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start' },
  qrBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  qrIcon: { fontSize: 40, marginLeft: 12 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: IVORY },
  infoTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 4 },
  infoSub: { fontSize: 13, color: TEXT2, lineHeight: 18 },
});
