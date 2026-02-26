import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const PROJECTS = [
  { id: '1', name: 'Riverside Tower', phase: 'Foundation', progress: 34, photos: 247, lastUpdate: '2h ago', status: 'active', weather: '72F Sunny' },
  { id: '2', name: 'Oak Street Commons', phase: 'Framing', progress: 61, photos: 512, lastUpdate: '30m ago', status: 'active', weather: '68F Partly Cloudy' },
  { id: '3', name: 'Harbor View Condos', phase: 'Finishing', progress: 88, photos: 1204, lastUpdate: 'Yesterday', status: 'review', weather: '70F Overcast' },
];

const TODAY_TASKS = [
  { id: '1', task: 'Document slab pour - Section B4', project: 'Riverside Tower', priority: 'high', done: false },
  { id: '2', task: 'Structural inspection photos', project: 'Oak Street Commons', priority: 'high', done: false },
  { id: '3', task: 'Weekly progress report', project: 'Harbor View Condos', priority: 'medium', done: true },
  { id: '4', task: 'Safety compliance walkthrough', project: 'Riverside Tower', priority: 'medium', done: false },
];

const RECENT_PHOTOS = [
  { id: '1', tag: 'Foundation', location: 'Grid B-4', time: '09:14 AM', flagged: false },
  { id: '2', tag: 'Rebar', location: 'Grid B-4', time: '09:22 AM', flagged: true },
  { id: '3', tag: 'Concrete Pour', location: 'Grid C-1', time: '10:05 AM', flagged: false },
  { id: '4', tag: 'Safety Issue', location: 'Grid A-3', time: '10:31 AM', flagged: true },
];
export default function DashboardScreen() {
  const [activeProject, setActiveProject] = useState('1');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>SiteSync</Text>
            <Text style={styles.subtitle}>Thu, Feb 20 · 3 active projects</Text>
          </View>
          <TouchableOpacity style={styles.captureBtn} onPress={() => router.push('/capture')}>
            <Text style={styles.captureBtnText}>Capture</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Photos Today', value: '47' },
            { label: 'Pending Reports', value: '3' },
            { label: 'Issues Flagged', value: '2' },
          ].map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Active Projects</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectsScroll}>
          {PROJECTS.map(project => (
            <TouchableOpacity
              key={project.id}
              style={[styles.projectCard, activeProject === project.id && styles.projectCardActive]}
              onPress={() => setActiveProject(project.id)}
            >
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <View style={[styles.statusDot, { backgroundColor: project.status === 'active' ? '#22C55E' : '#F59E0B' }]} />
              </View>
              <Text style={styles.projectPhase}>{project.phase}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: (project.progress + '%') as any }]} />
              </View>
              <View style={styles.projectFooter}>
                <Text style={styles.projectStat}>{project.progress}% done</Text>
                <Text style={styles.projectStat}>{project.photos} photos</Text>
              </View>
              <Text style={styles.projectUpdate}>Updated {project.lastUpdate}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.aiCard}>
          <View style={styles.aiCardLeft}>
            <Text style={styles.aiCardTitle}>AI Suggestion</Text>
            <Text style={styles.aiCardText}>Document the concrete pour in Section B4. Weather conditions are optimal. AI will auto-tag and GPS-stamp.</Text>
          </View>
          <TouchableOpacity style={styles.aiCaptureBtn} onPress={() => router.push('/capture')}>
            <Text style={styles.aiCaptureBtnText}>Go</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Today's Documentation</Text>
        {TODAY_TASKS.map(task => (
          <View key={task.id} style={[styles.taskCard, task.done && styles.taskCardDone]}>
            <View style={[styles.taskPriority, { backgroundColor: task.priority === 'high' ? '#FEE2E2' : '#FEF9C3' }]}>
              <Text style={[styles.taskPriorityText, { color: task.priority === 'high' ? '#DC2626' : '#D97706' }]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>
            <View style={styles.taskContent}>
              <Text style={[styles.taskText, task.done && styles.taskTextDone]}>{task.task}</Text>
              <Text style={styles.taskProject}>{task.project}</Text>
            </View>
            {task.done && <Text style={styles.taskDoneIcon}>Done</Text>}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Recent Captures</Text>
        {RECENT_PHOTOS.map(photo => (
          <View key={photo.id} style={styles.photoRow}>
            <View style={styles.photoThumb}>
              <Text style={styles.photoThumbText}>IMG</Text>
            </View>
            <View style={styles.photoInfo}>
              <View style={styles.photoTagRow}>
                <Text style={styles.photoTag}>{photo.tag}</Text>
                {photo.flagged && (
                  <View style={styles.flagBadge}>
                    <Text style={styles.flagText}>Flagged</Text>
                  </View>
                )}
              </View>
              <Text style={styles.photoMeta}>{photo.location} · {photo.time}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F2027', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  captureBtn: { backgroundColor: '#0F2027', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  captureBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#0F2027' },
  statLabel: { fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  projectsScroll: { marginBottom: 16 },
  projectCard: { width: 200, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginRight: 12, borderWidth: 1.5, borderColor: '#E2E8F0' },
  projectCardActive: { borderColor: '#0F2027' },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  projectName: { fontSize: 13, fontWeight: '700', color: '#0F172A', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  projectPhase: { fontSize: 12, color: '#64748B', marginBottom: 10 },
  progressBar: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: '#0F2027', borderRadius: 2 },
  projectFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  projectStat: { fontSize: 11, color: '#64748B' },
  projectUpdate: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  aiCard: { backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  aiCardLeft: { flex: 1 },
  aiCardTitle: { fontSize: 13, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  aiCardText: { fontSize: 12, color: '#1D4ED8', lineHeight: 17 },
  aiCaptureBtn: { backgroundColor: '#1D4ED8', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  aiCaptureBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  taskCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  taskCardDone: { opacity: 0.6 },
  taskPriority: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  taskPriorityText: { fontSize: 10, fontWeight: '700' },
  taskContent: { flex: 1 },
  taskText: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  taskTextDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  taskProject: { fontSize: 11, color: '#64748B' },
  taskDoneIcon: { fontSize: 12, color: '#22C55E', fontWeight: '700' },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  photoThumb: { width: 48, height: 48, backgroundColor: '#F1F5F9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  photoThumbText: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  photoInfo: { flex: 1 },
  photoTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  photoTag: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  flagBadge: { backgroundColor: '#FEF3C7', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  flagText: { fontSize: 10, color: '#92400E', fontWeight: '600' },
  photoMeta: { fontSize: 11, color: '#64748B' },
});
