import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Camera, Upload, Zap, X, Check, ChevronDown, ChevronUp, AlertTriangle, RotateCcw } from 'lucide-react-native';
import { analyzeTradeWork, getMockAnalysis, type TradeAnalysisResult } from '@/lib/openai';

const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
type ScanMode = 'idle' | 'analyzing' | 'results' | 'error';

const SEVERITY_COLORS = {
  warning: { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  critical: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  safety: { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
};

export default function ScanScreen() {
  const [mode, setMode] = useState<ScanMode>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<TradeAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [stepContext, setStepContext] = useState('');
  const [trade, setTrade] = useState('plumbing');

  const analyzeImage = useCallback(async (uri: string) => {
    setMode('analyzing');
    setResult(null);
    try {
      let analysisResult: TradeAnalysisResult;
      if (OPENAI_KEY) {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        analysisResult = await analyzeTradeWork(base64, trade, stepContext || undefined);
      } else {
        await new Promise((r) => setTimeout(r, 2000));
        analysisResult = getMockAnalysis(trade);
      }
      setResult(analysisResult);
      setMode('results');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed');
      setMode('error');
    }
  }, [trade, stepContext]);

  const handleCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const picked = await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false });
    if (!picked.canceled && picked.assets[0]) {
      setImageUri(picked.assets[0].uri);
      analyzeImage(picked.assets[0].uri);
    }
  }, [analyzeImage]);

  const handleGallery = useCallback(async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!picked.canceled && picked.assets[0]) {
      setImageUri(picked.assets[0].uri);
      analyzeImage(picked.assets[0].uri);
    }
  }, [analyzeImage]);

  const handleReset = useCallback(() => {
    setMode('idle');
    setImageUri(null);
    setResult(null);
    setErrorMsg(null);
    setExpandedError(null);
  }, []);

  const overallColor = result?.overall_assessment === 'good' ? '#10b981' : result?.overall_assessment === 'critical' ? '#ef4444' : '#f59e0b';

  return (
    <View style={styles.container}>
      {/* Preview area */}
      <View style={styles.preview}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.previewEmpty}>
            <View style={styles.previewIcon}>
              <Camera size={40} color="#d97706" />
            </View>
            <Text style={styles.previewTitle}>AI Work Inspector</Text>
            <Text style={styles.previewSub}>Take or upload a photo of your trade work</Text>
          </View>
        )}

        {mode === 'analyzing' && (
          <View style={styles.analyzingOverlay}>
            <Zap size={32} color="#d97706" />
            <Text style={styles.analyzingText}>Analyzing your work...</Text>
            <Text style={styles.analyzingSubtext}>{OPENAI_KEY ? 'GPT-4o Vision' : 'Demo mode'}</Text>
          </View>
        )}

        {imageUri && mode !== 'analyzing' && (
          <TouchableOpacity style={styles.closeBtn} onPress={handleReset}>
            <X size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Context input (idle) */}
      {mode === 'idle' && (
        <View style={styles.contextArea}>
          <TextInput
            value={stepContext}
            onChangeText={setStepContext}
            placeholder="What are you working on? (optional)"
            placeholderTextColor="#6b7280"
            style={styles.contextInput}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCamera}>
              <Camera size={22} color="#111827" />
              <Text style={styles.primaryBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleGallery}>
              <Upload size={22} color="#d97706" />
              <Text style={styles.secondaryBtnText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Error */}
      {mode === 'error' && (
        <View style={styles.errorArea}>
          <View style={styles.errorBox}>
            <AlertTriangle size={20} color="#ef4444" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
          <TouchableOpacity style={styles.retryBtn} onPress={handleReset}>
            <RotateCcw size={16} color="#111827" />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {mode === 'results' && result && (
        <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
          {/* Score banner */}
          <View style={[styles.scoreBanner, { borderLeftColor: overallColor }]}>
            <Text style={[styles.scoreValue, { color: overallColor }]}>{result.score}/100</Text>
            <View style={styles.scoreDetails}>
              <Text style={styles.scoreLabel}>
                {result.overall_assessment === 'good' ? '✓ Looking good!' : result.overall_assessment === 'critical' ? '⚠ Critical issues found' : '! Needs attention'}
              </Text>
              <Text style={styles.errorCount}>{result.errors.length} issue{result.errors.length !== 1 ? 's' : ''} found</Text>
            </View>
          </View>

          {/* Errors */}
          {result.errors.length > 0 && (
            <View style={styles.errorsList}>
              <Text style={styles.errorsTitle}>Issues to Fix</Text>
              {result.errors.map((err) => {
                const isExpanded = expandedError === err.id;
                const colors = SEVERITY_COLORS[err.severity];
                return (
                  <TouchableOpacity
                    key={err.id}
                    style={[styles.errorCard, { borderLeftColor: colors.border }]}
                    onPress={() => setExpandedError(isExpanded ? null : err.id)}
                  >
                    <View style={styles.errorCardHeader}>
                      <View style={[styles.severityBadge, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.severityText, { color: colors.text }]}>{err.severity.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.errorTitle} numberOfLines={isExpanded ? undefined : 1}>{err.title}</Text>
                      {isExpanded ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
                    </View>
                    {isExpanded && (
                      <View style={styles.errorCardBody}>
                        <Text style={styles.errorDesc}>{err.description}</Text>
                        <View style={styles.fixSection}>
                          <Text style={styles.fixLabel}>How to fix:</Text>
                          <Text style={styles.fixText}>{err.how_to_fix}</Text>
                        </View>
                        {err.code_reference && (
                          <Text style={styles.codeRef}>Code: {err.code_reference}</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Positives */}
          {result.positive_observations.length > 0 && (
            <View style={styles.positives}>
              <Text style={styles.positivesTitle}>What's Good</Text>
              {result.positive_observations.map((obs, i) => (
                <View key={i} style={styles.positiveItem}>
                  <Check size={14} color="#10b981" />
                  <Text style={styles.positiveText}>{obs}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Next step */}
          {result.next_step_guidance && (
            <View style={styles.nextStep}>
              <Text style={styles.nextStepLabel}>Next:</Text>
              <Text style={styles.nextStepText}>{result.next_step_guidance}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.scanAgainBtn} onPress={handleReset}>
            <Text style={styles.scanAgainText}>Scan Another Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  preview: { height: 280, backgroundColor: '#111827', position: 'relative' },
  previewImage: { width: '100%', height: '100%' },
  previewEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  previewIcon: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#d97706', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  previewTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  previewSub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 40 },
  analyzingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', gap: 12 },
  analyzingText: { fontSize: 16, fontWeight: '600', color: '#d97706' },
  analyzingSubtext: { fontSize: 12, color: '#9ca3af' },
  closeBtn: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  contextArea: { padding: 20, gap: 12 },
  contextInput: { backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#ffffff' },
  actions: { flexDirection: 'row', gap: 12 },
  primaryBtn: { flex: 2, backgroundColor: '#d97706', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  secondaryBtn: { flex: 1, backgroundColor: '#1e293b', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#d97706' },
  errorArea: { padding: 20, gap: 12 },
  errorBox: { flexDirection: 'row', gap: 10, backgroundColor: '#1e293b', borderRadius: 12, padding: 16, alignItems: 'flex-start' },
  errorText: { flex: 1, fontSize: 13, color: '#fca5a5' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d97706', borderRadius: 12, paddingVertical: 12 },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  results: { flex: 1 },
  resultsContent: { padding: 16, gap: 16, paddingBottom: 32 },
  scoreBanner: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16, borderLeftWidth: 4 },
  scoreValue: { fontSize: 32, fontWeight: '800' },
  scoreDetails: { flex: 1, gap: 4 },
  scoreLabel: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  errorCount: { fontSize: 12, color: '#9ca3af' },
  errorsList: { gap: 10 },
  errorsTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  errorCard: { backgroundColor: '#1e293b', borderRadius: 12, overflow: 'hidden', borderLeftWidth: 3 },
  errorCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  severityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  severityText: { fontSize: 9, fontWeight: '800' },
  errorTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: '#f1f5f9' },
  errorCardBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 8, borderTopWidth: 1, borderTopColor: '#334155' },
  errorDesc: { fontSize: 12, color: '#94a3b8', lineHeight: 17 },
  fixSection: { gap: 4 },
  fixLabel: { fontSize: 11, fontWeight: '700', color: '#d97706' },
  fixText: { fontSize: 12, color: '#cbd5e1', lineHeight: 17 },
  codeRef: { fontSize: 11, color: '#60a5fa', fontFamily: 'monospace' },
  positives: { gap: 8 },
  positivesTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  positiveItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  positiveText: { flex: 1, fontSize: 12, color: '#86efac', lineHeight: 17 },
  nextStep: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#d97706' },
  nextStepLabel: { fontSize: 11, fontWeight: '700', color: '#d97706', marginBottom: 4 },
  nextStepText: { fontSize: 13, color: '#e2e8f0', lineHeight: 18 },
  scanAgainBtn: { backgroundColor: '#1e293b', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  scanAgainText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
});
