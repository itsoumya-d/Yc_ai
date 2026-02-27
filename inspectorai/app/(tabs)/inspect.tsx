import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';

type DamageType = {
  id: string;
  label: string;
  emoji: string;
  selected: boolean;
};

type RoomSection = {
  id: string;
  name: string;
  emoji: string;
  photoCount: number;
  complete: boolean;
};

const DAMAGE_TYPES_DATA: DamageType[] = [
  { id: 'd1', label: 'Wind Damage', emoji: '💨', selected: true },
  { id: 'd2', label: 'Hail Damage', emoji: '🌨️', selected: true },
  { id: 'd3', label: 'Water Intrusion', emoji: '💧', selected: false },
  { id: 'd4', label: 'Fire Damage', emoji: '🔥', selected: false },
  { id: 'd5', label: 'Structural', emoji: '🏗️', selected: false },
  { id: 'd6', label: 'Flood', emoji: '🌊', selected: false },
  { id: 'd7', label: 'Mold', emoji: '🍄', selected: false },
  { id: 'd8', label: 'Vandalism', emoji: '🔨', selected: false },
];

const ROOM_SECTIONS: RoomSection[] = [
  { id: 'r1', name: 'Roof', emoji: '🏠', photoCount: 8, complete: true },
  { id: 'r2', name: 'Exterior - Front', emoji: '🏡', photoCount: 5, complete: true },
  { id: 'r3', name: 'Exterior - Rear', emoji: '🏚️', photoCount: 3, complete: false },
  { id: 'r4', name: 'Attic', emoji: '🪜', photoCount: 0, complete: false },
  { id: 'r5', name: 'Living Room', emoji: '🛋️', photoCount: 0, complete: false },
  { id: 'r6', name: 'Bedrooms', emoji: '🛏️', photoCount: 0, complete: false },
  { id: 'r7', name: 'Kitchen', emoji: '🍳', photoCount: 0, complete: false },
  { id: 'r8', name: 'Garage', emoji: '🚗', photoCount: 0, complete: false },
];

export default function InspectorAIInspectScreen() {
  const [address, setAddress] = useState('1847 NE Burnside St, Portland, OR 97232');
  const [claimNum, setClaimNum] = useState('CLM-2025-8841');
  const [damageTypes, setDamageTypes] = useState(DAMAGE_TYPES_DATA);
  const [lossCause, setLossCause] = useState('Hailstorm Feb 12, 2025');
  const [sections, setSections] = useState(ROOM_SECTIONS);

  const toggleDamage = (id: string) => {
    setDamageTypes(prev => prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d));
  };

  const selectedDamages = damageTypes.filter(d => d.selected);
  const totalPhotos = sections.reduce((s, r) => s + r.photoCount, 0);
  const completedSections = sections.filter(r => r.complete).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>New Inspection</Text>
          <Text style={styles.subtitle}>AI-powered damage assessment</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Inspection Progress</Text>
            <Text style={styles.progressPct}>{Math.round((completedSections / sections.length) * 100)}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${(completedSections / sections.length) * 100}%` as any }]} />
          </View>
          <Text style={styles.progressSub}>{completedSections} of {sections.length} sections · {totalPhotos} photos captured</Text>
        </View>

        {/* Claim info */}
        <Text style={styles.sectionTitle}>Claim Information</Text>
        <View style={styles.inputCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Property Address</Text>
            <TextInput
              style={styles.textInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter property address"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={[styles.inputGroup, styles.inputBorder]}>
            <Text style={styles.inputLabel}>Claim Number</Text>
            <TextInput
              style={styles.textInput}
              value={claimNum}
              onChangeText={setClaimNum}
              placeholder="CLM-YYYY-XXXX"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={[styles.inputGroup, styles.inputBorder]}>
            <Text style={styles.inputLabel}>Loss Cause / Event</Text>
            <TextInput
              style={styles.textInput}
              value={lossCause}
              onChangeText={setLossCause}
              placeholder="e.g. Hailstorm Jan 15, 2025"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Damage types */}
        <Text style={styles.sectionTitle}>Damage Types</Text>
        <View style={styles.damageGrid}>
          {damageTypes.map(d => (
            <TouchableOpacity
              key={d.id}
              style={[styles.damageChip, d.selected && styles.damageChipActive]}
              onPress={() => toggleDamage(d.id)}
            >
              <Text style={styles.damageEmoji}>{d.emoji}</Text>
              <Text style={[styles.damageLabel, d.selected && styles.damageLabelActive]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI camera CTA */}
        <View style={styles.aiCameraCard}>
          <Text style={styles.aiCameraTitle}>🤖 AI Damage Detection</Text>
          <Text style={styles.aiCameraText}>
            Point your camera at damaged areas. AI will automatically identify damage type, severity, and suggest Xactimate line items in real-time.
          </Text>
          <TouchableOpacity style={styles.aiCameraBtn} activeOpacity={0.85}>
            <Text style={styles.aiCameraBtnEmoji}>📷</Text>
            <Text style={styles.aiCameraBtnText}>Open AI Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Room sections checklist */}
        <Text style={styles.sectionTitle}>Inspection Sections</Text>
        {sections.map(section => (
          <TouchableOpacity
            key={section.id}
            style={[styles.sectionCard, section.complete && styles.sectionCardComplete]}
            activeOpacity={0.8}
          >
            <Text style={styles.sectionEmoji}>{section.emoji}</Text>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionName}>{section.name}</Text>
              <Text style={[styles.sectionStatus, { color: section.complete ? '#10B981' : section.photoCount > 0 ? '#F59E0B' : '#94A3B8' }]}>
                {section.complete ? '✓ Complete' : section.photoCount > 0 ? `${section.photoCount} photos — not complete` : 'No photos yet'}
              </Text>
            </View>
            <TouchableOpacity style={[styles.captureBtn, section.complete && styles.captureBtnDone]}>
              <Text style={styles.captureBtnText}>{section.complete ? '✓' : '📷'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Submit button */}
        <TouchableOpacity style={[styles.submitBtn, completedSections < 3 && styles.submitBtnDisabled]} activeOpacity={0.9}>
          <Text style={styles.submitBtnText}>
            {completedSections >= 3 ? '🤖 Generate AI Report' : `Complete ${3 - completedSections} more section${3 - completedSections !== 1 ? 's' : ''} to submit`}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#1E3A5F', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E3A5F', marginBottom: 12 },

  progressCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13, fontWeight: '700', color: '#1E3A5F' },
  progressPct: { fontSize: 13, fontWeight: '800', color: '#1E3A5F' },
  progressBarTrack: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: '#1E3A5F', borderRadius: 4 },
  progressSub: { fontSize: 11, color: '#64748B' },

  inputCard: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  inputGroup: { padding: 14 },
  inputBorder: { borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  inputLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  textInput: { fontSize: 14, color: '#0F172A', fontWeight: '500' },

  damageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  damageChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5, borderColor: '#E2E8F0' },
  damageChipActive: { backgroundColor: '#EFF6FF', borderColor: '#1E3A5F' },
  damageEmoji: { fontSize: 16 },
  damageLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  damageLabelActive: { color: '#1E3A5F' },

  aiCameraCard: { backgroundColor: '#1E3A5F', borderRadius: 18, padding: 18, marginBottom: 20, gap: 10 },
  aiCameraTitle: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  aiCameraText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 19 },
  aiCameraBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  aiCameraBtnEmoji: { fontSize: 22 },
  aiCameraBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionCardComplete: { borderColor: '#BBF7D0' },
  sectionEmoji: { fontSize: 24 },
  sectionInfo: { flex: 1 },
  sectionName: { fontSize: 14, fontWeight: '700', color: '#1E3A5F' },
  sectionStatus: { fontSize: 11, marginTop: 2 },
  captureBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  captureBtnDone: { backgroundColor: '#ECFDF5', borderColor: '#BBF7D0' },
  captureBtnText: { fontSize: 16 },

  submitBtn: { backgroundColor: '#1E3A5F', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { backgroundColor: '#94A3B8' },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
