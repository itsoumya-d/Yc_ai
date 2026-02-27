import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFieldLensStore, Trade, FieldTask } from '../../store/fieldlens-store';

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

const TRADE_LABELS: Record<Trade, { label: string; icon: string; color: string }> = {
  electrical: { label: 'Electrical', icon: '⚡', color: AMBER },
  plumbing: { label: 'Plumbing', icon: '🔧', color: '#30D5C8' },
  hvac: { label: 'HVAC', icon: '❄️', color: '#64D2FF' },
  carpentry: { label: 'Carpentry', icon: '🪚', color: '#FF9F0A' },
  general: { label: 'General', icon: '🔨', color: TEXT2 },
};

const STATUS_LABELS = {
  pending: { label: 'Pending', color: TEXT2 },
  in_progress: { label: 'In Progress', color: ORANGE },
  completed: { label: 'Completed', color: GREEN },
  flagged: { label: 'Flagged', color: RED },
};

function TaskCard({ task, onPress }: { task: FieldTask; onPress: () => void }) {
  const trade = TRADE_LABELS[task.trade];
  const status = STATUS_LABELS[task.status];
  const completedSteps = task.steps.filter(s => s.completed).length;
  const pct = (completedSteps / task.steps.length) * 100;
  const diff = '●'.repeat(task.difficulty) + '○'.repeat(3 - task.difficulty);

  return (
    <TouchableOpacity style={[s.taskCard, task.status === 'flagged' && s.taskCardFlagged]} onPress={onPress}>
      <View style={s.taskTop}>
        <Text style={s.taskIcon}>{trade.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.taskTitle}>{task.title}</Text>
          <Text style={s.taskMeta}>
            {task.trade.toUpperCase()} · {task.estimatedMinutes} min · {diff}
          </Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: `${status.color}20` }]}>
          <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: task.status === 'flagged' ? RED : ORANGE }]} />
      </View>
      <Text style={s.progressText}>{completedSteps}/{task.steps.length} steps · {Math.round(pct)}% complete</Text>

      {task.status === 'flagged' && task.aiScore != null && (
        <View style={s.flaggedNote}>
          <Ionicons name="warning" size={14} color={RED} />
          <Text style={s.flaggedNoteText}>AI Score: {task.aiScore} — Review required</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function TaskGuide({ task, onClose }: { task: FieldTask; onClose: () => void }) {
  const { completeStep, completeTask } = useFieldLensStore();
  const trade = TRADE_LABELS[task.trade];
  const completedSteps = task.steps.filter(s => s.completed).length;
  const allDone = completedSteps === task.steps.length;

  const handleCompleteStep = (stepId: string) => {
    completeStep(task.id, stepId);
  };

  const handleCompleteTask = () => {
    if (!allDone) {
      Alert.alert('Steps Remaining', 'Complete all steps before marking as done.');
      return;
    }
    completeTask(task.id);
    Alert.alert('Task Complete! 🎉', 'Great work. Task marked as completed.', [
      { text: 'Done', onPress: onClose },
    ]);
  };

  return (
    <View style={s.guideContainer}>
      {/* Guide header */}
      <View style={s.guideHeader}>
        <TouchableOpacity onPress={onClose} style={s.guideBack}>
          <Ionicons name="arrow-back" size={20} color={TEXT} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.guideTitle} numberOfLines={1}>{task.title}</Text>
          <Text style={s.guideMeta}>{trade.icon} {TRADE_LABELS[task.trade].label} · {task.estimatedMinutes} min</Text>
        </View>
        <Text style={s.guideProgress}>{completedSteps}/{task.steps.length}</Text>
      </View>

      <ScrollView style={s.guideScroll} contentContainerStyle={s.guideContent} showsVerticalScrollIndicator={false}>
        {/* Tools needed */}
        {task.toolsNeeded.length > 0 && (
          <View style={s.toolsCard}>
            <Text style={s.toolsTitle}>🧰 Tools Needed</Text>
            <View style={s.toolsRow}>
              {task.toolsNeeded.map(tool => (
                <View key={tool} style={s.toolChip}>
                  <Text style={s.toolChipText}>{tool}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Steps */}
        <Text style={s.stepsTitle}>Step-by-Step Guide</Text>
        {task.steps.map((step, i) => (
          <TouchableOpacity
            key={step.id}
            style={[s.stepCard, step.completed && s.stepCardDone]}
            onPress={() => !step.completed && handleCompleteStep(step.id)}
            disabled={step.completed}
          >
            <View style={s.stepLeft}>
              <View style={[s.stepNum, step.completed && s.stepNumDone]}>
                {step.completed
                  ? <Ionicons name="checkmark" size={14} color={DARK} />
                  : <Text style={s.stepNumText}>{i + 1}</Text>
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.stepInstruction, step.completed && s.stepInstructionDone]}>
                  {step.instruction}
                </Text>
                {step.requiresPhoto && (
                  <View style={s.photoRequired}>
                    <Ionicons name="camera-outline" size={12} color={ORANGE} />
                    <Text style={s.photoRequiredText}>Photo documentation required</Text>
                  </View>
                )}
                {step.aiNote && (
                  <Text style={s.aiNote}>💡 {step.aiNote}</Text>
                )}
              </View>
            </View>
            {!step.completed && (
              <View style={s.stepTap}>
                <Text style={s.stepTapText}>Tap when done</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* AI assessment hint */}
        {!allDone && (
          <View style={s.aiHintCard}>
            <Text style={s.aiHintIcon}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.aiHintTitle}>AI Quality Check</Text>
              <Text style={s.aiHintText}>Use the Capture tab to get an AI quality assessment of your work at any point.</Text>
            </View>
          </View>
        )}

        {/* Complete button */}
        <TouchableOpacity
          style={[s.completeBtn, !allDone && s.completeBtnDisabled]}
          onPress={handleCompleteTask}
        >
          <Ionicons name={allDone ? 'checkmark-circle' : 'lock-closed-outline'} size={20} color={allDone ? DARK : TEXT2} />
          <Text style={[s.completeBtnText, !allDone && s.completeBtnTextDisabled]}>
            {allDone ? 'Mark Task Complete' : `Complete all ${task.steps.length - completedSteps} remaining steps first`}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

export default function TasksScreen() {
  const { tasks } = useFieldLensStore();
  const [selectedTrade, setSelectedTrade] = useState<Trade | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<FieldTask | null>(null);

  const filteredTasks = selectedTrade === 'all'
    ? tasks
    : tasks.filter(t => t.trade === selectedTrade);

  const inProgress = filteredTasks.filter(t => t.status === 'in_progress');
  const pending = filteredTasks.filter(t => t.status === 'pending');
  const flagged = filteredTasks.filter(t => t.status === 'flagged');
  const completed = filteredTasks.filter(t => t.status === 'completed');

  if (selectedTask) {
    return (
      <SafeAreaView style={s.safe}>
        <TaskGuide task={selectedTask} onClose={() => setSelectedTask(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Task Library</Text>
        <Text style={s.headerSub}>{tasks.length} total tasks</Text>
      </View>

      {/* Trade filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        <TouchableOpacity
          style={[s.filterChip, selectedTrade === 'all' && s.filterChipActive]}
          onPress={() => setSelectedTrade('all')}
        >
          <Text style={[s.filterChipText, selectedTrade === 'all' && s.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        {(Object.entries(TRADE_LABELS) as [Trade, typeof TRADE_LABELS[Trade]][]).map(([key, val]) => (
          <TouchableOpacity
            key={key}
            style={[s.filterChip, selectedTrade === key && { ...s.filterChipActive, borderColor: val.color, backgroundColor: `${val.color}15` }]}
            onPress={() => setSelectedTrade(key)}
          >
            <Text style={s.filterChipIcon}>{val.icon}</Text>
            <Text style={[s.filterChipText, selectedTrade === key && { color: val.color }]}>{val.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Flagged */}
        {flagged.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: RED }]}>⚠️ Flagged ({flagged.length})</Text>
            {flagged.map(t => <TaskCard key={t.id} task={t} onPress={() => setSelectedTask(t)} />)}
          </View>
        )}

        {/* In Progress */}
        {inProgress.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>▶ In Progress ({inProgress.length})</Text>
            {inProgress.map(t => <TaskCard key={t.id} task={t} onPress={() => setSelectedTask(t)} />)}
          </View>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>⏳ Pending ({pending.length})</Text>
            {pending.map(t => <TaskCard key={t.id} task={t} onPress={() => setSelectedTask(t)} />)}
          </View>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>✅ Completed ({completed.length})</Text>
            {completed.map(t => <TaskCard key={t.id} task={t} onPress={() => setSelectedTask(t)} />)}
          </View>
        )}

        {filteredTasks.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🔨</Text>
            <Text style={s.emptyTitle}>No tasks in this trade</Text>
            <Text style={s.emptySub}>Tasks assigned to this trade will appear here.</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, backgroundColor: CARD },
  headerTitle: { fontSize: 20, fontWeight: '800', color: TEXT },
  headerSub: { fontSize: 12, color: TEXT2, marginTop: 2 },
  filterScroll: { backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: CARD2 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: CARD2, backgroundColor: CARD2 },
  filterChipActive: { borderColor: ORANGE, backgroundColor: `${ORANGE}15` },
  filterChipIcon: { fontSize: 12 },
  filterChipText: { fontSize: 13, color: TEXT2, fontWeight: '600' },
  filterChipTextActive: { color: ORANGE },
  scroll: { flex: 1 },
  content: { padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 10 },

  taskCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 8 },
  taskCardFlagged: { borderWidth: 1, borderColor: `${RED}40` },
  taskTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  taskIcon: { fontSize: 22 },
  taskTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  taskMeta: { fontSize: 11, color: TEXT2, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  progressBar: { height: 4, backgroundColor: CARD2, borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 11, color: TEXT2 },
  flaggedNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: `${RED}10`, borderRadius: 8, padding: 8 },
  flaggedNoteText: { fontSize: 12, color: RED },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 6 },
  emptySub: { fontSize: 14, color: TEXT2, textAlign: 'center' },

  // Task Guide
  guideContainer: { flex: 1 },
  guideHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: CARD2 },
  guideBack: { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD2, alignItems: 'center', justifyContent: 'center' },
  guideTitle: { fontSize: 15, fontWeight: '700', color: TEXT },
  guideMeta: { fontSize: 12, color: TEXT2, marginTop: 2 },
  guideProgress: { fontSize: 14, fontWeight: '800', color: ORANGE },
  guideScroll: { flex: 1 },
  guideContent: { padding: 16 },

  toolsCard: { backgroundColor: CARD, borderRadius: 12, padding: 12, marginBottom: 16 },
  toolsTitle: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 8 },
  toolsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  toolChip: { backgroundColor: CARD2, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  toolChipText: { fontSize: 12, color: TEXT2 },

  stepsTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 10 },
  stepCard: { backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  stepCardDone: { opacity: 0.6 },
  stepLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: CARD2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumDone: { backgroundColor: GREEN },
  stepNumText: { fontSize: 13, fontWeight: '800', color: TEXT },
  stepInstruction: { fontSize: 14, color: TEXT, lineHeight: 20 },
  stepInstructionDone: { textDecorationLine: 'line-through', color: TEXT2 },
  photoRequired: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  photoRequiredText: { fontSize: 11, color: ORANGE },
  aiNote: { fontSize: 11, color: TEXT2, marginTop: 4, fontStyle: 'italic' },
  stepTap: { backgroundColor: `${ORANGE}20`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  stepTapText: { fontSize: 10, color: ORANGE, fontWeight: '600' },

  aiHintCard: { flexDirection: 'row', gap: 12, backgroundColor: `${SLATE}30`, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: `${SLATE}60` },
  aiHintIcon: { fontSize: 24 },
  aiHintTitle: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 4 },
  aiHintText: { fontSize: 12, color: TEXT2, lineHeight: 17 },

  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ORANGE, borderRadius: 14, padding: 16, marginTop: 8 },
  completeBtnDisabled: { backgroundColor: CARD2 },
  completeBtnText: { fontSize: 15, fontWeight: '700', color: DARK },
  completeBtnTextDisabled: { color: TEXT2 },
});
