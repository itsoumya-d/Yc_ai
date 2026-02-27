import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInspectionStore, DamageFinding, DamageType, Severity } from '../../store/inspection-store';

const NAVY = '#1B2A4A';
const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const TEXT = '#1E293B';
const TEXT2 = '#64748B';
const GREEN = '#10B981';
const AMBER = '#F59E0B';
const RED = '#EF4444';
const BLUE = '#3B82F6';
const ORANGE = '#F97316';

type ScanState = 'room_select' | 'viewfinder' | 'analyzing' | 'result';

const DAMAGE_TYPE_CONFIG: Record<DamageType, { label: string; icon: string; color: string }> = {
  structural: { label: 'Structural', icon: '🏗️', color: RED },
  water: { label: 'Water', icon: '💧', color: BLUE },
  fire: { label: 'Fire', icon: '🔥', color: ORANGE },
  wind: { label: 'Wind', icon: '💨', color: '#8B5CF6' },
  vandalism: { label: 'Vandalism', icon: '⚠️', color: AMBER },
  wear: { label: 'Normal Wear', icon: '🔄', color: TEXT2 },
  other: { label: 'Other', icon: '🔍', color: TEXT2 },
};

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string }> = {
  critical: { label: 'Critical', color: RED },
  major: { label: 'Major', color: ORANGE },
  minor: { label: 'Minor', color: AMBER },
  cosmetic: { label: 'Cosmetic', color: GREEN },
};

// Simulated AI results by damage type
const AI_RESULTS: Record<DamageType, Omit<DamageFinding, 'id' | 'photoUri'>> = {
  structural: {
    type: 'structural', severity: 'critical', location: 'Captured area',
    description: 'Detected horizontal crack in load-bearing wall element. Crack width estimated at 3-5mm with displacement evidence.',
    confidenceScore: 87,
    estimatedRepairCost: { low: 3500, high: 9000 },
    aiNotes: 'Horizontal cracks in structural walls indicate lateral pressure or foundation movement. Engineering evaluation required immediately.',
    requiresProfessional: true,
  },
  water: {
    type: 'water', severity: 'major', location: 'Captured area',
    description: 'Water staining and discoloration detected. Active moisture reading 78% — exceeds threshold. Affected area approximately 12 sq ft.',
    confidenceScore: 94,
    estimatedRepairCost: { low: 800, high: 2500 },
    aiNotes: 'Moisture levels indicate active or recent leak. Source investigation required before repair. Mold risk within 48-72 hours if not addressed.',
    requiresProfessional: true,
  },
  fire: {
    type: 'fire', severity: 'major', location: 'Captured area',
    description: 'Char marks and thermal discoloration detected. Surface damage extends approximately 6 sq ft. Substrate integrity questionable.',
    confidenceScore: 91,
    estimatedRepairCost: { low: 1200, high: 4500 },
    aiNotes: 'Fire damage visible. Carbon residue present. Assessment of underlying materials required. Smoke damage may extend beyond visible area.',
    requiresProfessional: true,
  },
  wind: {
    type: 'wind', severity: 'major', location: 'Captured area',
    description: 'Missing shingles and exposed underlayment detected. Pattern consistent with high-wind event. Approximately 80 sq ft affected.',
    confidenceScore: 97,
    estimatedRepairCost: { low: 600, high: 2200 },
    aiNotes: 'Wind shear damage pattern. Immediate temporary protection recommended. Full shingle replacement needed in affected zone.',
    requiresProfessional: false,
  },
  vandalism: {
    type: 'vandalism', severity: 'minor', location: 'Captured area',
    description: 'Graffiti and surface defacement detected on exterior surface. No structural compromise apparent.',
    confidenceScore: 99,
    estimatedRepairCost: { low: 200, high: 600 },
    aiNotes: 'Surface-level vandalism only. Document with multiple photos for claim. Removal can proceed without professional consultation.',
    requiresProfessional: false,
  },
  wear: {
    type: 'wear', severity: 'cosmetic', location: 'Captured area',
    description: 'Normal aging and wear detected. Paint oxidation, minor surface cracks consistent with expected weathering.',
    confidenceScore: 98,
    estimatedRepairCost: { low: 150, high: 500 },
    aiNotes: 'Normal wear and tear. No immediate structural concern. Cosmetic maintenance recommended.',
    requiresProfessional: false,
  },
  other: {
    type: 'other', severity: 'minor', location: 'Captured area',
    description: 'Damage detected. Type does not fit standard categories. Manual assessment recommended.',
    confidenceScore: 72,
    estimatedRepairCost: { low: 300, high: 1200 },
    aiNotes: 'Lower confidence result. Inspector review required to confirm damage type and severity.',
    requiresProfessional: true,
  },
};

export default function ScanScreen() {
  const { inspections, activeInspectionId, addFinding, completeRoom } = useInspectionStore();
  const [scanState, setScanState] = useState<ScanState>('room_select');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedDamageType, setSelectedDamageType] = useState<DamageType>('water');
  const [currentResult, setCurrentResult] = useState<DamageFinding | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);

  const inspection = inspections.find(i => i.id === activeInspectionId) ?? inspections[0];
  if (!inspection) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.noInspection}>
          <Text style={s.noInspectionIcon}>📋</Text>
          <Text style={s.noInspectionTitle}>No Active Inspection</Text>
          <Text style={s.noInspectionSub}>Select or create an inspection from the Inspections tab.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedRoom = inspection.rooms.find(r => r.id === selectedRoomId);

  const ANALYSIS_STEPS = [
    'Detecting damage type...',
    'Measuring affected area...',
    'Classifying severity...',
    'Estimating repair cost...',
    'Generating inspection notes...',
  ];

  const startScan = () => {
    if (!selectedRoomId) {
      Alert.alert('Select Room', 'Please select the room you are photographing.');
      return;
    }
    setScanState('viewfinder');
  };

  const handleCapture = () => {
    setScanState('analyzing');
    let step = 0;
    setAnalysisStep(0);
    const interval = setInterval(() => {
      step++;
      setAnalysisStep(step);
      if (step >= ANALYSIS_STEPS.length - 1) {
        clearInterval(interval);
        const result: DamageFinding = {
          id: Date.now().toString(),
          ...AI_RESULTS[selectedDamageType],
          location: selectedRoom?.name ?? 'Unknown',
          photoUri: 'mock',
        };
        setTimeout(() => {
          setCurrentResult(result);
          setScanState('result');
        }, 600);
      }
    }, 700);
  };

  const saveFinding = () => {
    if (!currentResult || !selectedRoomId) return;
    addFinding(inspection.id, selectedRoomId, currentResult);
    Alert.alert('Finding Saved', `${SEVERITY_CONFIG[currentResult.severity].label} ${DAMAGE_TYPE_CONFIG[currentResult.type].label} damage recorded.`, [
      { text: 'Scan Another', onPress: () => { setScanState('viewfinder'); setCurrentResult(null); } },
      { text: 'Change Room', onPress: () => { setScanState('room_select'); setCurrentResult(null); } },
    ]);
  };

  const discardFinding = () => {
    setCurrentResult(null);
    setScanState('viewfinder');
  };

  if (scanState === 'viewfinder') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.vfHeader}>
          <TouchableOpacity onPress={() => setScanState('room_select')} style={s.vfBack}>
            <Ionicons name="chevron-back" size={22} color={TEXT} />
          </TouchableOpacity>
          <Text style={s.vfTitle}>{selectedRoom?.name ?? 'Scanning'}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Damage type selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.typeScroll} contentContainerStyle={s.typeContent}>
          {(Object.entries(DAMAGE_TYPE_CONFIG) as [DamageType, typeof DAMAGE_TYPE_CONFIG[DamageType]][]).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              style={[s.typeBtn, selectedDamageType === key && { borderColor: val.color, backgroundColor: `${val.color}10` }]}
              onPress={() => setSelectedDamageType(key)}
            >
              <Text style={s.typeBtnIcon}>{val.icon}</Text>
              <Text style={[s.typeBtnText, selectedDamageType === key && { color: val.color }]}>{val.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Camera area */}
        <View style={s.cameraArea}>
          <View style={s.mockCamera}>
            <Text style={{ fontSize: 48 }}>📷</Text>
            <Text style={s.mockCameraText}>Point camera at damage</Text>
          </View>
          {/* Corner guides */}
          <View style={[s.corner, s.cornerTL]} />
          <View style={[s.corner, s.cornerTR]} />
          <View style={[s.corner, s.cornerBL]} />
          <View style={[s.corner, s.cornerBR]} />
          {/* AI overlay indicator */}
          <View style={s.aiOverlay}>
            <View style={s.aiOverlayDot} />
            <Text style={s.aiOverlayText}>AI Damage Detection Active</Text>
          </View>
          {/* Damage type overlay */}
          <View style={s.damageTypeOverlay}>
            <Text style={s.damageTypeOverlayText}>
              {DAMAGE_TYPE_CONFIG[selectedDamageType].icon} {DAMAGE_TYPE_CONFIG[selectedDamageType].label}
            </Text>
          </View>
        </View>

        {/* Capture button */}
        <View style={s.captureArea}>
          <TouchableOpacity style={s.captureBtn} onPress={handleCapture}>
            <View style={s.captureBtnInner}>
              <Ionicons name="camera" size={30} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={s.captureHint}>Tap to analyze damage</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (scanState === 'analyzing') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.analyzingScreen}>
          <View style={[s.analyzingIcon, { backgroundColor: `${DAMAGE_TYPE_CONFIG[selectedDamageType].color}15` }]}>
            <Text style={{ fontSize: 48 }}>{DAMAGE_TYPE_CONFIG[selectedDamageType].icon}</Text>
          </View>
          <Text style={s.analyzingTitle}>AI Analyzing Damage</Text>
          <Text style={[s.analyzingType, { color: DAMAGE_TYPE_CONFIG[selectedDamageType].color }]}>
            {DAMAGE_TYPE_CONFIG[selectedDamageType].label} Detection
          </Text>
          <View style={s.stepsContainer}>
            {ANALYSIS_STEPS.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={[s.stepDot,
                  i < analysisStep ? { backgroundColor: GREEN } :
                  i === analysisStep ? { backgroundColor: NAVY } :
                  { backgroundColor: '#E5E7EB' }
                ]}>
                  {i < analysisStep && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={[s.stepText, i <= analysisStep ? { color: TEXT } : { color: TEXT2 }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (scanState === 'result' && currentResult) {
    const dtype = DAMAGE_TYPE_CONFIG[currentResult.type];
    const severity = SEVERITY_CONFIG[currentResult.severity];
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          <Text style={s.resultTitle}>AI Analysis Result</Text>

          {/* Result card — colored left border */}
          <View style={[s.resultCard, { borderLeftColor: severity.color }]}>
            <View style={s.resultTop}>
              <View style={[s.resultTypeIcon, { backgroundColor: `${dtype.color}15` }]}>
                <Text style={{ fontSize: 24 }}>{dtype.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.resultType}>{dtype.label} Damage</Text>
                <View style={[s.severityBadge, { backgroundColor: `${severity.color}15` }]}>
                  <View style={[s.severityDot, { backgroundColor: severity.color }]} />
                  <Text style={[s.severityText, { color: severity.color }]}>{severity.label}</Text>
                </View>
              </View>
              <View style={s.confidenceCircle}>
                <Text style={s.confidenceNum}>{currentResult.confidenceScore}%</Text>
                <Text style={s.confidenceLabel}>confident</Text>
              </View>
            </View>

            <Text style={s.resultDesc}>{currentResult.description}</Text>

            {/* Cost estimate */}
            <View style={s.costRow}>
              <Ionicons name="cash-outline" size={16} color={NAVY} />
              <Text style={s.costLabel}>Estimated Repair Cost</Text>
              <Text style={s.costRange}>
                ${currentResult.estimatedRepairCost.low.toLocaleString()} – ${currentResult.estimatedRepairCost.high.toLocaleString()}
              </Text>
            </View>

            {/* AI notes */}
            <View style={s.aiNotesBlock}>
              <Text style={s.aiNotesTitle}>🤖 AI Inspector Notes</Text>
              <Text style={s.aiNotesText}>{currentResult.aiNotes}</Text>
            </View>

            {/* Professional required */}
            {currentResult.requiresProfessional && (
              <View style={s.proRequired}>
                <Ionicons name="warning" size={14} color={RED} />
                <Text style={s.proRequiredText}>Professional contractor assessment required before repair</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={s.saveBtn} onPress={saveFinding}>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={s.saveBtnText}>Add to Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.discardBtn} onPress={discardFinding}>
            <Text style={s.discardBtnText}>Retake Photo</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Room select
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Select Room to Scan</Text>
        <Text style={s.headerSub}>{inspection.propertyAddress}</Text>
      </View>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.sectionLabel}>Choose the area you're inspecting:</Text>
        {inspection.rooms.map(room => {
          const findings = room.findings.length;
          const critical = room.findings.filter(f => f.severity === 'critical').length;
          const selected = selectedRoomId === room.id;
          return (
            <TouchableOpacity
              key={room.id}
              style={[s.roomCard, selected && s.roomCardSelected, room.completed && s.roomCardDone]}
              onPress={() => setSelectedRoomId(room.id)}
            >
              <View style={s.roomLeft}>
                <Text style={[s.roomName, selected && { color: NAVY }]}>{room.name}</Text>
                <Text style={s.roomMeta}>
                  {room.completed ? '✓ Inspected · ' : ''}
                  {findings} finding{findings !== 1 ? 's' : ''}
                  {critical > 0 ? ` · ${critical} critical` : ''}
                </Text>
              </View>
              <View style={[s.roomSelect, selected && s.roomSelectActive]}>
                {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={[s.startScanBtn, !selectedRoomId && s.startScanBtnDisabled]} onPress={startScan}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={s.startScanBtnText}>
            {selectedRoomId ? `Start Scanning: ${selectedRoom?.name}` : 'Select a Room to Begin'}
          </Text>
        </TouchableOpacity>

        {selectedRoomId && selectedRoom && !selectedRoom.completed && (
          <TouchableOpacity
            style={s.completeRoomBtn}
            onPress={() => {
              Alert.alert('Complete Room', `Mark ${selectedRoom.name} as fully inspected?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Complete', onPress: () => { completeRoom(inspection.id, selectedRoomId); Alert.alert('Done', `${selectedRoom.name} marked as inspected.`); } },
              ]);
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={GREEN} />
            <Text style={s.completeRoomBtnText}>Mark Room Complete</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: NAVY },
  headerSub: { fontSize: 11, color: TEXT2, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 16 },
  sectionLabel: { fontSize: 14, color: TEXT2, marginBottom: 12 },

  roomCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' },
  roomCardSelected: { borderColor: NAVY, backgroundColor: `${NAVY}05` },
  roomCardDone: { opacity: 0.8 },
  roomLeft: { flex: 1 },
  roomName: { fontSize: 14, fontWeight: '700', color: TEXT },
  roomMeta: { fontSize: 11, color: TEXT2, marginTop: 2 },
  roomSelect: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  roomSelectActive: { backgroundColor: NAVY, borderColor: NAVY },

  startScanBtn: { backgroundColor: NAVY, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, marginTop: 12 },
  startScanBtnDisabled: { opacity: 0.5 },
  startScanBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  completeRoomBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: `${GREEN}10`, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: `${GREEN}30` },
  completeRoomBtnText: { fontSize: 14, fontWeight: '700', color: GREEN },

  noInspection: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  noInspectionIcon: { fontSize: 48, marginBottom: 12 },
  noInspectionTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 6 },
  noInspectionSub: { fontSize: 14, color: TEXT2, textAlign: 'center' },

  // Viewfinder
  vfHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  vfBack: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  vfTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  typeScroll: { backgroundColor: CARD, maxHeight: 54, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  typeContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: CARD },
  typeBtnIcon: { fontSize: 14 },
  typeBtnText: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  cameraArea: { flex: 1, margin: 12, borderRadius: 16, backgroundColor: '#000', overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  mockCamera: { alignItems: 'center', gap: 8 },
  mockCameraText: { color: TEXT2, fontSize: 14 },
  corner: { position: 'absolute', width: 24, height: 24 },
  cornerTL: { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2, borderColor: NAVY, borderTopLeftRadius: 4 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2, borderColor: NAVY, borderTopRightRadius: 4 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: NAVY, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2, borderColor: NAVY, borderBottomRightRadius: 4 },
  aiOverlay: { position: 'absolute', top: 12, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  aiOverlayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
  aiOverlayText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  damageTypeOverlay: { position: 'absolute', bottom: 12, left: 0, right: 0, alignItems: 'center' },
  damageTypeOverlayText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  captureArea: { paddingVertical: 16, alignItems: 'center', gap: 8, backgroundColor: CARD },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  captureHint: { fontSize: 12, color: TEXT2 },

  // Analyzing
  analyzingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  analyzingIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  analyzingTitle: { fontSize: 22, fontWeight: '800', color: NAVY },
  analyzingType: { fontSize: 14, fontWeight: '600', marginBottom: 24 },
  stepsContainer: { width: '100%', gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 14 },

  // Result
  resultTitle: { fontSize: 18, fontWeight: '800', color: NAVY, marginBottom: 14 },
  resultCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, borderLeftWidth: 5, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 14 },
  resultTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  resultTypeIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resultType: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 4 },
  severityBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  severityDot: { width: 6, height: 6, borderRadius: 3 },
  severityText: { fontSize: 12, fontWeight: '700' },
  confidenceCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  confidenceNum: { fontSize: 13, fontWeight: '800', color: NAVY },
  confidenceLabel: { fontSize: 9, color: TEXT2 },
  resultDesc: { fontSize: 13, color: TEXT2, lineHeight: 19, marginBottom: 12 },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0F7FF', borderRadius: 10, padding: 10, marginBottom: 12 },
  costLabel: { flex: 1, fontSize: 13, color: NAVY, fontWeight: '600' },
  costRange: { fontSize: 14, fontWeight: '800', color: NAVY },
  aiNotesBlock: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 10 },
  aiNotesTitle: { fontSize: 12, fontWeight: '700', color: NAVY, marginBottom: 6 },
  aiNotesText: { fontSize: 12, color: TEXT2, lineHeight: 18 },
  proRequired: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${RED}10`, borderRadius: 10, padding: 10 },
  proRequiredText: { flex: 1, fontSize: 12, color: RED, fontWeight: '600' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: NAVY, borderRadius: 14, padding: 16, marginBottom: 10 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  discardBtn: { backgroundColor: '#F3F4F6', borderRadius: 14, padding: 14, alignItems: 'center' },
  discardBtnText: { fontSize: 14, color: TEXT2, fontWeight: '600' },
});
