import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { analyzeWorkplaceSafety, type HazardAnalysis } from '@/services/ai';
import { useInspectionStore } from '@/stores/inspections';
import {
  COLORS,
  FACILITY_TYPES,
  INSPECTION_AREAS,
  SCORE_COLORS,
  VIOLATION_SEVERITY_COLORS,
} from '@/constants/theme';

type Phase = 'setup' | 'scanning' | 'analyzing' | 'result';

function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Setup form
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState(FACILITY_TYPES[0]);
  const [inspectorName, setInspectorName] = useState('');
  const [showFacilityPicker, setShowFacilityPicker] = useState(false);

  // Scan state
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedArea, setSelectedArea] = useState<string>(INSPECTION_AREAS[0]);
  const [latestAnalysis, setLatestAnalysis] = useState<HazardAnalysis | null>(null);
  const [capturedAreaId, setCapturedAreaId] = useState<string | null>(null);

  const {
    createInspection,
    setActiveInspection,
    addArea,
    updateAreaAnalysis,
    updateInspection,
    getActiveInspection,
  } = useInspectionStore();

  const activeInspection = getActiveInspection();

  // ---- Phase 1: Setup ----
  const handleStartInspection = useCallback(() => {
    if (!facilityName.trim()) {
      Alert.alert('Missing Info', 'Please enter a facility name.');
      return;
    }
    if (!inspectorName.trim()) {
      Alert.alert('Missing Info', 'Please enter your name as inspector.');
      return;
    }
    const newInspection = {
      id: randomId(),
      facilityId: randomId(),
      facilityName: facilityName.trim(),
      facilityType,
      inspectorName: inspectorName.trim(),
      status: 'in_progress' as const,
      areas: [],
      reportGenerated: false,
      createdAt: new Date().toISOString(),
    };
    createInspection(newInspection);
    setActiveInspection(newInspection.id);
    setPhase('scanning');
  }, [facilityName, facilityType, inspectorName, createInspection, setActiveInspection]);

  // ---- Phase 2: Capture ----
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !activeInspection) return;
    try {
      setPhase('analyzing');
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });
      if (!photo?.base64) throw new Error('No image captured');

      const areaId = randomId();
      setCapturedAreaId(areaId);
      addArea({
        id: areaId,
        inspectionId: activeInspection.id,
        areaName: selectedArea,
        photoUri: photo.uri,
        base64: photo.base64,
        capturedAt: new Date().toISOString(),
      });

      const analysis = await analyzeWorkplaceSafety(
        photo.base64,
        activeInspection.facilityType,
        selectedArea,
      );
      updateAreaAnalysis(activeInspection.id, areaId, analysis);
      setLatestAnalysis(analysis);
      setPhase('result');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      Alert.alert('Error', msg);
      setPhase('scanning');
    }
  }, [activeInspection, selectedArea, addArea, updateAreaAnalysis]);

  // ---- Next Area ----
  const handleNextArea = useCallback(() => {
    setLatestAnalysis(null);
    setCapturedAreaId(null);
    setPhase('scanning');
  }, []);

  // ---- Complete Inspection ----
  const handleCompleteInspection = useCallback(() => {
    if (!activeInspection) return;
    const areas = activeInspection.areas.filter((a) => a.analysis);
    if (areas.length === 0) {
      Alert.alert('No Areas Scanned', 'Scan at least one area before completing.');
      return;
    }
    const scores = areas
      .map((a) => a.analysis?.complianceScore ?? 100)
      .filter(Boolean);
    const overallScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100;
    updateInspection(activeInspection.id, {
      status: 'review',
      overallScore,
    });
    setActiveInspection(null);
    setPhase('setup');
    setFacilityName('');
    setInspectorName('');
    setLatestAnalysis(null);
    Alert.alert(
      'Inspection Complete',
      `Overall compliance score: ${overallScore}/100\n\nInspection is now in review.`,
      [{ text: 'View Reports', onPress: () => router.push('/(tabs)/reports') }, { text: 'Done' }],
    );
  }, [activeInspection, updateInspection, setActiveInspection]);

  // ---- Permission Check ----
  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Ionicons name="camera-outline" size={56} color={COLORS.border} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permText}>
          ComplianceSnap needs camera access to capture workplace photos for
          hazard analysis.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---- Phase: Setup ----
  if (phase === 'setup') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Ionicons name="camera" size={22} color="#FFFFFF" />
          <Text style={styles.headerTitle}>New Inspection</Text>
        </View>
        <ScrollView contentContainerStyle={styles.setupContent}>
          <Text style={styles.fieldLabel}>Facility Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Acme Plant — Building A"
            placeholderTextColor={COLORS.border}
            value={facilityName}
            onChangeText={setFacilityName}
          />

          <Text style={styles.fieldLabel}>Facility Type *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowFacilityPicker(!showFacilityPicker)}
          >
            <Text style={styles.pickerText}>{facilityType}</Text>
            <Ionicons
              name={showFacilityPicker ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          {showFacilityPicker && (
            <View style={styles.pickerDropdown}>
              {FACILITY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pickerOption,
                    facilityType === type && styles.pickerOptionActive,
                  ]}
                  onPress={() => {
                    setFacilityType(type);
                    setShowFacilityPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      facilityType === type && styles.pickerOptionTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                  {facilityType === type && (
                    <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.fieldLabel}>Inspector Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor={COLORS.border}
            value={inspectorName}
            onChangeText={setInspectorName}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 24 }]}
            onPress={handleStartInspection}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Begin Scanning</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ---- Phase: Analyzing ----
  if (phase === 'analyzing') {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.analyzingTitle}>Analyzing for Hazards...</Text>
        <Text style={styles.analyzingSubtitle}>
          GPT-4o Vision is scanning the image for OSHA violations
        </Text>
      </View>
    );
  }

  // ---- Phase: Result ----
  if (phase === 'result' && latestAnalysis) {
    const hasCritical = latestAnalysis.violations.some(
      (v) => v.severity === 'critical',
    );
    const scoreColor = SCORE_COLORS.getColor(latestAnalysis.complianceScore);
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analysis Results</Text>
          <Text style={styles.headerSubtitle}>{selectedArea}</Text>
        </View>
        {hasCritical && (
          <View style={styles.criticalBanner}>
            <Ionicons name="alert-circle" size={22} color="#FFFFFF" />
            <Text style={styles.criticalBannerText}>
              IMMINENT DANGER — STOP WORK REQUIRED
            </Text>
          </View>
        )}
        <ScrollView contentContainerStyle={styles.resultContent}>
          {/* Score */}
          <View style={styles.resultScoreCard}>
            <View style={[styles.scoreBubble, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreBubbleNum, { color: scoreColor }]}>
                {latestAnalysis.complianceScore}
              </Text>
              <Text style={styles.scoreBubbleLabel}>/ 100</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultSummary}>{latestAnalysis.summary}</Text>
              <View style={[styles.riskChip, { backgroundColor: scoreColor + '20' }]}>
                <Text style={[styles.riskChipText, { color: scoreColor }]}>
                  {latestAnalysis.overallRiskLevel.toUpperCase()} RISK
                </Text>
              </View>
            </View>
          </View>

          {/* Violations */}
          {latestAnalysis.violations.length > 0 && (
            <>
              <Text style={styles.resultSectionTitle}>
                Violations Found ({latestAnalysis.violations.length})
              </Text>
              {latestAnalysis.violations.map((v, i) => {
                const sevColor =
                  VIOLATION_SEVERITY_COLORS[
                    v.severity as keyof typeof VIOLATION_SEVERITY_COLORS
                  ] ?? COLORS.textSecondary;
                return (
                  <View key={i} style={styles.violationCard}>
                    <View style={styles.violationHeader}>
                      <View style={[styles.sevBadge, { backgroundColor: sevColor }]}>
                        <Text style={styles.sevBadgeText}>
                          {v.severity.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.oshaStd}>{v.oshaStandard}</Text>
                    </View>
                    <Text style={styles.violationType}>{v.violationType}</Text>
                    <Text style={styles.violationDesc}>{v.description}</Text>
                    <View style={styles.actionRow}>
                      <Ionicons name="flash" size={14} color={COLORS.warning} />
                      <Text style={styles.actionText}>{v.immediateAction}</Text>
                    </View>
                    {v.estimatedFine && (
                      <Text style={styles.fineText}>
                        Estimated fine: {v.estimatedFine}
                      </Text>
                    )}
                  </View>
                );
              })}
            </>
          )}

          {/* Positive Practices */}
          {latestAnalysis.positivePractices.length > 0 && (
            <>
              <Text style={styles.resultSectionTitle}>Good Practices Observed</Text>
              {latestAnalysis.positivePractices.map((p, i) => (
                <View key={i} style={styles.positiveRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.positiveText}>{p}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        <View style={[styles.resultActions, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleNextArea}>
            <Ionicons name="camera" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Next Area</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleCompleteInspection}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---- Phase: Scanning ----
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Safety Scan</Text>
          <Text style={styles.headerSubtitle}>
            {activeInspection?.facilityName ?? ''}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCompleteInspection} style={styles.completeBtn}>
          <Text style={styles.completeBtnText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Area Selector */}
      <View style={styles.areaScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {INSPECTION_AREAS.map((area) => (
            <TouchableOpacity
              key={area}
              style={[
                styles.areaChip,
                selectedArea === area && styles.areaChipActive,
              ]}
              onPress={() => setSelectedArea(area)}
            >
              <Text
                style={[
                  styles.areaChipText,
                  selectedArea === area && styles.areaChipTextActive,
                ]}
              >
                {area}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
        />
        {/* Viewfinder corners */}
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <View style={styles.areaLabel}>
          <Text style={styles.areaLabelText}>{selectedArea}</Text>
        </View>
      </View>

      {/* Capture Controls */}
      <View style={[styles.captureBar, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.areaCount}>
          {activeInspection?.areas.length ?? 0} area
          {(activeInspection?.areas.length ?? 0) !== 1 ? 's' : ''} scanned
        </Text>
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        <Text style={styles.captureHint}>Tap to capture</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#FCA5A5', fontSize: 12, marginTop: 2 },
  setupContent: { padding: 20, gap: 4 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  picker: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: { fontSize: 15, color: COLORS.text },
  pickerDropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerOptionActive: { backgroundColor: COLORS.primaryLight },
  pickerOptionText: { fontSize: 14, color: COLORS.text },
  pickerOptionTextActive: { color: COLORS.primary, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  permTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  permText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  analyzingTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  analyzingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  areaScroll: { paddingVertical: 12, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  areaChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  areaChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  areaChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  areaChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  cameraContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  viewfinder: {
    position: 'absolute',
    inset: 32,
    borderRadius: 2,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#FFFFFF',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  areaLabel: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  areaLabelText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  captureBar: {
    backgroundColor: COLORS.surface,
    paddingTop: 16,
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
  },
  areaCount: { fontSize: 12, color: COLORS.textSecondary },
  captureHint: { fontSize: 11, color: COLORS.border },
  completeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  completeBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  criticalBanner: {
    backgroundColor: '#7F1D1D',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  criticalBannerText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, flex: 1 },
  resultContent: { padding: 16, gap: 8, paddingBottom: 120 },
  resultScoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  scoreBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  scoreBubbleNum: { fontSize: 22, fontWeight: '800' },
  scoreBubbleLabel: { fontSize: 10, color: COLORS.textSecondary },
  resultSummary: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 8 },
  riskChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskChipText: { fontSize: 11, fontWeight: '700' },
  resultSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  violationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 6,
  },
  violationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sevBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  sevBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  oshaStd: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic' },
  violationType: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  violationDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  actionText: { fontSize: 13, color: COLORS.text, flex: 1, lineHeight: 18 },
  fineText: { fontSize: 12, color: '#B45309', fontWeight: '600' },
  positiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  positiveText: { fontSize: 13, color: '#166534', flex: 1, lineHeight: 18 },
  resultActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
});
