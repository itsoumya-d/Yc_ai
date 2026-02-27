import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Camera, Upload, Zap, X, AlertCircle, CheckCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react-native';
import { analyzeSkin, getMockAnalysis } from '@/lib/openai';
import { saveSkinCheck, generateId } from '@/lib/storage';
import type { BodyArea, SkinCheck, SkinAnalysis } from '@/types/database';

const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const BODY_AREAS: { value: BodyArea; label: string }[] = [
  { value: 'face', label: 'Face' },
  { value: 'neck', label: 'Neck' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'left_arm', label: 'Left Arm' },
  { value: 'right_arm', label: 'Right Arm' },
  { value: 'hands', label: 'Hands' },
  { value: 'scalp', label: 'Scalp' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_CONFIG = {
  stable: { color: '#10b981', bg: '#d1fae5', label: 'Stable', icon: CheckCircle },
  monitor: { color: '#f59e0b', bg: '#fef3c7', label: 'Monitor', icon: AlertCircle },
  see_dermatologist: { color: '#ef4444', bg: '#fee2e2', label: 'See Dermatologist', icon: AlertCircle },
};

type ScanMode = 'setup' | 'analyzing' | 'results' | 'error';

export default function ScanScreen() {
  const [mode, setMode] = useState<ScanMode>('setup');
  const [bodyArea, setBodyArea] = useState<BodyArea>('face');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);

  const analyzeImage = useCallback(async (uri: string) => {
    setMode('analyzing');
    try {
      let result: SkinAnalysis;
      if (OPENAI_KEY) {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        result = await analyzeSkin(base64, bodyArea, 3);
      } else {
        await new Promise((r) => setTimeout(r, 2000));
        result = getMockAnalysis(bodyArea);
      }

      const check: SkinCheck = {
        id: generateId(),
        user_id: 'local',
        body_area: bodyArea,
        image_uri: uri,
        analysis: result,
        created_at: new Date().toISOString(),
      };
      await saveSkinCheck(check);
      setAnalysis(result);
      setMode('results');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed');
      setMode('error');
    }
  }, [bodyArea]);

  const handleCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const picked = await ImagePicker.launchCameraAsync({ quality: 0.85, aspect: [1, 1] });
    if (!picked.canceled && picked.assets[0]) {
      setImageUri(picked.assets[0].uri);
      analyzeImage(picked.assets[0].uri);
    }
  }, [analyzeImage]);

  const handleGallery = useCallback(async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!picked.canceled && picked.assets[0]) {
      setImageUri(picked.assets[0].uri);
      analyzeImage(picked.assets[0].uri);
    }
  }, [analyzeImage]);

  const handleReset = () => {
    setMode('setup');
    setImageUri(null);
    setAnalysis(null);
    setErrorMsg(null);
    setExpandedCondition(null);
  };

  if (mode === 'setup') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Skin Check</Text>
          <Text style={styles.headerSub}>Select area and take a photo</Text>
        </View>

        <ScrollView contentContainerStyle={styles.setupContent}>
          <Text style={styles.sectionLabel}>Body Area</Text>
          <View style={styles.bodyAreaGrid}>
            {BODY_AREAS.map((area) => (
              <TouchableOpacity
                key={area.value}
                style={[styles.areaBtn, bodyArea === area.value && styles.areaBtnActive]}
                onPress={() => setBodyArea(area.value)}
              >
                <Text style={[styles.areaBtnText, bodyArea === area.value && styles.areaBtnTextActive]}>
                  {area.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.captureSection}>
            <Text style={styles.sectionLabel}>Capture Photo</Text>
            <View style={styles.captureButtons}>
              <TouchableOpacity style={styles.cameraPrimary} onPress={handleCamera}>
                <Camera size={28} color="#ffffff" />
                <Text style={styles.cameraPrimaryText}>Take Photo</Text>
                <Text style={styles.cameraPrimarySub}>Best quality</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryBtn} onPress={handleGallery}>
                <Upload size={24} color="#e11d48" />
                <Text style={styles.galleryBtnText}>Upload</Text>
                <Text style={styles.galleryBtnSub}>From library</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.guideCard}>
            <Zap size={16} color="#e11d48" />
            <Text style={styles.guideText}>
              Tips: Good lighting, 15-20cm distance, keep phone perpendicular to skin. Avoid shadows and blurry photos.
            </Text>
          </View>

          <Text style={styles.disclaimerText}>
            {!OPENAI_KEY ? 'Demo mode — results are simulated. Add EXPO_PUBLIC_OPENAI_API_KEY for real analysis.' : ''}
          </Text>
        </ScrollView>
      </View>
    );
  }

  if (mode === 'analyzing') {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <View style={styles.analyzingContent}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.analyzingPreview} />}
          <View style={styles.loadingSpinnerWrap}>
            <Zap size={28} color="#e11d48" />
          </View>
          <Text style={styles.analyzingTitle}>Analyzing your skin...</Text>
          <Text style={styles.analyzingSubtext}>AI is carefully reviewing your photo</Text>
        </View>
      </View>
    );
  }

  if (mode === 'error') {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <View style={styles.errorContent}>
          <AlertCircle size={40} color="#ef4444" />
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleReset}>
            <RotateCcw size={16} color="#ffffff" />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Results
  const config = analysis ? SEVERITY_CONFIG[analysis.overall_severity] : SEVERITY_CONFIG.stable;
  const SeverityIcon = config.icon;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Analysis Results</Text>
        <TouchableOpacity onPress={handleReset} style={styles.closeBtn}>
          <X size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.resultImage} />
      )}

      {/* Overall severity */}
      <View style={[styles.severityBanner, { backgroundColor: config.bg, borderLeftColor: config.color }]}>
        <SeverityIcon size={22} color={config.color} />
        <View style={styles.severityInfo}>
          <Text style={[styles.severityLabel, { color: config.color }]}>{config.label}</Text>
          <Text style={styles.severityArea}>{bodyArea.replace('_', ' ')}</Text>
        </View>
        {analysis && (
          <Text style={styles.conditionCount}>{analysis.conditions.length} finding{analysis.conditions.length !== 1 ? 's' : ''}</Text>
        )}
      </View>

      {/* Summary */}
      {analysis?.summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{analysis.summary}</Text>
        </View>
      )}

      {/* Conditions */}
      {analysis && analysis.conditions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Findings</Text>
          {analysis.conditions.map((condition) => {
            const isExpanded = expandedCondition === condition.id;
            const condConfig = SEVERITY_CONFIG[condition.severity];
            return (
              <TouchableOpacity
                key={condition.id}
                style={[styles.conditionCard, { borderLeftColor: condConfig.color }]}
                onPress={() => setExpandedCondition(isExpanded ? null : condition.id)}
              >
                <View style={styles.conditionHeader}>
                  <View style={[styles.conditionBadge, { backgroundColor: condConfig.bg }]}>
                    <Text style={[styles.conditionBadgeText, { color: condConfig.color }]}>{condConfig.label}</Text>
                  </View>
                  <Text style={styles.conditionName} numberOfLines={isExpanded ? undefined : 1}>{condition.name}</Text>
                  {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                </View>
                {isExpanded && (
                  <View style={styles.conditionBody}>
                    <Text style={styles.conditionDesc}>{condition.description}</Text>
                    {condition.abcde && Object.keys(condition.abcde).length > 0 && (
                      <View style={styles.abcde}>
                        <Text style={styles.abcdeTitle}>ABCDE Assessment</Text>
                        {Object.entries(condition.abcde).map(([key, val]) => val ? (
                          <View key={key} style={styles.abcdeRow}>
                            <Text style={styles.abcdeKey}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                            <Text style={styles.abcdeVal}>{val}</Text>
                          </View>
                        ) : null)}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Positives */}
      {analysis && analysis.positive_observations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Positive Signs</Text>
          {analysis.positive_observations.map((obs, i) => (
            <View key={i} style={styles.positiveItem}>
              <CheckCircle size={14} color="#10b981" />
              <Text style={styles.positiveText}>{obs}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendation */}
      {analysis?.overall_severity === 'see_dermatologist' && (
        <View style={styles.urgentCard}>
          <AlertCircle size={20} color="#ef4444" />
          <Text style={styles.urgentText}>
            We recommend scheduling a consultation with a licensed dermatologist for proper evaluation.
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.newCheckBtn} onPress={handleReset}>
        <Camera size={16} color="#ffffff" />
        <Text style={styles.newCheckBtnText}>New Check</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centeredContainer: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  headerSub: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  setupContent: { padding: 20, gap: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  bodyAreaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  areaBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#e2e8f0' },
  areaBtnActive: { backgroundColor: '#e11d48', borderColor: '#e11d48' },
  areaBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  areaBtnTextActive: { color: '#ffffff' },
  captureSection: {},
  captureButtons: { flexDirection: 'row', gap: 12 },
  cameraPrimary: { flex: 2, backgroundColor: '#e11d48', borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 },
  cameraPrimaryText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  cameraPrimarySub: { fontSize: 12, color: '#fda4af' },
  galleryBtn: { flex: 1, backgroundColor: '#ffffff', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#e2e8f0' },
  galleryBtnText: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  galleryBtnSub: { fontSize: 11, color: '#94a3b8' },
  guideCard: { flexDirection: 'row', gap: 10, backgroundColor: '#fff1f2', borderRadius: 12, padding: 14, alignItems: 'flex-start' },
  guideText: { flex: 1, fontSize: 12, color: '#9f1239', lineHeight: 18 },
  disclaimerText: { fontSize: 11, color: '#f59e0b', textAlign: 'center' },
  analyzingContent: { alignItems: 'center', gap: 16, padding: 40 },
  analyzingPreview: { width: 200, height: 200, borderRadius: 20, marginBottom: 8 },
  loadingSpinnerWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center' },
  analyzingTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  analyzingSubtext: { fontSize: 13, color: '#94a3b8' },
  errorContent: { alignItems: 'center', gap: 12, padding: 40 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  errorText: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  retryBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#e11d48', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  resultsContainer: { paddingBottom: 40 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#ffffff' },
  resultsTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  resultImage: { width: '100%', height: 250, resizeMode: 'cover' },
  severityBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 16, borderLeftWidth: 4 },
  severityInfo: { flex: 1 },
  severityLabel: { fontSize: 16, fontWeight: '700' },
  severityArea: { fontSize: 12, color: '#64748b', textTransform: 'capitalize', marginTop: 2 },
  conditionCount: { fontSize: 13, color: '#94a3b8' },
  summaryCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginHorizontal: 16, marginTop: 12 },
  summaryText: { fontSize: 14, color: '#334155', lineHeight: 21 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  conditionCard: { backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 10, borderLeftWidth: 3, overflow: 'hidden' },
  conditionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  conditionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  conditionBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  conditionName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0f172a' },
  conditionBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  conditionDesc: { fontSize: 13, color: '#475569', lineHeight: 19 },
  abcde: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, gap: 6 },
  abcdeTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 4 },
  abcdeRow: { flexDirection: 'row', gap: 8 },
  abcdeKey: { fontSize: 12, fontWeight: '700', color: '#334155', width: 70 },
  abcdeVal: { flex: 1, fontSize: 12, color: '#64748b' },
  positiveItem: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  positiveText: { flex: 1, fontSize: 13, color: '#166534' },
  urgentCard: { flexDirection: 'row', gap: 12, backgroundColor: '#fee2e2', borderRadius: 14, marginHorizontal: 16, marginTop: 16, padding: 16, alignItems: 'flex-start' },
  urgentText: { flex: 1, fontSize: 13, color: '#991b1b', lineHeight: 19 },
  newCheckBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e11d48', borderRadius: 16, marginHorizontal: 16, marginTop: 20, paddingVertical: 14 },
  newCheckBtnText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
});
