import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuraStore, SkinCheckIn, SkinConcern } from '../../store/aura-store';

const TEAL = '#0D9488';
const LAVENDER = '#A78BFA';
const CORAL = '#F472B6';
const BG = '#F0FDFA';
const CARD = '#FFFFFF';
const TEXT = '#134E4A';
const TEXT2 = '#6B7280';
const GREEN = '#10B981';
const AMBER = '#F59E0B';

type CheckInStep = 'photo' | 'lifestyle' | 'concerns' | 'analyzing' | 'result';

const CONCERN_OPTIONS: { key: SkinConcern; label: string; icon: string }[] = [
  { key: 'dryness', label: 'Dryness', icon: '💧' },
  { key: 'oiliness', label: 'Oiliness', icon: '✨' },
  { key: 'acne', label: 'Acne / Breakouts', icon: '🔴' },
  { key: 'redness', label: 'Redness', icon: '🌹' },
  { key: 'pigmentation', label: 'Pigmentation', icon: '🟤' },
  { key: 'sensitivity', label: 'Sensitivity', icon: '🌸' },
  { key: 'aging', label: 'Fine Lines / Aging', icon: '🌿' },
  { key: 'texture', label: 'Texture Issues', icon: '🫧' },
];

const LIGHTING_TIPS = [
  { icon: '☀️', tip: 'Natural light from a window works best' },
  { icon: '📐', tip: 'Face the camera straight on at eye level' },
  { icon: '🚫', tip: 'Avoid harsh overhead or side lighting' },
  { icon: '✨', tip: 'Clean face, no makeup for accuracy' },
];

const AI_RESULT = {
  overallScore: 81,
  metrics: [
    { label: 'Hydration', score: 82, trend: 'improving' as const, note: 'Well hydrated, slight tightness near temples' },
    { label: 'Clarity', score: 84, trend: 'improving' as const, note: 'Clear and calm, minor residual redness' },
    { label: 'Texture', score: 78, trend: 'stable' as const, note: 'Smooth overall, slight roughness on cheeks' },
    { label: 'Tone', score: 80, trend: 'stable' as const, note: 'Even and bright tone observed' },
  ],
  aiSummary: 'Your skin looks healthy and well-cared-for in today\'s check-in. Hydration levels are strong and clarity has continued improving. We recommend consistent SPF application and a gentle exfoliant 1-2x weekly to maintain your progress. Always consult a dermatologist for any persistent concerns.',
  recommendations: [
    'Apply SPF 30+ sunscreen each morning',
    'Consider a gentle AHA exfoliant 1-2x per week',
    'Keep up current hydration routine',
    'See a dermatologist annually for professional skin health assessment',
  ],
};

export default function CheckInScreen() {
  const { addCheckIn } = useAuraStore();
  const router = useRouter();
  const [step, setStep] = useState<CheckInStep>('photo');
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [selectedConcerns, setSelectedConcerns] = useState<SkinConcern[]>([]);
  const [sleep, setSleep] = useState('7.5');
  const [hydration, setHydration] = useState('8');
  const [stress, setStress] = useState(2);
  const [analysisStep, setAnalysisStep] = useState(0);

  const ANALYSIS_STEPS = [
    'Analyzing skin tone and texture...',
    'Evaluating hydration levels...',
    'Checking clarity and pores...',
    'Assessing overall health score...',
    'Preparing personalized insights...',
  ];

  const handlePhotoCapture = () => {
    setPhotoCaptured(true);
  };

  const startAnalysis = () => {
    setStep('analyzing');
    let s = 0;
    setAnalysisStep(0);
    const interval = setInterval(() => {
      s++;
      setAnalysisStep(s);
      if (s >= ANALYSIS_STEPS.length - 1) {
        clearInterval(interval);
        setTimeout(() => setStep('result'), 700);
      }
    }, 700);
  };

  const toggleConcern = (c: SkinConcern) => {
    setSelectedConcerns(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const saveCheckIn = () => {
    const checkIn: SkinCheckIn = {
      id: Date.now().toString(),
      date: 'Today',
      overallScore: AI_RESULT.overallScore,
      metrics: AI_RESULT.metrics,
      concerns: selectedConcerns,
      aiSummary: AI_RESULT.aiSummary,
      recommendations: AI_RESULT.recommendations,
      photoUri: 'mock',
      lifestyle: {
        sleep: parseFloat(sleep) || 7,
        hydration: parseInt(hydration) || 8,
        stress,
      },
    };
    addCheckIn(checkIn);
    Alert.alert('Check-In Saved! 🌿', 'Your skin check-in has been recorded.', [
      { text: 'View Home', onPress: () => router.push('/(tabs)') },
      { text: 'View Journal', onPress: () => router.push('/(tabs)/journal') },
    ]);
  };

  // Photo step
  if (step === 'photo') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Daily Check-In</Text>
          <View style={s.stepIndicator}>
            <Text style={s.stepText}>1 / 3</Text>
          </View>
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          <View style={s.disclaimer}>
            <Ionicons name="information-circle-outline" size={14} color={TEXT2} />
            <Text style={s.disclaimerText}>This is not medical advice. AI analysis is for wellness tracking only.</Text>
          </View>

          <Text style={s.sectionTitle}>📸 Take Your Skin Photo</Text>

          {/* Lighting tips */}
          <View style={s.tipsCard}>
            <Text style={s.tipsTitle}>Tips for best results</Text>
            {LIGHTING_TIPS.map((tip, i) => (
              <View key={i} style={s.tipRow}>
                <Text style={s.tipIcon}>{tip.icon}</Text>
                <Text style={s.tipText}>{tip.tip}</Text>
              </View>
            ))}
          </View>

          {/* Camera viewfinder mock */}
          <View style={s.cameraCard}>
            {!photoCaptured ? (
              <View style={s.cameraFrame}>
                <View style={[s.corner, s.cornerTL]} />
                <View style={[s.corner, s.cornerTR]} />
                <View style={[s.corner, s.cornerBL]} />
                <View style={[s.corner, s.cornerBR]} />
                {/* Face oval guide */}
                <View style={s.faceOval} />
                <Text style={s.cameraHint}>Position face in oval</Text>
              </View>
            ) : (
              <View style={s.photoDone}>
                <Ionicons name="checkmark-circle" size={48} color={GREEN} />
                <Text style={s.photoDoneText}>Photo captured!</Text>
                <TouchableOpacity onPress={() => setPhotoCaptured(false)}>
                  <Text style={s.retakeText}>Retake photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {!photoCaptured ? (
            <TouchableOpacity style={s.captureBtn} onPress={handlePhotoCapture}>
              <View style={s.captureBtnInner}>
                <Ionicons name="camera" size={28} color="#fff" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.nextBtn} onPress={() => setStep('lifestyle')}>
              <Text style={s.nextBtnText}>Next: Lifestyle Data →</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Lifestyle step
  if (step === 'lifestyle') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setStep('photo')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={TEXT} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Today's Lifestyle</Text>
          <View style={s.stepIndicator}><Text style={s.stepText}>2 / 3</Text></View>
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          <Text style={s.sectionTitle}>How did you do today?</Text>
          <Text style={s.sectionSub}>Lifestyle factors affect skin health — tracking helps identify patterns.</Text>

          <View style={s.lifestyleInputCard}>
            <Text style={s.inputLabel}>😴 Sleep last night (hours)</Text>
            <TextInput
              style={s.input}
              value={sleep}
              onChangeText={setSleep}
              keyboardType="decimal-pad"
              placeholder="e.g. 7.5"
              placeholderTextColor={TEXT2}
            />
          </View>

          <View style={s.lifestyleInputCard}>
            <Text style={s.inputLabel}>💧 Glasses of water today</Text>
            <TextInput
              style={s.input}
              value={hydration}
              onChangeText={setHydration}
              keyboardType="number-pad"
              placeholder="e.g. 8"
              placeholderTextColor={TEXT2}
            />
          </View>

          <View style={s.lifestyleInputCard}>
            <Text style={s.inputLabel}>😌 Stress level today</Text>
            <View style={s.stressRow}>
              {['😌 Low', '🙂 Mild', '😐 Med', '😤 High', '😰 V.High'].map((label, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.stressBtn, stress === i + 1 && s.stressBtnActive]}
                  onPress={() => setStress(i + 1)}
                >
                  <Text style={[s.stressBtnText, stress === i + 1 && s.stressBtnTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={s.nextBtn} onPress={() => setStep('concerns')}>
            <Text style={s.nextBtnText}>Next: Today's Concerns →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Concerns step
  if (step === 'concerns') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setStep('lifestyle')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={TEXT} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Today's Concerns</Text>
          <View style={s.stepIndicator}><Text style={s.stepText}>3 / 3</Text></View>
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          <Text style={s.sectionTitle}>Any concerns today? (optional)</Text>
          <Text style={s.sectionSub}>Select any skin concerns you've noticed today.</Text>

          <View style={s.concernGrid}>
            {CONCERN_OPTIONS.map(opt => {
              const selected = selectedConcerns.includes(opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[s.concernBtn, selected && s.concernBtnSelected]}
                  onPress={() => toggleConcern(opt.key)}
                >
                  <Text style={s.concernBtnIcon}>{opt.icon}</Text>
                  <Text style={[s.concernBtnLabel, selected && s.concernBtnLabelSelected]}>{opt.label}</Text>
                  {selected && <View style={s.concernCheck}><Ionicons name="checkmark" size={10} color="#fff" /></View>}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={s.analyzeBtn} onPress={startAnalysis}>
            <Ionicons name="sparkles-outline" size={20} color="#fff" />
            <Text style={s.analyzeBtnText}>Analyze My Skin</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Analyzing
  if (step === 'analyzing') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.analyzingScreen}>
          <View style={s.analyzingIcon}>
            <Text style={{ fontSize: 48 }}>✨</Text>
          </View>
          <Text style={s.analyzingTitle}>Analyzing Your Skin</Text>
          <Text style={s.analyzingSub}>AI is processing your check-in data</Text>
          <View style={s.stepsContainer}>
            {ANALYSIS_STEPS.map((stepLabel, i) => (
              <View key={i} style={s.stepRow}>
                <View style={[s.stepDot,
                  i < analysisStep ? { backgroundColor: GREEN } :
                  i === analysisStep ? { backgroundColor: TEAL } :
                  { backgroundColor: '#E5E7EB' }
                ]}>
                  {i < analysisStep && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={[s.stepLabel, i <= analysisStep ? { color: TEXT } : { color: TEXT2 }]}>{stepLabel}</Text>
              </View>
            ))}
          </View>
          <View style={s.disclaimerBox}>
            <Text style={s.disclaimerBoxText}>⚠️ This is not medical advice. Consult a dermatologist for any skin concerns.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Result
  const scoreColor = AI_RESULT.overallScore >= 80 ? GREEN : AI_RESULT.overallScore >= 60 ? AMBER : CORAL;
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <View style={s.resultHeader}>
          <Text style={s.resultTitle}>Your Skin Check-In</Text>
          <Text style={s.resultSub}>Today · AI Analysis Complete</Text>
        </View>

        <View style={s.resultScoreCard}>
          <View style={[s.resultScoreRing, { borderColor: scoreColor }]}>
            <Text style={[s.resultScoreNum, { color: scoreColor }]}>{AI_RESULT.overallScore}</Text>
            <Text style={s.resultScoreLabel}>/ 100</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.resultScoreTitle}>Skin Health Score</Text>
            <Text style={s.resultScoreNote}>Great progress! Up 7 pts from last check-in</Text>
          </View>
        </View>

        {AI_RESULT.metrics.map(metric => {
          const color = metric.score >= 80 ? GREEN : metric.score >= 60 ? AMBER : CORAL;
          return (
            <View key={metric.label} style={s.resultMetric}>
              <View style={s.resultMetricTop}>
                <Text style={s.resultMetricLabel}>{metric.label}</Text>
                <Text style={[s.resultMetricNum, { color }]}>{metric.score}</Text>
              </View>
              <View style={s.resultMetricBar}>
                <View style={[s.resultMetricBarFill, { width: `${metric.score}%` as any, backgroundColor: color }]} />
              </View>
              <Text style={s.resultMetricNote}>{metric.note}</Text>
            </View>
          );
        })}

        <View style={s.resultSummaryCard}>
          <Text style={s.resultSummaryTitle}>✨ AI Summary</Text>
          <Text style={s.resultSummaryText}>{AI_RESULT.aiSummary}</Text>
        </View>

        <View style={s.resultRecsCard}>
          <Text style={s.cardTitle}>Recommendations</Text>
          {AI_RESULT.recommendations.map((rec, i) => (
            <View key={i} style={s.resultRecRow}>
              <View style={s.resultRecNum}><Text style={s.resultRecNumText}>{i + 1}</Text></View>
              <Text style={s.resultRecText}>{rec}</Text>
            </View>
          ))}
        </View>

        <View style={s.resultDisclaimer}>
          <Ionicons name="alert-circle-outline" size={14} color={TEXT2} />
          <Text style={s.resultDisclaimerText}>This is not medical advice. Always consult a qualified dermatologist for diagnosis and treatment of skin conditions.</Text>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={saveCheckIn}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={s.saveBtnText}>Save Check-In to Journal</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT, flex: 1, textAlign: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  stepIndicator: { backgroundColor: `${TEAL}15`, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  stepText: { fontSize: 12, color: TEAL, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 16 },

  disclaimer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${TEAL}08`, borderRadius: 10, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: `${TEAL}20` },
  disclaimerText: { flex: 1, fontSize: 11, color: TEXT2, lineHeight: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 6 },
  sectionSub: { fontSize: 13, color: TEXT2, marginBottom: 16, lineHeight: 18 },

  tipsCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  tipsTitle: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  tipIcon: { fontSize: 16, width: 24 },
  tipText: { flex: 1, fontSize: 12, color: TEXT2 },

  cameraCard: { backgroundColor: '#111', borderRadius: 20, height: 280, marginBottom: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  cameraFrame: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  corner: { position: 'absolute', width: 24, height: 24 },
  cornerTL: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderColor: TEAL, borderTopLeftRadius: 4 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderColor: TEAL, borderTopRightRadius: 4 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: TEAL, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderColor: TEAL, borderBottomRightRadius: 4 },
  faceOval: { width: 140, height: 190, borderRadius: 70, borderWidth: 2, borderColor: 'rgba(13, 148, 136, 0.5)', borderStyle: 'dashed' },
  cameraHint: { position: 'absolute', bottom: 16, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  photoDone: { alignItems: 'center', gap: 8 },
  photoDoneText: { fontSize: 16, color: '#fff', fontWeight: '700' },
  retakeText: { fontSize: 13, color: TEAL },

  captureBtn: { alignSelf: 'center', width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: TEAL, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  captureBtnInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },

  nextBtn: { backgroundColor: TEAL, borderRadius: 14, padding: 16, alignItems: 'center' },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  lifestyleInputCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 10 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, fontSize: 16, color: TEXT, borderWidth: 1, borderColor: '#E5E7EB' },
  stressRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  stressBtn: { flex: 1, minWidth: 60, backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  stressBtnActive: { backgroundColor: `${TEAL}15`, borderColor: TEAL },
  stressBtnText: { fontSize: 10, color: TEXT2, fontWeight: '600', textAlign: 'center' },
  stressBtnTextActive: { color: TEAL },

  concernGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  concernBtn: { width: '48%', backgroundColor: CARD, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', position: 'relative' },
  concernBtnSelected: { borderColor: TEAL, backgroundColor: `${TEAL}10` },
  concernBtnIcon: { fontSize: 20, marginBottom: 4 },
  concernBtnLabel: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  concernBtnLabelSelected: { color: TEAL },
  concernCheck: { position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },

  analyzeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: TEAL, borderRadius: 14, padding: 16 },
  analyzeBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  analyzingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  analyzingIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: `${TEAL}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  analyzingTitle: { fontSize: 22, fontWeight: '800', color: TEXT },
  analyzingSub: { fontSize: 14, color: TEXT2, marginBottom: 24 },
  stepsContainer: { width: '100%', gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontSize: 14 },
  disclaimerBox: { marginTop: 24, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12 },
  disclaimerBoxText: { fontSize: 12, color: '#92400E', textAlign: 'center', lineHeight: 18 },

  // Result
  resultHeader: { alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontSize: 20, fontWeight: '800', color: TEXT },
  resultSub: { fontSize: 13, color: TEXT2, marginTop: 4 },
  resultScoreCard: { backgroundColor: CARD, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  resultScoreRing: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  resultScoreNum: { fontSize: 22, fontWeight: '800' },
  resultScoreLabel: { fontSize: 10, color: TEXT2 },
  resultScoreTitle: { fontSize: 15, fontWeight: '700', color: TEXT },
  resultScoreNote: { fontSize: 12, color: GREEN, marginTop: 4 },
  resultMetric: { backgroundColor: CARD, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  resultMetricTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  resultMetricLabel: { fontSize: 13, fontWeight: '600', color: TEXT },
  resultMetricNum: { fontSize: 13, fontWeight: '800' },
  resultMetricBar: { height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  resultMetricBarFill: { height: '100%', borderRadius: 2 },
  resultMetricNote: { fontSize: 11, color: TEXT2 },
  resultSummaryCard: { backgroundColor: `${TEAL}08`, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: `${TEAL}20` },
  resultSummaryTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 8 },
  resultSummaryText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  resultRecsCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 12 },
  resultRecRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  resultRecNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: `${TEAL}15`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resultRecNumText: { fontSize: 11, fontWeight: '700', color: TEAL },
  resultRecText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },
  resultDisclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, marginBottom: 16 },
  resultDisclaimerText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: TEAL, borderRadius: 14, padding: 16 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
