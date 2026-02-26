import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSiteStore, SiteIssue, IssueStatus, IssuePriority } from '../../store/site-store';

const YELLOW = '#EAB308';
const ORANGE = '#EA580C';
const BG = '#111827';
const CARD = '#1F2937';
const BORDER = '#374151';
const TEXT = '#F9FAFB';
const TEXT2 = '#9CA3AF';
const GREEN = '#22C55E';
const RED = '#EF4444';
const BLUE = '#3B82F6';

const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string; icon: string }> = {
  critical: { label: 'Critical', color: RED, icon: '🔴' },
  high: { label: 'High', color: ORANGE, icon: '🟠' },
  medium: { label: 'Medium', color: YELLOW, icon: '🟡' },
  low: { label: 'Low', color: GREEN, icon: '🟢' },
};

const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: RED },
  in_progress: { label: 'In Progress', color: YELLOW },
  resolved: { label: 'Resolved', color: GREEN },
};

function IssueCard({ issue, projectId, onStatusChange }: {
  issue: SiteIssue;
  projectId: string;
  onStatusChange: (id: string, status: IssueStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITY_CONFIG[issue.priority];
  const status = STATUS_CONFIG[issue.status];

  return (
    <TouchableOpacity
      style={[s.issueCard, { borderLeftWidth: 4, borderLeftColor: priority.color }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
    >
      <View style={s.issueTop}>
        <View style={{ flex: 1 }}>
          <View style={s.issueMeta}>
            <Text style={s.priorityIcon}>{priority.icon}</Text>
            <Text style={[s.priorityLabel, { color: priority.color }]}>{priority.label}</Text>
            <Text style={s.issueSep}>·</Text>
            <Text style={s.issueCategory}>{issue.category}</Text>
          </View>
          <Text style={s.issueTitle}>{issue.title}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: `${status.color}15` }]}>
          <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={s.issueInfo}>
        <Text style={s.issueAssigned}>Assigned: {issue.assignedTo}</Text>
        {issue.dueDate && <Text style={[s.issueDue, { color: issue.status !== 'resolved' ? RED : TEXT2 }]}>Due: {issue.dueDate}</Text>}
      </View>

      {expanded && (
        <View style={s.issueDetail}>
          <Text style={s.issueDesc}>{issue.description}</Text>
          <View style={s.issueDetailMeta}>
            <Text style={s.issueMetaItem}>Reported by: {issue.reportedBy}</Text>
            <Text style={s.issueMetaItem}>Created: {issue.createdAt}</Text>
          </View>

          {/* Status actions */}
          {issue.status !== 'resolved' && (
            <View style={s.actionRow}>
              {issue.status === 'open' && (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: `${YELLOW}20`, borderColor: `${YELLOW}40` }]}
                  onPress={() => onStatusChange(issue.id, 'in_progress')}
                >
                  <Ionicons name="play-circle-outline" size={16} color={YELLOW} />
                  <Text style={[s.actionBtnText, { color: YELLOW }]}>Start Working</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: `${GREEN}20`, borderColor: `${GREEN}40` }]}
                onPress={() => {
                  Alert.alert('Resolve Issue', `Mark "${issue.title}" as resolved?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Resolve', onPress: () => onStatusChange(issue.id, 'resolved') },
                  ]);
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={GREEN} />
                <Text style={[s.actionBtnText, { color: GREEN }]}>Mark Resolved</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View style={s.expandRow}>
        <Text style={s.expandText}>{expanded ? 'Less' : 'Details'}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={12} color={TEXT2} />
      </View>
    </TouchableOpacity>
  );
}

export default function IssuesScreen() {
  const { projects, activeProjectId, addIssue, updateIssueStatus } = useSiteStore();
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<IssuePriority | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<IssuePriority>('medium');
  const [newCategory, setNewCategory] = useState('');

  const project = projects.find(p => p.id === activeProjectId) ?? projects[0];
  if (!project) return null;

  const filteredIssues = project.issues.filter(issue => {
    if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
    if (filterPriority !== 'all' && issue.priority !== filterPriority) return false;
    return true;
  });

  const openCount = project.issues.filter(i => i.status === 'open').length;
  const inProgressCount = project.issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = project.issues.filter(i => i.status === 'resolved').length;
  const criticalCount = project.issues.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;

  const handleAddIssue = () => {
    if (!newTitle.trim()) return;
    const issue: SiteIssue = {
      id: Date.now().toString(),
      projectId: project.id,
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      status: 'open',
      assignedTo: 'Unassigned',
      reportedBy: 'You',
      createdAt: 'Today',
      category: newCategory || 'General',
    };
    addIssue(project.id, issue);
    setShowAddForm(false);
    setNewTitle('');
    setNewDesc('');
    setNewCategory('');
    setNewPriority('medium');
    Alert.alert('Issue Reported', 'New issue has been logged for this project.');
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Issues</Text>
          <Text style={s.headerSub}>{project.name}</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowAddForm(!showAddForm)}>
          <Ionicons name={showAddForm ? 'close' : 'add'} size={18} color={BG} />
          <Text style={s.addBtnText}>{showAddForm ? 'Cancel' : 'Report'}</Text>
        </TouchableOpacity>
      </View>

      {/* Summary row */}
      <View style={s.summaryRow}>
        <TouchableOpacity style={s.summaryItem} onPress={() => setFilterStatus('open')}>
          <Text style={[s.summaryNum, { color: RED }]}>{openCount}</Text>
          <Text style={s.summaryLabel}>Open</Text>
        </TouchableOpacity>
        <View style={s.summaryDiv} />
        <TouchableOpacity style={s.summaryItem} onPress={() => setFilterStatus('in_progress')}>
          <Text style={[s.summaryNum, { color: YELLOW }]}>{inProgressCount}</Text>
          <Text style={s.summaryLabel}>In Progress</Text>
        </TouchableOpacity>
        <View style={s.summaryDiv} />
        <TouchableOpacity style={s.summaryItem} onPress={() => setFilterStatus('resolved')}>
          <Text style={[s.summaryNum, { color: GREEN }]}>{resolvedCount}</Text>
          <Text style={s.summaryLabel}>Resolved</Text>
        </TouchableOpacity>
        <View style={s.summaryDiv} />
        <View style={s.summaryItem}>
          <Text style={[s.summaryNum, { color: criticalCount > 0 ? RED : TEXT2 }]}>{criticalCount}</Text>
          <Text style={s.summaryLabel}>Critical</Text>
        </View>
      </View>

      {/* Add issue form */}
      {showAddForm && (
        <View style={s.addForm}>
          <TextInput
            style={s.input}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Issue title (required)"
            placeholderTextColor={TEXT2}
          />
          <TextInput
            style={[s.input, s.inputMulti]}
            value={newDesc}
            onChangeText={setNewDesc}
            placeholder="Description (optional)"
            placeholderTextColor={TEXT2}
            multiline
            numberOfLines={3}
          />
          <TextInput
            style={s.input}
            value={newCategory}
            onChangeText={setNewCategory}
            placeholder="Category (e.g. Electrical, Structural)"
            placeholderTextColor={TEXT2}
          />
          <View style={s.priorityRow}>
            <Text style={s.priorityRowLabel}>Priority:</Text>
            {(Object.entries(PRIORITY_CONFIG) as [IssuePriority, typeof PRIORITY_CONFIG[IssuePriority]][]).map(([key, val]) => (
              <TouchableOpacity
                key={key}
                style={[s.priorityBtn, newPriority === key && { borderColor: val.color, backgroundColor: `${val.color}15` }]}
                onPress={() => setNewPriority(key)}
              >
                <Text style={s.priorityBtnIcon}>{val.icon}</Text>
                <Text style={[s.priorityBtnText, newPriority === key && { color: val.color }]}>{val.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[s.submitBtn, !newTitle.trim() && s.submitBtnDisabled]} onPress={handleAddIssue}>
            <Text style={s.submitBtnText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        <TouchableOpacity style={[s.filterChip, filterStatus === 'all' && s.filterChipActive]} onPress={() => setFilterStatus('all')}>
          <Text style={[s.filterText, filterStatus === 'all' && s.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {(Object.entries(STATUS_CONFIG) as [IssueStatus, typeof STATUS_CONFIG[IssueStatus]][]).map(([key, val]) => (
          <TouchableOpacity key={key} style={[s.filterChip, filterStatus === key && { borderColor: val.color, backgroundColor: `${val.color}15` }]} onPress={() => setFilterStatus(key)}>
            <Text style={[s.filterText, filterStatus === key && { color: val.color }]}>{val.label}</Text>
          </TouchableOpacity>
        ))}
        {(Object.entries(PRIORITY_CONFIG) as [IssuePriority, typeof PRIORITY_CONFIG[IssuePriority]][]).map(([key, val]) => (
          <TouchableOpacity key={key} style={[s.filterChip, filterPriority === key && { borderColor: val.color, backgroundColor: `${val.color}15` }]} onPress={() => setFilterPriority(filterPriority === key ? 'all' : key)}>
            <Text style={s.filterText}>{val.icon}</Text>
            <Text style={[s.filterText, filterPriority === key && { color: val.color }]}>{val.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {filteredIssues.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>✅</Text>
            <Text style={s.emptyTitle}>No issues found</Text>
            <Text style={s.emptySub}>No issues match the current filter.</Text>
          </View>
        ) : (
          filteredIssues
            .sort((a, b) => {
              const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return pOrder[a.priority] - pOrder[b.priority];
            })
            .map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                projectId={project.id}
                onStatusChange={(id, status) => updateIssueStatus(project.id, id, status)}
              />
            ))
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
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: YELLOW, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: BG },

  summaryRow: { flexDirection: 'row', backgroundColor: CARD, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: TEXT2, marginTop: 2 },
  summaryDiv: { width: 1, backgroundColor: BORDER, marginVertical: 6 },

  addForm: { backgroundColor: CARD, padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER, gap: 10 },
  input: { backgroundColor: BG, borderRadius: 10, padding: 12, fontSize: 14, color: TEXT, borderWidth: 1, borderColor: BORDER },
  inputMulti: { height: 72, textAlignVertical: 'top' },
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  priorityRowLabel: { fontSize: 13, color: TEXT2 },
  priorityBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: BORDER },
  priorityBtnIcon: { fontSize: 12 },
  priorityBtnText: { fontSize: 11, color: TEXT2, fontWeight: '600' },
  submitBtn: { backgroundColor: YELLOW, borderRadius: 12, padding: 14, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: BG },

  filterScroll: { backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER, maxHeight: 50 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: BORDER },
  filterChipActive: { borderColor: YELLOW, backgroundColor: `${YELLOW}15` },
  filterText: { fontSize: 12, color: TEXT2, fontWeight: '600' },
  filterTextActive: { color: YELLOW },

  scroll: { flex: 1 },
  content: { padding: 16 },

  issueCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  issueTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  issueMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  priorityIcon: { fontSize: 12 },
  priorityLabel: { fontSize: 11, fontWeight: '700' },
  issueSep: { fontSize: 11, color: TEXT2 },
  issueCategory: { fontSize: 11, color: TEXT2 },
  issueTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  statusText: { fontSize: 11, fontWeight: '700' },
  issueInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  issueAssigned: { fontSize: 11, color: TEXT2 },
  issueDue: { fontSize: 11, fontWeight: '600' },

  issueDetail: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER },
  issueDesc: { fontSize: 13, color: TEXT2, lineHeight: 19, marginBottom: 10 },
  issueDetailMeta: { gap: 4, marginBottom: 12 },
  issueMetaItem: { fontSize: 11, color: TEXT2 },
  actionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },

  expandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: BORDER },
  expandText: { fontSize: 11, color: TEXT2 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: TEXT, marginBottom: 6 },
  emptySub: { fontSize: 13, color: TEXT2, textAlign: 'center' },
});
