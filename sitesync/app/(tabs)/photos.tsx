import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSiteStore, SitePhoto, PhotoPhase } from '../../store/site-store';

const YELLOW = '#EAB308';
const ORANGE = '#EA580C';
const BG = '#111827';
const CARD = '#1F2937';
const BORDER = '#374151';
const TEXT = '#F9FAFB';
const TEXT2 = '#9CA3AF';
const GREEN = '#22C55E';
const BLUE = '#3B82F6';

const PHASE_LABELS: Record<PhotoPhase, { label: string; icon: string; color: string }> = {
  foundation: { label: 'Foundation', icon: '🏗️', color: ORANGE },
  framing: { label: 'Framing', icon: '🪵', color: YELLOW },
  mechanical: { label: 'Mechanical', icon: '⚙️', color: BLUE },
  drywall: { label: 'Drywall', icon: '🏠', color: '#A78BFA' },
  finishing: { label: 'Finishing', icon: '✨', color: GREEN },
  other: { label: 'Other', icon: '🔧', color: TEXT2 },
};

type CaptureState = 'idle' | 'viewfinder' | 'saving';

function PhotoCard({ photo }: { photo: SitePhoto }) {
  const phase = PHASE_LABELS[photo.phase];
  return (
    <View style={s.photoCard}>
      <View style={s.photoPlaceholder}>
        <Ionicons name="image-outline" size={32} color={TEXT2} />
        <Text style={s.photoPlaceholderText}>{photo.phase}</Text>
      </View>
      <View style={s.photoInfo}>
        <View style={s.photoTop}>
          <View style={[s.phasePill, { backgroundColor: `${phase.color}20` }]}>
            <Text style={s.phaseIcon}>{phase.icon}</Text>
            <Text style={[s.phaseLabel, { color: phase.color }]}>{phase.label}</Text>
          </View>
        </View>
        <Text style={s.photoCaption}>{photo.caption}</Text>
        <View style={s.photoMeta}>
          <Ionicons name="location-outline" size={12} color={TEXT2} />
          <Text style={s.photoMetaText}>{photo.location}</Text>
          <Text style={s.photoMetaSep}>·</Text>
          <Ionicons name="time-outline" size={12} color={TEXT2} />
          <Text style={s.photoMetaText}>{photo.timestamp}</Text>
        </View>
        {photo.gpsTag && (
          <View style={s.gpsRow}>
            <Ionicons name="navigate-outline" size={11} color={BLUE} />
            <Text style={s.gpsText}>{photo.gpsTag}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function PhotosScreen() {
  const { projects, activeProjectId, addPhoto } = useSiteStore();
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const [selectedPhase, setSelectedPhase] = useState<PhotoPhase>('framing');
  const [selectedLocation, setSelectedLocation] = useState('Site Level 1');
  const [filterPhase, setFilterPhase] = useState<PhotoPhase | 'all'>('all');

  const project = projects.find(p => p.id === activeProjectId) ?? projects[0];
  if (!project) return null;

  const filteredPhotos = filterPhase === 'all'
    ? project.photos
    : project.photos.filter(p => p.phase === filterPhase);

  const handleCapture = () => {
    setCaptureState('saving');
    setTimeout(() => {
      const newPhoto: SitePhoto = {
        id: Date.now().toString(),
        projectId: project.id,
        uri: 'mock',
        caption: `${PHASE_LABELS[selectedPhase].label} documentation — ${selectedLocation}`,
        phase: selectedPhase,
        location: selectedLocation,
        timestamp: 'Just now',
        gpsTag: '37.7749, -122.4194',
      };
      addPhoto(project.id, newPhoto);
      setCaptureState('idle');
      Alert.alert('📷 Photo Saved', 'Site documentation photo saved and tagged with GPS location.', [
        { text: 'OK' },
      ]);
    }, 1000);
  };

  if (captureState === 'viewfinder' || captureState === 'saving') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.vfHeader}>
          <TouchableOpacity onPress={() => setCaptureState('idle')} style={s.vfBack}>
            <Ionicons name="chevron-back" size={22} color={TEXT} />
          </TouchableOpacity>
          <Text style={s.vfTitle}>Document Site</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Phase selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.phaseScroll} contentContainerStyle={s.phaseScrollContent}>
          {(Object.entries(PHASE_LABELS) as [PhotoPhase, typeof PHASE_LABELS[PhotoPhase]][]).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              style={[s.phaseBtn, selectedPhase === key && { borderColor: val.color, backgroundColor: `${val.color}15` }]}
              onPress={() => setSelectedPhase(key)}
            >
              <Text style={s.phaseBtnIcon}>{val.icon}</Text>
              <Text style={[s.phaseBtnText, selectedPhase === key && { color: val.color }]}>{val.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Camera frame */}
        <View style={s.cameraArea}>
          <View style={s.mockCamera}>
            <Text style={{ fontSize: 48 }}>📷</Text>
            <Text style={s.mockCameraText}>Camera Preview</Text>
          </View>
          <View style={[s.corner, s.cornerTL]} />
          <View style={[s.corner, s.cornerTR]} />
          <View style={[s.corner, s.cornerBL]} />
          <View style={[s.corner, s.cornerBR]} />
          <View style={s.phaseOverlay}>
            <Text style={s.phaseOverlayText}>{PHASE_LABELS[selectedPhase].icon} {PHASE_LABELS[selectedPhase].label}</Text>
          </View>
          <View style={s.gpsOverlay}>
            <Ionicons name="navigate" size={12} color="#fff" />
            <Text style={s.gpsOverlayText}>GPS Active</Text>
          </View>
        </View>

        {/* Location selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.locationScroll} contentContainerStyle={s.locationContent}>
          {['Site Level 1', 'Site Level 2', 'Exterior', 'Rooftop', 'Basement', 'Unit 3B', 'Unit 4A'].map(loc => (
            <TouchableOpacity
              key={loc}
              style={[s.locationBtn, selectedLocation === loc && s.locationBtnActive]}
              onPress={() => setSelectedLocation(loc)}
            >
              <Text style={[s.locationBtnText, selectedLocation === loc && s.locationBtnTextActive]}>{loc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Capture */}
        <View style={s.captureArea}>
          <TouchableOpacity
            style={[s.captureBtn, captureState === 'saving' && s.captureBtnDisabled]}
            onPress={handleCapture}
            disabled={captureState === 'saving'}
          >
            <View style={s.captureBtnInner}>
              {captureState === 'saving'
                ? <Text style={s.captureBtnText}>Saving...</Text>
                : <Ionicons name="camera" size={30} color={BG} />
              }
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Site Photos</Text>
          <Text style={s.headerSub}>{project.name} · {project.photos.length} photos</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setCaptureState('viewfinder')}>
          <Ionicons name="camera" size={18} color={BG} />
          <Text style={s.addBtnText}>Capture</Text>
        </TouchableOpacity>
      </View>

      {/* Phase filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        <TouchableOpacity
          style={[s.filterChip, filterPhase === 'all' && s.filterChipActive]}
          onPress={() => setFilterPhase('all')}
        >
          <Text style={[s.filterChipText, filterPhase === 'all' && s.filterChipTextActive]}>All ({project.photos.length})</Text>
        </TouchableOpacity>
        {(Object.entries(PHASE_LABELS) as [PhotoPhase, typeof PHASE_LABELS[PhotoPhase]][]).map(([key, val]) => {
          const count = project.photos.filter(p => p.phase === key).length;
          if (count === 0) return null;
          return (
            <TouchableOpacity
              key={key}
              style={[s.filterChip, filterPhase === key && { ...s.filterChipActive, borderColor: val.color, backgroundColor: `${val.color}15` }]}
              onPress={() => setFilterPhase(key)}
            >
              <Text style={s.filterIcon}>{val.icon}</Text>
              <Text style={[s.filterChipText, filterPhase === key && { color: val.color }]}>{val.label} ({count})</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {filteredPhotos.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📷</Text>
            <Text style={s.emptyTitle}>No photos yet</Text>
            <Text style={s.emptySub}>Capture site photos to document construction progress.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setCaptureState('viewfinder')}>
              <Text style={s.emptyBtnText}>Take First Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPhotos.map(photo => <PhotoCard key={photo.id} photo={photo} />)
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
  headerSub: { fontSize: 11, color: TEXT2, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: YELLOW, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: BG },
  filterScroll: { backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  filterChipActive: { borderColor: YELLOW, backgroundColor: `${YELLOW}15` },
  filterIcon: { fontSize: 12 },
  filterChipText: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  filterChipTextActive: { color: YELLOW },
  scroll: { flex: 1 },
  content: { padding: 16 },

  photoCard: { backgroundColor: CARD, borderRadius: 14, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  photoPlaceholder: { height: 160, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoPlaceholderText: { fontSize: 12, color: TEXT2, textTransform: 'capitalize' },
  photoInfo: { padding: 12 },
  photoTop: { marginBottom: 6 },
  phasePill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  phaseIcon: { fontSize: 12 },
  phaseLabel: { fontSize: 11, fontWeight: '700' },
  photoCaption: { fontSize: 13, color: TEXT, fontWeight: '600', marginBottom: 6 },
  photoMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  photoMetaText: { fontSize: 11, color: TEXT2 },
  photoMetaSep: { fontSize: 11, color: TEXT2 },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  gpsText: { fontSize: 10, color: BLUE },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: TEXT, marginBottom: 6 },
  emptySub: { fontSize: 13, color: TEXT2, textAlign: 'center', marginBottom: 20 },
  emptyBtn: { backgroundColor: YELLOW, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: BG },

  // Viewfinder
  vfHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: CARD },
  vfBack: { width: 36, height: 36, borderRadius: 18, backgroundColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  vfTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  phaseScroll: { backgroundColor: CARD, maxHeight: 56 },
  phaseScrollContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  phaseBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER, backgroundColor: CARD },
  phaseBtnIcon: { fontSize: 14 },
  phaseBtnText: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  cameraArea: { flex: 1, margin: 12, borderRadius: 16, backgroundColor: '#000', overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  mockCamera: { alignItems: 'center', gap: 8 },
  mockCameraText: { color: TEXT2, fontSize: 14 },
  corner: { position: 'absolute', width: 24, height: 24 },
  cornerTL: { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2, borderColor: YELLOW, borderTopLeftRadius: 4 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2, borderColor: YELLOW, borderTopRightRadius: 4 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: YELLOW, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2, borderColor: YELLOW, borderBottomRightRadius: 4 },
  phaseOverlay: { position: 'absolute', top: 12, left: 0, right: 0, alignItems: 'center' },
  phaseOverlayText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  gpsOverlay: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  gpsOverlayText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  locationScroll: { backgroundColor: CARD, maxHeight: 52, borderTopWidth: 1, borderTopColor: BORDER },
  locationContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  locationBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  locationBtnActive: { borderColor: YELLOW, backgroundColor: `${YELLOW}15` },
  locationBtnText: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  locationBtnTextActive: { color: YELLOW },
  captureArea: { paddingVertical: 16, alignItems: 'center', backgroundColor: CARD },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: YELLOW, alignItems: 'center', justifyContent: 'center' },
  captureBtnDisabled: { opacity: 0.6 },
  captureBtnInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: YELLOW, alignItems: 'center', justifyContent: 'center' },
  captureBtnText: { fontSize: 11, color: BG, fontWeight: '700' },
});
