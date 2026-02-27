import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Camera, Check, ChevronDown, ChevronUp, AlertTriangle, Trophy } from 'lucide-react-native';
import { getGuideById } from '@/lib/guides';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const guide = getGuideById(id ?? '');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showTips, setShowTips] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  if (!guide) {
    return <View style={styles.container}><Text style={styles.notFound}>Guide not found</Text></View>;
  }

  const step = guide.steps[currentStep];
  const isCompleted = completedSteps.has(currentStep);
  const isLastStep = currentStep === guide.steps.length - 1;
  const allCompleted = completedSteps.size === guide.steps.length;

  const handleComplete = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (!isLastStep) {
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setShowTips(false);
        setShowErrors(false);
      }, 400);
    }
  };

  if (allCompleted) {
    return (
      <View style={styles.container}>
        <View style={styles.completedScreen}>
          <Trophy size={64} color="#d97706" />
          <Text style={styles.completedTitle}>Task Complete!</Text>
          <Text style={styles.completedSub}>{guide.title}</Text>
          <Text style={styles.completedStats}>{guide.steps.length} steps completed</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/')}>
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{guide.title}</Text>
        <Text style={styles.stepCounter}>{currentStep + 1}/{guide.steps.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((currentStep) / guide.steps.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step header */}
        <View style={styles.stepHeader}>
          <View style={[styles.stepNum, isCompleted && styles.stepNumCompleted]}>
            {isCompleted ? <Check size={16} color="#111827" /> : <Text style={styles.stepNumText}>{currentStep + 1}</Text>}
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{step.instructions}</Text>
        </View>

        {/* Code reference */}
        {step.code_reference && (
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Code Reference</Text>
            <Text style={styles.codeText}>{step.code_reference}</Text>
          </View>
        )}

        {/* Tools */}
        {step.tools.length > 0 && (
          <View style={styles.toolsCard}>
            <Text style={styles.toolsLabel}>Tools Needed</Text>
            <View style={styles.toolsList}>
              {step.tools.map((tool, i) => (
                <View key={i} style={styles.toolTag}>
                  <Text style={styles.toolText}>{tool}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        {step.tips.length > 0 && (
          <TouchableOpacity style={styles.expandable} onPress={() => setShowTips(!showTips)}>
            <Text style={styles.expandableTitle}>Pro Tips ({step.tips.length})</Text>
            {showTips ? <ChevronUp size={16} color="#d97706" /> : <ChevronDown size={16} color="#d97706" />}
          </TouchableOpacity>
        )}
        {showTips && step.tips.map((tip, i) => (
          <View key={i} style={styles.tipItem}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}

        {/* Common errors */}
        {step.common_errors.length > 0 && (
          <TouchableOpacity style={[styles.expandable, styles.expandableError]} onPress={() => setShowErrors(!showErrors)}>
            <View style={styles.expandableLeft}>
              <AlertTriangle size={14} color="#ef4444" />
              <Text style={[styles.expandableTitle, { color: '#ef4444' }]}>Common Mistakes ({step.common_errors.length})</Text>
            </View>
            {showErrors ? <ChevronUp size={16} color="#ef4444" /> : <ChevronDown size={16} color="#ef4444" />}
          </TouchableOpacity>
        )}
        {showErrors && step.common_errors.map((err, i) => (
          <View key={i} style={styles.errorItem}>
            <AlertTriangle size={12} color="#ef4444" />
            <Text style={styles.errorItemText}>{err}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/scan')}>
          <Camera size={18} color="#d97706" />
          <Text style={styles.scanBtnText}>Check My Work</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.completeBtn, isCompleted && styles.completeBtnDone]}
          onPress={isCompleted && !isLastStep ? () => { setCurrentStep((s) => s + 1); setShowTips(false); setShowErrors(false); } : handleComplete}
        >
          {isCompleted ? <ArrowRight size={18} color="#111827" /> : <Check size={18} color="#111827" />}
          <Text style={styles.completeBtnText}>
            {isCompleted ? (isLastStep ? 'Done!' : 'Next Step') : 'Mark Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#111827', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#ffffff' },
  stepCounter: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  progressBar: { height: 3, backgroundColor: '#1e293b' },
  progressFill: { height: '100%', backgroundColor: '#d97706' },
  content: { padding: 20, gap: 14, paddingBottom: 120 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepNum: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#d97706', alignItems: 'center', justifyContent: 'center' },
  stepNumCompleted: { backgroundColor: '#10b981' },
  stepNumText: { fontSize: 16, fontWeight: '800', color: '#111827' },
  stepTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: '#ffffff' },
  instructions: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16 },
  instructionsText: { fontSize: 14, color: '#e2e8f0', lineHeight: 22 },
  codeCard: { backgroundColor: '#0f2342', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: '#3b82f6' },
  codeLabel: { fontSize: 10, fontWeight: '700', color: '#60a5fa', marginBottom: 4 },
  codeText: { fontSize: 13, color: '#93c5fd', fontFamily: 'monospace' },
  toolsCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14 },
  toolsLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', marginBottom: 8 },
  toolsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toolTag: { backgroundColor: '#374151', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  toolText: { fontSize: 12, color: '#e2e8f0' },
  expandable: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', borderRadius: 12, padding: 14 },
  expandableError: { backgroundColor: '#1a1520' },
  expandableLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expandableTitle: { fontSize: 13, fontWeight: '600', color: '#d97706' },
  tipItem: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, alignItems: 'flex-start' },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d97706', marginTop: 6 },
  tipText: { flex: 1, fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  errorItem: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, alignItems: 'flex-start' },
  errorItemText: { flex: 1, fontSize: 12, color: '#fca5a5', lineHeight: 17 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 36, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b' },
  scanBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1e293b', borderRadius: 14, paddingVertical: 14 },
  scanBtnText: { fontSize: 14, fontWeight: '600', color: '#d97706' },
  completeBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#d97706', borderRadius: 14, paddingVertical: 14 },
  completeBtnDone: { backgroundColor: '#10b981' },
  completeBtnText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  completedScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
  completedTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff' },
  completedSub: { fontSize: 16, color: '#9ca3af' },
  completedStats: { fontSize: 14, color: '#d97706' },
  doneBtn: { backgroundColor: '#d97706', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 40, marginTop: 8 },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  notFound: { color: '#6b7280', textAlign: 'center', marginTop: 100, fontSize: 16 },
});
