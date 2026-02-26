import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSiteStore, SiteProject, ProjectStatus } from '../../store/site-store';

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

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: string }> = {
  planning: { label: 'Planning', color: BLUE, icon: 'clipboard-outline' },
  active: { label: 'Active', color: GREEN, icon: 'construct-outline' },
  on_hold: { label: 'On Hold', color: YELLOW, icon: 'pause-circle-outline' },
  completed: { label: 'Completed', color: TEXT2, icon: 'checkmark-circle-outline' },
};

function ProjectCard({ project, onPress }: { project: SiteProject; onPress: () => void }) {
  const status = STATUS_CONFIG[project.status];
  const openIssues = project.issues.filter(i => i.status !== 'resolved').length;
  const criticalIssues = project.issues.filter(i => i.priority === 'critical' && i.status !== 'resolved').length;
  const budgetPct = (project.spent / project.budget) * 100;
  const budgetOver = budgetPct > 100;

  return (
    <TouchableOpacity style={s.projectCard} onPress={onPress}>
      {/* Status banner for critical issues */}
      {criticalIssues > 0 && (
        <View style={s.criticalBanner}>
          <Ionicons name="warning" size={12} color={RED} />
          <Text style={s.criticalBannerText}>{criticalIssues} critical issue{criticalIssues > 1 ? 's' : ''} requiring attention</Text>
        </View>
      )}

      <View style={s.projectTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.projectName}>{project.name}</Text>
          <Text style={s.projectAddress}>{project.address}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: `${status.color}20` }]}>
          <Ionicons name={status.icon as any} size={12} color={status.color} />
          <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <Text style={s.projectClient}>Client: {project.client}</Text>

      {/* Progress bar */}
      <View style={s.progressSection}>
        <View style={s.progressRow}>
          <Text style={s.progressLabel}>Completion</Text>
          <Text style={[s.progressPct, { color: project.completionPct >= 75 ? GREEN : YELLOW }]}>{project.completionPct}%</Text>
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, {
            width: `${project.completionPct}%` as any,
            backgroundColor: project.completionPct >= 75 ? GREEN : YELLOW,
          }]} />
        </View>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.stat}>
          <Ionicons name="calendar-outline" size={12} color={TEXT2} />
          <Text style={s.statText}>{project.expectedEnd}</Text>
        </View>
        <View style={s.stat}>
          <Ionicons name="people-outline" size={12} color={TEXT2} />
          <Text style={s.statText}>{project.crew.filter(c => c.checkedIn).length}/{project.crew.length} crew</Text>
        </View>
        <View style={s.stat}>
          <Ionicons name={openIssues > 0 ? 'warning' : 'checkmark-circle'} size={12} color={openIssues > 0 ? (criticalIssues > 0 ? RED : YELLOW) : GREEN} />
          <Text style={[s.statText, { color: openIssues > 0 ? (criticalIssues > 0 ? RED : YELLOW) : GREEN }]}>{openIssues} issues</Text>
        </View>
        <View style={s.stat}>
          <Ionicons name="cash-outline" size={12} color={budgetOver ? RED : TEXT2} />
          <Text style={[s.statText, { color: budgetOver ? RED : TEXT2 }]}>{budgetPct.toFixed(0)}% budget</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProjectsScreen() {
  const { projects, setActiveProject } = useSiteStore();
  const router = useRouter();

  const activeProjects = projects.filter(p => p.status === 'active');
  const planningProjects = projects.filter(p => p.status === 'planning');
  const totalOpenIssues = projects.reduce((s, p) => s + p.issues.filter(i => i.status !== 'resolved').length, 0);

  const handleSelectProject = (project: SiteProject) => {
    setActiveProject(project.id);
    router.push('/(tabs)/site');
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <View style={s.logoRow}>
            <Ionicons name="construct" size={20} color={YELLOW} />
            <Text style={s.logoText}>SiteSync</Text>
          </View>
          <Text style={s.headerSub}>Construction site management</Text>
        </View>
        <View style={s.headerStats}>
          <Text style={s.headerStatNum}>{activeProjects.length}</Text>
          <Text style={s.headerStatLabel}>Active</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={[s.summaryNum, { color: YELLOW }]}>{projects.length}</Text>
            <Text style={s.summaryLabel}>Projects</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryNum, { color: GREEN }]}>{activeProjects.length}</Text>
            <Text style={s.summaryLabel}>Active</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryNum, { color: totalOpenIssues > 0 ? RED : GREEN }]}>{totalOpenIssues}</Text>
            <Text style={s.summaryLabel}>Open Issues</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryNum, { color: BLUE }]}>{planningProjects.length}</Text>
            <Text style={s.summaryLabel}>Planning</Text>
          </View>
        </View>

        {/* Active projects */}
        {activeProjects.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🏗️ Active Projects</Text>
            {activeProjects.map(p => (
              <ProjectCard key={p.id} project={p} onPress={() => handleSelectProject(p)} />
            ))}
          </View>
        )}

        {/* Planning projects */}
        {planningProjects.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>📋 In Planning</Text>
            {planningProjects.map(p => (
              <ProjectCard key={p.id} project={p} onPress={() => handleSelectProject(p)} />
            ))}
          </View>
        )}

        {/* Offline note */}
        <View style={s.offlineNote}>
          <Ionicons name="cloud-offline-outline" size={14} color={TEXT2} />
          <Text style={s.offlineNoteText}>Photos and issues are saved offline and sync automatically when connected.</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  logoText: { fontSize: 20, fontWeight: '800', color: TEXT },
  headerSub: { fontSize: 12, color: TEXT2 },
  headerStats: { backgroundColor: `${YELLOW}20`, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: `${YELLOW}40` },
  headerStatNum: { fontSize: 20, fontWeight: '800', color: YELLOW },
  headerStatLabel: { fontSize: 10, color: TEXT2 },
  scroll: { flex: 1 },
  content: { padding: 16 },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: CARD, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  summaryNum: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: TEXT2, marginTop: 2, textAlign: 'center' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 10 },

  projectCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  criticalBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${RED}15`, marginHorizontal: -16, marginTop: -16, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: `${RED}30` },
  criticalBannerText: { fontSize: 11, color: RED, fontWeight: '600', flex: 1 },
  projectTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 4 },
  projectName: { fontSize: 15, fontWeight: '700', color: TEXT },
  projectAddress: { fontSize: 12, color: TEXT2, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  statusText: { fontSize: 11, fontWeight: '700' },
  projectClient: { fontSize: 12, color: TEXT2, marginBottom: 12 },
  progressSection: { marginBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: 12, color: TEXT2 },
  progressPct: { fontSize: 12, fontWeight: '700' },
  progressBar: { height: 4, backgroundColor: BORDER, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 11, color: TEXT2 },

  offlineNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CARD, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER },
  offlineNoteText: { flex: 1, fontSize: 12, color: TEXT2, lineHeight: 17 },
});
