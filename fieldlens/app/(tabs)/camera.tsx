import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFieldLensStore, Trade, AiCapture } from '../../store/fieldlens-store';

const ORANGE = '#E8711A';
const SLATE = '#3A506B';
const DARK = '#1C1C1E';
const CARD = '#2C2C2E';
const CARD2 = '#3A3A3C';
const TEXT = '#F2F2F7';
const TEXT2 = '#8E8E93';
const GREEN = '#32D74B';
const AMBER = '#FFD60A';
const RED = '#FF453A';

type CaptureState = 'idle' | 'viewfinder' | 'capturing' | 'analyzing' | 'result';

const TRADE_LABELS: Record<Trade, { label: string; icon: string; color: string; prompt: string }> = {
  electrical: { label: 'Electrical', icon: '⚡', color: AMBER, prompt: 'electrical work, wiring, panels, outlets' },
  plumbing: { label: 'Plumbing', icon: '🔧', color: '#30D5C8', prompt: 'plumbing connections, pipes, fittings, seals' },
  hvac: { label: 'HVAC', icon: '❄️', color: '#64D2FF', prompt: 'HVAC systems, ductwork, filters, connections' },
  carpentry: { label: 'Carpentry', icon: '🪚', color: '#FF9F0A', prompt: 'carpentry, framing, trim, woodwork' },
  general: { label: 'General', icon: '🔨', color: TEXT2, prompt: 'general construction and field work' },
};

const AI_ASSESSMENTS = [
  {
    trade: 'electrical' as Trade,
    score: 91,
    findings: 'GFCI outlet installation meets NEC 2020 requirements. Wiring connections are properly secured with no exposed conductors. Box fill calculation is within limits.',
    issues: [],
    recommendation: 'Excellent work. Label the breaker and perform final torque check on terminals.',
    borderColor: GREEN,
  },
  {
    trade: 'plumbing' as Trade,
    score: 74,
    findings: 'P-trap alignment is correct and drain slope appears adequate. However, slip joint nut appears hand-tight only — will require wrench tightening to prevent leaks.',
    issues: ['Slip joint nut needs wrench tightening', 'No escutcheon plate installed at wall penetration'],
    recommendation: 'Tighten slip joint nut to manufacturer torque spec, then run a 5-minute leak test.',
    borderColor: AMBER,
  },
  {
    trade: 'hvac' as Trade,
    score: 88,
    findings: 'Filter installed correctly with airflow arrow pointing toward blower. Filter frame seal is intact. Rated MERV-11 — appropriate for residential application.',
    issues: ['Minor gap at filter frame edge (left side)'],
    recommendation: 'Seal filter frame gap with foam tape to prevent bypass. Note replacement date on filter.',
    borderColor: GREEN,
  },
  {
    trade: 'carpentry' as Trade,
    score: 62,
    findings: 'Door frame plumb is approximately 3/16" out of vertical on hinge side. Corner angles show gaps requiring filler. Fastener spacing is inconsistent.',
    issues: ['Hinge jamb 3/16" out of plumb', 'Corner gaps on trim', 'Irregular fastener spacing'],
    recommendation: 'Re-plumb hinge jamb before hanging door. Fill trim gaps with caulk and sand smooth.',
    borderColor: RED,
  },
  {
    trade: 'general' as Trade,
    score: 83,
    findings: 'Work area is organized and safety measures are in place. PPE compliance is good. Material staging is efficient with adequate access routes maintained.',
    issues: ['Cord management could be improved'],
    recommendation: 'Bundle and route extension cords along walls. Good overall site discipline.',
    borderColor: GREEN,
  },
];

export default function CameraScreen() {
  const { tasks, addCapture } = useFieldLensStore();
  const router = useRouter();
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const [selectedTrade, setSelectedTrade] = useState<Trade>('electrical');
  const [currentResult, setCurrentResult] = useState<typeof AI_ASSESSMENTS[0] | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const ANALYSIS_STEPS = [
    'Detecting trade type...',
    'Analyzing installation...',
    'Checking code compliance...',
    'Scoring quality metrics...',
    'Generating recommendations...',
  ];

  const startCapture = () => {
    setCaptureState('viewfinder');
  };

  const handleCapture = () => {
    setCaptureState('capturing');
    setTimeout(() => {
      setCaptureState('analyzing');
      let step = 0;
      setAnalysisStep(0);
      const interval = setInterval(() => {
        step++;
        setAnalysisStep(step);
        if (step >= ANALYSIS_STEPS.length - 1) {
          clearInterval(interval);
          const result = AI_ASSESSMENTS.find(a => a.trade === selectedTrade) ?? AI_ASSESSMENTS[0];
          setTimeout(() => {
            setCurrentResult(result);
            setCaptureState('result');
          }, 600);
        }
      }, 600);
    }, 400);
  };

  const saveCapture = () => {
    if (!currentResult) return;
    const capture: AiCapture = {
      id: Date.now().toString(),
      timestamp: 'Just now',
      imageUri: 'mock',
      score: currentResult.score,
      trade: selectedTrade,
      findings: currentResult.findings,
      issues: currentResult.issues,
      recommendation: currentResult.recommendation,
    };
    addCapture(capture);
    Alert.alert('Saved', 'AI capture saved to your history.', [
      { text: 'View Progress', onPress: () => router.push('/(tabs)/progress') },
      { text: 'New Capture', onPress: resetCapture },
    ]);
  };

  const resetCapture = () => {
    setCaptureState('idle');
    setCurrentResult(null);
    setAnalysisStep(0);
  };

  if (captureState === 'viewfinder' || captureState === 'capturing') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.viewfinder}>
          {/* Header */}
          <View style={s.vfHeader}>
            <TouchableOpacity onPress={resetCapture} style={s.vfBack}>
              <Ionicons name="chevron-back" size={24} color={TEXT} />
            </TouchableOpacity>
            <Text style={s.vfTitle}>{TRADE_LABELS[selectedTrade].icon} {TRADE_LABELS[selectedTrade].label}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Camera area */}
          <View style={s.cameraArea}>
            <View style={s.mockFrame}>
              <Text style={s.mockFrameText}>📷</Text>
              <Text style={s.mockFrameSub}>Camera preview</Text>
              <Text style={s.mockFrameNote}>Point at your {TRADE_LABELS[selectedTrade].prompt}</Text>
            </View>

            {/* Corner guides */}
            <View style={[s.corner, s.cornerTL]} />
            <View style={[s.corner, s.cornerTR]} />
            <View style={[s.corner, s.cornerBL]} />
            <View style={[s.corner, s.cornerBR]} />

            {/* Scan hint */}
            <View style={s.vfHint}>
              <Text style={s.vfHintText}>Frame your work clearly within the guides</Text>
            </View>
          </View>

          {/* Bottom controls */}
          <View style={s.vfBottom}>
            <TouchableOpacity style={s.flashBtn}>
              <Ionicons name="flash-outline" size={22} color={TEXT} />
            </TouchableOpacity>

            {/* 72px Orange capture button */}
            <TouchableOpacity
              style={[s.captureButton, captureState === 'capturing' && s.captureButtonActive]}
              onPress={handleCapture}
              disabled={captureState === 'capturing'}
            >
              <View style={s.captureButtonInner}>
                <Ionicons name="camera" size={32} color={DARK} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={s.flipBtn}>
              <Ionicons name="camera-reverse-outline" size={22} color={TEXT} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (captureState === 'analyzing') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.analyzingScreen}>
          <View style={s.analyzingIcon}>
            <Text style={{ fontSize: 48 }}>{TRADE_LABELS[selectedTrade].icon}</Text>
          </View>
          <Text style={s.analyzingTitle}>Analyzing Work Quality</Text>
          <Text style={s.analyzingTrade}>{TRADE_LABELS[selectedTrade].label}</Text>

          <View style={s.stepsContainer}>
            {ANALYSIS_STEPS.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={[s.stepDot, i < analysisStep ? s.stepDotDone : i === analysisStep ? s.stepDotActive : s.stepDotPending]}>
                  {i < analysisStep ? (
                    <Ionicons name="checkmark" size={12} color={DARK} />
                  ) : i === analysisStep ? (
                    <View style={s.stepDotPulse} />
                  ) : null}
                </View>
                <Text style={[s.stepText, i <= analysisStep ? s.stepTextActive : s.stepTextPending]}>{step}</Text>
              </View>
            ))}
          </View>

          <Text style={s.analyzingNote}>AI is checking code compliance and quality standards</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (captureState === 'result' && currentResult) {
    const scoreColor = currentResult.score >= 90 ? GREEN : currentResult.score >= 70 ? AMBER : RED;
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Back button */}
          <TouchableOpacity style={s.resultBack} onPress={resetCapture}>
            <Ionicons name="arrow-back" size={20} color={TEXT2} />
            <Text style={s.resultBackText}>New Capture</Text>
          </TouchableOpacity>

          {/* Result card — 3px colored top border */}
          <View style={[s.resultCard, { borderTopColor: currentResult.borderColor }]}>
            <View style={s.resultTop}>
              <View>
                <Text style={s.resultTrade}>{TRADE_LABELS[selectedTrade].icon} {TRADE_LABELS[selectedTrade].label}</Text>
                <Text style={s.resultTime}>Just analyzed</Text>
              </View>
              <View style={[s.scoreCircle, { borderColor: scoreColor }]}>
                <Text style={[s.scoreNum, { color: scoreColor }]}>{currentResult.score}</Text>
                <Text style={s.scoreLabel}>/ 100</Text>
              </View>
            </View>

            {/* Score bar */}
            <View style={s.scoreBar}>
              <View style={[s.scoreBarFill, { width: `${currentResult.score}%` as any, backgroundColor: scoreColor }]} />
            </View>

            <Text style={s.findingsTitle}>AI Assessment</Text>
            <Text style={s.findingsText}>{currentResult.findings}</Text>

            {currentResult.issues.length > 0 && (
              <View style={s.issuesBlock}>
                <Text style={s.issuesTitle}>⚠️ Issues Found</Text>
                {currentResult.issues.map((issue, i) => (
                  <View key={i} style={s.issueRow}>
                    <View style={s.issueDot} />
                    <Text style={s.issueText}>{issue}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={s.recBlock}>
              <Text style={s.recTitle}>💡 Recommendation</Text>
              <Text style={s.recText}>{currentResult.recommendation}</Text>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity style={s.saveBtn} onPress={saveCapture}>
            <Ionicons name="save-outline" size={20} color={DARK} />
            <Text style={s.saveBtnText}>Save to Progress History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.shareBtn} onPress={() => Alert.alert('Share', 'Share this assessment with your supervisor.')}>
            <Ionicons name="share-outline" size={20} color={ORANGE} />
            <Text style={s.shareBtnText}>Share Assessment</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Idle / trade select screen
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>AI Capture</Text>
          <Text style={s.headerSub}>Select trade, then capture your work</Text>
        </View>
        <View style={s.captureCount}>
          <Ionicons name="camera" size={16} color={ORANGE} />
          <Text style={s.captureCountText}>AI-Powered</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Trade selector */}
        <Text style={s.sectionLabel}>Select Trade</Text>
        <View style={s.tradeGrid}>
          {(Object.entries(TRADE_LABELS) as [Trade, typeof TRADE_LABELS[Trade]][]).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              style={[s.tradeBtn, selectedTrade === key && { borderColor: val.color, backgroundColor: `${val.color}15` }]}
              onPress={() => setSelectedTrade(key)}
            >
              <Text style={s.tradeBtnIcon}>{val.icon}</Text>
              <Text style={[s.tradeBtnLabel, selectedTrade === key && { color: val.color }]}>{val.label}</Text>
              {selectedTrade === key && (
                <View style={[s.tradeCheck, { backgroundColor: val.color }]}>
                  <Ionicons name="checkmark" size={10} color={DARK} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 72px Capture Button */}
        <View style={s.captureHeroArea}>
          <Text style={s.captureHeroLabel}>
            Analyzing: {TRADE_LABELS[selectedTrade].icon} {TRADE_LABELS[selectedTrade].label}
          </Text>
          <TouchableOpacity style={s.captureHeroBtn} onPress={startCapture}>
            <View style={s.captureHeroRing}>
              <Ionicons name="camera" size={36} color={DARK} />
            </View>
          </TouchableOpacity>
          <Text style={s.captureHeroNote}>AI will score quality & check code compliance</Text>
        </View>

        {/* Tips */}
        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>📌 Tips for Best Results</Text>
          {[
            'Good lighting — avoid harsh shadows',
            'Fill the frame with your work area',
            'Keep camera steady during capture',
            'Include key connection points',
          ].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <View style={s.tipDot} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* What AI checks */}
        <View style={s.checksCard}>
          <Text style={s.checksTitle}>What AI Analyzes</Text>
          <View style={s.checksGrid}>
            {[
              { icon: '📐', label: 'Code Compliance' },
              { icon: '⚡', label: 'Safety Issues' },
              { icon: '🔍', label: 'Installation Quality' },
              { icon: '📋', label: 'Best Practices' },
            ].map(item => (
              <View key={item.label} style={s.checkItem}>
                <Text style={s.checkIcon}>{item.icon}</Text>
                <Text style={s.checkLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#2C2C2E' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: TEXT },
  headerSub: { fontSize: 12, color: TEXT2, marginTop: 2 },
  captureCount: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${ORANGE}20`, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  captureCountText: { fontSize: 12, color: ORANGE, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Viewfinder
  viewfinder: { flex: 1, backgroundColor: DARK },
  vfHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  vfBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center' },
  vfTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  cameraArea: { flex: 1, margin: 16, borderRadius: 20, overflow: 'hidden', backgroundColor: '#111', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  mockFrame: { alignItems: 'center', gap: 8 },
  mockFrameText: { fontSize: 64 },
  mockFrameSub: { fontSize: 16, color: TEXT2, fontWeight: '600' },
  mockFrameNote: { fontSize: 12, color: TEXT2, textAlign: 'center', paddingHorizontal: 40 },
  corner: { position: 'absolute', width: 24, height: 24 },
  cornerTL: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderColor: ORANGE, borderTopLeftRadius: 4 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderColor: ORANGE, borderTopRightRadius: 4 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: ORANGE, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderColor: ORANGE, borderBottomRightRadius: 4 },
  vfHint: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
  vfHintText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  vfBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 24, paddingHorizontal: 40 },
  flashBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center' },
  flipBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center' },

  // 72px capture button
  captureButton: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  captureButtonActive: { opacity: 0.7 },
  captureButtonInner: { width: 72, height: 72, borderRadius: 36, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },

  // Analyzing screen
  analyzingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  analyzingIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  analyzingTitle: { fontSize: 22, fontWeight: '800', color: TEXT },
  analyzingTrade: { fontSize: 14, color: ORANGE, fontWeight: '600', marginBottom: 24 },
  stepsContainer: { width: '100%', gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepDotDone: { backgroundColor: GREEN },
  stepDotActive: { backgroundColor: ORANGE },
  stepDotPending: { backgroundColor: CARD2 },
  stepDotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: DARK },
  stepText: { fontSize: 14 },
  stepTextActive: { color: TEXT, fontWeight: '600' },
  stepTextPending: { color: TEXT2 },
  analyzingNote: { fontSize: 12, color: TEXT2, textAlign: 'center', marginTop: 16, lineHeight: 18 },

  // Result card — key: borderTopWidth: 4, borderTopColor from result
  resultBack: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  resultBackText: { fontSize: 14, color: TEXT2 },
  resultCard: { backgroundColor: CARD, borderRadius: 18, padding: 18, marginBottom: 14, borderTopWidth: 4 },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  resultTrade: { fontSize: 16, fontWeight: '700', color: TEXT },
  resultTime: { fontSize: 12, color: TEXT2, marginTop: 2 },
  scoreCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: 18, fontWeight: '800' },
  scoreLabel: { fontSize: 9, color: TEXT2 },
  scoreBar: { height: 6, backgroundColor: CARD2, borderRadius: 3, overflow: 'hidden', marginBottom: 16 },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  findingsTitle: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 6 },
  findingsText: { fontSize: 13, color: TEXT2, lineHeight: 19, marginBottom: 14 },
  issuesBlock: { backgroundColor: `${RED}10`, borderRadius: 10, padding: 12, marginBottom: 12 },
  issuesTitle: { fontSize: 12, fontWeight: '700', color: RED, marginBottom: 8 },
  issueRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  issueDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: RED, marginTop: 5 },
  issueText: { flex: 1, fontSize: 12, color: `${RED}DD`, lineHeight: 18 },
  recBlock: { backgroundColor: `${AMBER}10`, borderRadius: 10, padding: 12 },
  recTitle: { fontSize: 12, fontWeight: '700', color: AMBER, marginBottom: 6 },
  recText: { fontSize: 12, color: TEXT2, lineHeight: 18 },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ORANGE, borderRadius: 14, padding: 16, marginBottom: 10 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: DARK },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: `${ORANGE}15`, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: `${ORANGE}40` },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: ORANGE },

  // Trade selector
  sectionLabel: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 12 },
  tradeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  tradeBtn: { width: '48%', backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  tradeBtnIcon: { fontSize: 24, marginBottom: 6 },
  tradeBtnLabel: { fontSize: 13, fontWeight: '700', color: TEXT2 },
  tradeCheck: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  // Hero capture button area
  captureHeroArea: { alignItems: 'center', marginBottom: 24 },
  captureHeroLabel: { fontSize: 14, color: TEXT2, marginBottom: 20 },
  captureHeroBtn: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: ORANGE, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  captureHeroRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  captureHeroNote: { fontSize: 12, color: TEXT2, textAlign: 'center' },

  tipsCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14 },
  tipsTitle: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE },
  tipText: { fontSize: 12, color: TEXT2, flex: 1 },

  checksCard: { backgroundColor: CARD, borderRadius: 14, padding: 14 },
  checksTitle: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 12 },
  checksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  checkItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkIcon: { fontSize: 18 },
  checkLabel: { fontSize: 12, color: TEXT2 },
});
