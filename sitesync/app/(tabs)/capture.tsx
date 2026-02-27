import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type PhotoEntry = {
  id: string;
  tag: string;
  project: string;
  zone: string;
  timestamp: string;
  gps: string;
  uploaded: boolean;
  flagged: boolean;
};

const RECENT_PHOTOS: PhotoEntry[] = [
  { id: '1', tag: 'Foundation pour', project: 'Eastside Tower', zone: 'Level B1', timestamp: '2:41 PM', gps: '45.5231, -122.6765', uploaded: true, flagged: false },
  { id: '2', tag: 'Rebar inspection', project: 'Eastside Tower', zone: 'Level B1', timestamp: '2:28 PM', gps: '45.5231, -122.6765', uploaded: true, flagged: false },
  { id: '3', tag: 'Formwork gap', project: 'Eastside Tower', zone: 'Level B2', timestamp: '1:55 PM', gps: '45.5229, -122.6763', uploaded: false, flagged: true },
  { id: '4', tag: 'Electrical rough-in', project: 'Harbor View Condos', zone: 'Unit 204', timestamp: '11:32 AM', gps: '45.5198, -122.6754', uploaded: true, flagged: false },
  { id: '5', tag: 'Concrete pour complete', project: 'Harbor View Condos', zone: 'Podium Deck', timestamp: '10:15 AM', gps: '45.5198, -122.6754', uploaded: true, flagged: false },
  { id: '6', tag: 'Safety signage check', project: 'Eastside Tower', zone: 'Gate A', timestamp: '8:05 AM', gps: '45.5230, -122.6760', uploaded: true, flagged: false },
];

const PROJECTS = ['Eastside Tower', 'Harbor View Condos', 'Metro Station Retrofit'];
const TAGS = ['Foundation', 'Framing', 'MEP', 'Concrete', 'Safety', 'Inspection', 'Punch List', 'Other'];

export default function SiteSyncCaptureScreen() {
  const [selectedProject, setSelectedProject] = useState('Eastside Tower');
  const [selectedTag, setSelectedTag] = useState('Foundation');
  const [pendingUpload, setPendingUpload] = useState(1);

  const todayCount = RECENT_PHOTOS.length;
  const uploadedCount = RECENT_PHOTOS.filter(p => p.uploaded).length;
  const flaggedCount = RECENT_PHOTOS.filter(p => p.flagged).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Capture</Text>
            <Text style={styles.subtitle}>Document site progress</Text>
          </View>
          {pendingUpload > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>{pendingUpload} pending</Text>
            </View>
          )}
        </View>

        {/* GPS status bar */}
        <View style={styles.gpsBar}>
          <Text style={styles.gpsIcon}>📍</Text>
          <Text style={styles.gpsText}>45.5231°N, 122.6765°W · Eastside Tower Site</Text>
          <View style={styles.gpsAccuracy}>
            <Text style={styles.gpsAccuracyText}>±3m</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{todayCount}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#10B981' }]}>{uploadedCount}</Text>
            <Text style={styles.statLabel}>Uploaded</Text>
          </View>
          <View style={[styles.statCard, flaggedCount > 0 && { borderColor: '#F59E0B' }]}>
            <Text style={[styles.statVal, { color: flaggedCount > 0 ? '#F59E0B' : '#94A3B8' }]}>{flaggedCount}</Text>
            <Text style={styles.statLabel}>Flagged</Text>
          </View>
        </View>

        {/* Project selector */}
        <Text style={styles.sectionLabel}>Active Project</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
          {PROJECTS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.projectPill, selectedProject === p && styles.projectPillActive]}
              onPress={() => setSelectedProject(p)}
            >
              <Text style={[styles.projectPillText, selectedProject === p && styles.projectPillTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tag selector */}
        <Text style={styles.sectionLabel}>Photo Tag</Text>
        <View style={styles.tagsGrid}>
          {TAGS.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagChip, selectedTag === tag && styles.tagChipActive]}
              onPress={() => setSelectedTag(tag)}
            >
              <Text style={[styles.tagChipText, selectedTag === tag && styles.tagChipTextActive]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Capture button */}
        <TouchableOpacity style={styles.captureBtn} activeOpacity={0.85}>
          <Text style={styles.captureBtnIcon}>📷</Text>
          <Text style={styles.captureBtnText}>Take Photo</Text>
          <Text style={styles.captureBtnSub}>{selectedProject} · {selectedTag}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadExistingBtn}>
          <Text style={styles.uploadExistingText}>📁 Upload from Library</Text>
        </TouchableOpacity>

        {/* Recent photos grid */}
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Today's Photos ({todayCount})</Text>
        {RECENT_PHOTOS.map(photo => (
          <View key={photo.id} style={[styles.photoRow, photo.flagged && styles.photoRowFlagged]}>
            <View style={styles.photoThumb}>
              <Text style={styles.photoThumbEmoji}>🏗️</Text>
            </View>
            <View style={styles.photoInfo}>
              <View style={styles.photoTagRow}>
                <Text style={styles.photoTag}>{photo.tag}</Text>
                {photo.flagged && <Text style={styles.flagLabel}>⚠️ Issue</Text>}
              </View>
              <Text style={styles.photoMeta}>{photo.zone} · {photo.timestamp}</Text>
              <Text style={styles.photoGPS}>📍 {photo.gps}</Text>
            </View>
            <View style={[styles.uploadStatus, { backgroundColor: photo.uploaded ? '#ECFDF5' : '#FEF9C3' }]}>
              <Text style={[styles.uploadStatusText, { color: photo.uploaded ? '#065F46' : '#713F12' }]}>
                {photo.uploaded ? '✓' : '↑'}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 26, fontWeight: '900', color: '#0F2027', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  pendingBadge: { backgroundColor: '#FEF9C3', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#FDE68A' },
  pendingText: { fontSize: 12, color: '#713F12', fontWeight: '700' },

  gpsBar: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#BBF7D0' },
  gpsIcon: { fontSize: 16 },
  gpsText: { flex: 1, fontSize: 12, color: '#065F46', fontWeight: '600' },
  gpsAccuracy: { backgroundColor: '#BBF7D0', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  gpsAccuracyText: { fontSize: 10, color: '#065F46', fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  statVal: { fontSize: 24, fontWeight: '900', color: '#0F2027' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#0F2027', marginBottom: 10 },

  projectScroll: { marginBottom: 16 },
  projectPill: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1.5, borderColor: '#E2E8F0' },
  projectPillActive: { backgroundColor: '#0F2027', borderColor: '#0F2027' },
  projectPillText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  projectPillTextActive: { color: '#FFF' },

  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tagChip: { backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5, borderColor: '#E2E8F0' },
  tagChipActive: { backgroundColor: '#0F2027', borderColor: '#0F2027' },
  tagChipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  tagChipTextActive: { color: '#FFF' },

  captureBtn: { backgroundColor: '#0F2027', borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 10 },
  captureBtnIcon: { fontSize: 36, marginBottom: 8 },
  captureBtnText: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  captureBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  uploadExistingBtn: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: '#E2E8F0' },
  uploadExistingText: { color: '#0F2027', fontWeight: '700', fontSize: 14 },

  photoRow: { backgroundColor: '#FFF', borderRadius: 14, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  photoRowFlagged: { borderColor: '#FDE68A', borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  photoThumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  photoThumbEmoji: { fontSize: 26 },
  photoInfo: { flex: 1 },
  photoTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  photoTag: { fontSize: 13, fontWeight: '700', color: '#0F2027' },
  flagLabel: { fontSize: 11, color: '#D97706', fontWeight: '700' },
  photoMeta: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  photoGPS: { fontSize: 10, color: '#94A3B8' },
  uploadStatus: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  uploadStatusText: { fontSize: 14, fontWeight: '900' },
});
