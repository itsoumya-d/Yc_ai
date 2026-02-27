import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import {
  useInspectionStore,
  type Inspection,
  type InspectionPhoto,
} from '@/stores/inspections';
import {
  analyzeDamage,
  calculateOverallScore,
  getSeverityLabel,
  type DamageAssessment,
} from '@/services/ai';
import {
  COLORS,
  PROPERTY_AREAS,
  PROPERTY_TYPES,
  SEVERITY_COLORS,
  SPACING,
  RADIUS,
} from '@/constants/theme';

// ---- New Inspection Form ----

interface NewInspectionFormProps {
  onStart: (data: {
    propertyAddress: string;
    propertyType: string;
    claimNumber: string;
    insuredName: string;
  }) => void;
}

function NewInspectionForm({ onStart }: NewInspectionFormProps) {
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);
  const [claimNumber, setClaimNumber] = useState('');
  const [insuredName, setInsuredName] = useState('');

  const handleSubmit = () => {
    if (!address.trim() || !claimNumber.trim() || !insuredName.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    onStart({ propertyAddress: address.trim(), propertyType, claimNumber: claimNumber.trim(), insuredName: insuredName.trim() });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Inspection</Text>
        <Text style={styles.headerSub}>Enter property details to begin</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Property Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main St, City, State 12345"
            placeholderTextColor={COLORS.textSecondary}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Property Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, propertyType === type && styles.chipActive]}
                onPress={() => setPropertyType(type)}
              >
                <Text style={[styles.chipText, propertyType === type && styles.chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Claim Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="CLM-2024-XXXXXX"
            placeholderTextColor={COLORS.textSecondary}
            value={claimNumber}
            onChangeText={setClaimNumber}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Insured Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="John & Jane Smith"
            placeholderTextColor={COLORS.textSecondary}
            value={insuredName}
            onChangeText={setInsuredName}
          />
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleSubmit} activeOpacity={0.85}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.startButtonText}>Start Inspection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- Assessment Result Panel ----

function AssessmentPanel({
  assessment,
  onContinue,
  onFinish,
}: {
  assessment: DamageAssessment;
  onContinue: () => void;
  onFinish: () => void;
}) {
  const sev = SEVERITY_COLORS[assessment.severity] ?? SEVERITY_COLORS.none;
  return (
    <ScrollView style={styles.assessmentPanel} contentContainerStyle={{ padding: SPACING.md }}>
      <View style={styles.assessRow}>
        <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
          <Text style={[styles.severityText, { color: sev.text }]}>
            {getSeverityLabel(assessment.severity)}
          </Text>
        </View>
        <Text style={styles.damageType}>{assessment.damageType.toUpperCase()}</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNum}>{assessment.conditionScore}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>
      </View>

      <Text style={styles.assessTitle}>Description</Text>
      <Text style={styles.assessBody}>{assessment.description}</Text>

      <Text style={styles.assessTitle}>Estimated Repair Cost</Text>
      <Text style={styles.costText}>
        ${assessment.estimatedRepairCost.min.toLocaleString()} – $
        {assessment.estimatedRepairCost.max.toLocaleString()}
      </Text>

      {assessment.findings.length > 0 && (
        <>
          <Text style={styles.assessTitle}>Findings</Text>
          {assessment.findings.map((f, i) => (
            <Text key={i} style={styles.bulletItem}>
              • {f}
            </Text>
          ))}
        </>
      )}

      {assessment.recommendations.length > 0 && (
        <>
          <Text style={styles.assessTitle}>Recommendations</Text>
          {assessment.recommendations.map((r, i) => (
            <Text key={i} style={styles.bulletItem}>
              • {r}
            </Text>
          ))}
        </>
      )}

      <Text style={styles.assessTitle}>Coverage Notes</Text>
      <Text style={styles.assessBody}>{assessment.coverageRelevance}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
          <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
          <Text style={styles.continueBtnText}>Continue Inspection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishBtn} onPress={onFinish}>
          <Ionicons name="document-text-outline" size={18} color="#fff" />
          <Text style={styles.finishBtnText}>Finish & Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---- Camera Screen ----

function CameraScreen({
  inspection,
  onAssessment,
}: {
  inspection: Inspection;
  onAssessment: (area: string, assessment: DamageAssessment, uri: string, base64: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedArea, setSelectedArea] = useState(PROPERTY_AREAS[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || analyzing) return;
    try {
      setAnalyzing(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      if (!photo?.base64 || !photo?.uri) throw new Error('Capture failed');

      const assessment = await analyzeDamage(photo.base64, inspection.propertyType, selectedArea);
      onAssessment(selectedArea, assessment, photo.uri, photo.base64);
    } catch (err) {
      Alert.alert('Analysis Failed', 'Could not analyze photo. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [analyzing, inspection.propertyType, selectedArea, onAssessment]);

  if (!permission) return <View style={styles.safe} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="camera-off-outline" size={56} color={COLORS.textSecondary} />
        <Text style={styles.permText}>Camera access is required</Text>
        <TouchableOpacity style={styles.startButton} onPress={requestPermission}>
          <Text style={styles.startButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Area Selector */}
      <SafeAreaView style={styles.areaBar}>
        <FlatList
          data={PROPERTY_AREAS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: SPACING.sm, gap: SPACING.xs }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.areaChip, selectedArea === item && styles.areaChipActive]}
              onPress={() => setSelectedArea(item)}
            >
              <Text style={[styles.areaChipText, selectedArea === item && styles.areaChipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>

      {/* Camera */}
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        {/* Area Label */}
        <View style={styles.cameraLabel}>
          <Text style={styles.cameraLabelText}>{selectedArea}</Text>
        </View>

        {/* Analyzing Overlay */}
        {analyzing && (
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.analyzingText}>Analyzing damage...</Text>
          </View>
        )}
      </CameraView>

      {/* Capture Button */}
      <View style={styles.captureBar}>
        <View style={styles.captureInfo}>
          <Text style={styles.captureInfoText} numberOfLines={1}>
            {inspection.propertyAddress}
          </Text>
          <Text style={styles.captureInfoSub}>{inspection.photos.length} photos taken</Text>
        </View>
        <TouchableOpacity
          style={[styles.captureButton, analyzing && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={analyzing}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>
        <View style={{ width: 72 }} />
      </View>
    </View>
  );
}

// ---- Main Screen ----

export default function InspectScreen() {
  const router = useRouter();
  const { inspections, activeInspectionId, createInspection, addPhoto, updatePhoto, updateInspection, setActiveInspection } =
    useInspectionStore();

  const activeInspection = inspections.find((i) => i.id === activeInspectionId);
  const [lastAssessment, setLastAssessment] = useState<{
    area: string;
    assessment: DamageAssessment;
  } | null>(null);

  const handleStartInspection = useCallback(
    (data: { propertyAddress: string; propertyType: string; claimNumber: string; insuredName: string }) => {
      const id = `insp_${Date.now()}`;
      const now = new Date().toISOString();
      const inspection: Inspection = {
        id,
        ...data,
        status: 'in_progress',
        photos: [],
        createdAt: now,
        updatedAt: now,
      };
      createInspection(inspection);
    },
    [createInspection]
  );

  const handleAssessment = useCallback(
    (area: string, assessment: DamageAssessment, uri: string, base64: string) => {
      if (!activeInspectionId) return;
      const photoId = `photo_${Date.now()}`;
      const photo: InspectionPhoto = {
        id: photoId,
        inspectionId: activeInspectionId,
        area,
        uri,
        base64,
        assessment,
        uploadStatus: 'pending',
        capturedAt: new Date().toISOString(),
      };
      addPhoto(photo);
      setLastAssessment({ area, assessment });
    },
    [activeInspectionId, addPhoto]
  );

  const handleContinue = useCallback(() => {
    setLastAssessment(null);
  }, []);

  const handleFinishInspection = useCallback(() => {
    if (!activeInspection) return;
    const scores = activeInspection.photos
      .filter((p) => p.assessment)
      .map((p) => p.assessment!);
    const overallScore = calculateOverallScore(scores);
    updateInspection(activeInspection.id, { status: 'review', overallScore });
    setLastAssessment(null);
    Alert.alert(
      'Inspection Complete',
      `Overall condition score: ${overallScore}/100\n\nYou can now generate a report from the Reports tab.`,
      [
        {
          text: 'View Reports',
          onPress: () => router.push('/(tabs)/reports'),
        },
        { text: 'OK' },
      ]
    );
  }, [activeInspection, updateInspection, router]);

  // Show form if no active inspection
  if (!activeInspection) {
    return <NewInspectionForm onStart={handleStartInspection} />;
  }

  // Show assessment result
  if (lastAssessment) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{lastAssessment.area}</Text>
          <Text style={styles.headerSub}>Damage Assessment Complete</Text>
        </View>
        <AssessmentPanel
          assessment={lastAssessment.assessment}
          onContinue={handleContinue}
          onFinish={handleFinishInspection}
        />
      </SafeAreaView>
    );
  }

  // Show camera
  return (
    <CameraScreen
      inspection={activeInspection}
      onAssessment={handleAssessment}
    />
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? SPACING.md : 4,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  formContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  field: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: COLORS.text,
  },
  typeScroll: {
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.xs,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  permText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  areaBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  areaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  areaChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  areaChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  areaChipTextActive: {
    color: '#fff',
  },
  cameraLabel: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cameraLabelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  analyzingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  captureBar: {
    backgroundColor: '#000',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  captureInfo: {
    width: 100,
  },
  captureInfoText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  captureInfoSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 2,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  assessmentPanel: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  assessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  severityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  damageType: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNum: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  assessTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  assessBody: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  costText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.success,
  },
  bulletItem: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginLeft: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  continueBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
  },
  continueBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  finishBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
  },
  finishBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
