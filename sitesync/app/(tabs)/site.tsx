import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSiteStore } from '../../store/site-store';

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

const PHASE_LABELS = {
  foundation: { label: 'Foundation', icon: '🏗️', color: ORANGE },
  framing: { label: 'Framing', icon: '🪵', color: YELLOW },
  mechanical: { label: 'Mechanical (MEP)', icon: '⚙️', color: BLUE },
  drywall: { label: 'Drywall', icon: '🏠', color: '#A78BFA' },
  finishing: { label: 'Finishing', icon: '✨', color: GREEN },
  other: { label: 'Other', icon: '🔧', color: TEXT2 },
};

export default function SiteScreen() {
  const { projects, activeProjectId, toggleCrewCheckIn } = useSiteStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'crew' | 'daily'>('overview');

  const project = projects.find(p => p.id === activeProjectId) ?? projects[0];
  if (!project) return null;

  const openIssues = project.issues.filter(i => i.status !== 'resolved');
  const criticalIssues = openIssues.filter(i => i.priority === 'critical');
  const checkedInCrew = project.crew.filter(c => c.checkedIn);
  const phase = PHASE_LABELS[project.phase];
  const budgetPct = (project.spent / project.budget) * 100;
  const budgetRemaining = project.budget - project.spent;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{project.name}</Text>
          <Text style={s.headerSub}>{project.address}</Text>
        </View>
        <View style={[s.phaseChip, { backgroundColor: `${phase.color}20` }]}>
          <Text style={s.phaseIcon}>{phase.icon}</Text>
          <Text style={[s.phaseText, { color: phase.color }]}>{phase.label}</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {(['overview', 'crew', 'daily'] as const).map(tab => (
          <TouchableOpacity key={tab} style={[s.tab, activeTab === tab && s.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <>
            {/* Weather */}
            <View style={s.weatherCard}>
              <Text style={s.weatherIcon}>⛅</Text>
              <View>
                <Text style={s.weatherText}>{project.weatherToday} · {project.temperature}</Text>
                <Text style={s.weatherSub}>Today's site conditions</Text>
              </View>
            </View>

            {/* Critical alert */}
            {criticalIssues.length > 0 && (
              <View style={s.criticalAlert}>
                <Ionicons name="warning" size={18} color={RED} />
                <View style={{ flex: 1 }}>
                  <Text style={s.criticalTitle}>{criticalIssues.length} Critical Issue{criticalIssues.length > 1 ? 's' : ''}</Text>
                  <Text style={s.criticalSub}>{criticalIssues[0].title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={RED} />
              </View>
            )}

            {/* Key metrics */}
            <View style={s.metricsGrid}>
              <View style={[s.metricCard, { borderTopColor: YELLOW }]}>
                <Text style={[s.metricNum, { color: YELLOW }]}>{project.completionPct}%</Text>
                <Text style={s.metricLabel}>Complete</Text>
              </View>
              <View style={[s.metricCard, { borderTopColor: openIssues.length > 0 ? (criticalIssues.length > 0 ? RED : YELLOW) : GREEN }]}>
                <Text style={[s.metricNum, { color: openIssues.length > 0 ? (criticalIssues.length > 0 ? RED : YELLOW) : GREEN }]}>{openIssues.length}</Text>
                <Text style={s.metricLabel}>Open Issues</Text>
              </View>
              <View style={[s.metricCard, { borderTopColor: GREEN }]}>
                <Text style={[s.metricNum, { color: GREEN }]}>{checkedInCrew.length}/{project.crew.length}</Text>
                <Text style={s.metricLabel}>Crew In</Text>
              </View>
              <View style={[s.metricCard, { borderTopColor: project.photos.length > 0 ? BLUE : TEXT2 }]}>
                <Text style={[s.metricNum, { color: BLUE }]}>{project.photos.length}</Text>
                <Text style={s.metricLabel}>Photos</Text>
              </View>
            </View>

            {/* Budget */}
            <View style={s.budgetCard}>
              <Text style={s.cardTitle}>Budget</Text>
              <View style={s.budgetRow}>
                <View>
                  <Text style={s.budgetSpent}>${(project.spent / 1000).toFixed(0)}k</Text>
                  <Text style={s.budgetLabel}>Spent</Text>
                </View>
                <View style={s.budgetDivider} />
                <View>
                  <Text style={[s.budgetRemaining, { color: budgetRemaining >= 0 ? GREEN : RED }]}>
                    ${(Math.abs(budgetRemaining) / 1000).toFixed(0)}k {budgetRemaining >= 0 ? 'remaining' : 'over'}
                  </Text>
                  <Text style={s.budgetLabel}>of ${(project.budget / 1000).toFixed(0)}k total</Text>
                </View>
              </View>
              <View style={s.budgetBar}>
                <View style={[s.budgetBarFill, {
                  width: `${Math.min(budgetPct, 100)}%` as any,
                  backgroundColor: budgetPct > 90 ? RED : budgetPct > 75 ? YELLOW : GREEN,
                }]} />
              </View>
              <Text style={s.budgetPct}>{budgetPct.toFixed(0)}% of budget used</Text>
            </View>

            {/* Timeline */}
            <View style={s.timelineCard}>
              <Text style={s.cardTitle}>Project Timeline</Text>
              <View style={s.timelineRow}>
                <View style={s.timelineItem}>
                  <Ionicons name="play-circle-outline" size={18} color={GREEN} />
                  <View>
                    <Text style={s.timelineLabel}>Started</Text>
                    <Text style={s.timelineDate}>{project.startDate}</Text>
                  </View>
                </View>
                <View style={s.timelineLine} />
                <View style={s.timelineItem}>
                  <Ionicons name="flag-outline" size={18} color={YELLOW} />
                  <View>
                    <Text style={s.timelineLabel}>Target End</Text>
                    <Text style={s.timelineDate}>{project.expectedEnd}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Superintendent */}
            <View style={s.superCard}>
              <Ionicons name="person-circle-outline" size={24} color={YELLOW} />
              <View style={{ flex: 1 }}>
                <Text style={s.superTitle}>Superintendent</Text>
                <Text style={s.superName}>{project.superintendent}</Text>
              </View>
              <TouchableOpacity style={s.callBtn} onPress={() => Alert.alert('Call', `Calling ${project.superintendent}...`)}>
                <Ionicons name="call-outline" size={18} color={GREEN} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === 'crew' && (
          <>
            <View style={s.crewSummary}>
              <View style={s.crewStat}>
                <Text style={[s.crewStatNum, { color: GREEN }]}>{checkedInCrew.length}</Text>
                <Text style={s.crewStatLabel}>Checked In</Text>
              </View>
              <View style={s.crewDivider} />
              <View style={s.crewStat}>
                <Text style={[s.crewStatNum, { color: RED }]}>{project.crew.length - checkedInCrew.length}</Text>
                <Text style={s.crewStatLabel}>Not In</Text>
              </View>
              <View style={s.crewDivider} />
              <View style={s.crewStat}>
                <Text style={[s.crewStatNum, { color: TEXT }]}>{project.crew.length}</Text>
                <Text style={s.crewStatLabel}>Total</Text>
              </View>
            </View>

            {project.crew.map(member => (
              <View key={member.id} style={s.crewCard}>
                <View style={[s.crewAvatar, { backgroundColor: member.checkedIn ? `${GREEN}20` : `${RED}15` }]}>
                  <Text style={[s.crewAvatarText, { color: member.checkedIn ? GREEN : RED }]}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.crewName}>{member.name}</Text>
                  <Text style={s.crewRole}>{member.role} · {member.trade}</Text>
                  {member.checkedIn && member.checkInTime && (
                    <Text style={s.crewCheckInTime}>Checked in {member.checkInTime}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[s.checkInToggle, member.checkedIn ? s.checkInToggleIn : s.checkInToggleOut]}
                  onPress={() => toggleCrewCheckIn(project.id, member.id)}
                >
                  <Text style={[s.checkInToggleText, { color: member.checkedIn ? GREEN : RED }]}>
                    {member.checkedIn ? '✓ In' : 'Out'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {project.crew.length === 0 && (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>👷</Text>
                <Text style={s.emptyText}>No crew assigned yet</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'daily' && (
          <>
            <Text style={s.dailyTitle}>Daily Log</Text>
            <View style={s.dailyCard}>
              <View style={s.dailyRow}>
                <Ionicons name="sunny-outline" size={18} color={YELLOW} />
                <View style={{ flex: 1 }}>
                  <Text style={s.dailyLabel}>Weather</Text>
                  <Text style={s.dailyValue}>{project.weatherToday} · {project.temperature}</Text>
                </View>
              </View>
              <View style={s.dailyRow}>
                <Ionicons name="people-outline" size={18} color={BLUE} />
                <View style={{ flex: 1 }}>
                  <Text style={s.dailyLabel}>Crew on Site</Text>
                  <Text style={s.dailyValue}>{checkedInCrew.length} workers present</Text>
                </View>
              </View>
              <View style={s.dailyRow}>
                <Ionicons name="camera-outline" size={18} color={GREEN} />
                <View style={{ flex: 1 }}>
                  <Text style={s.dailyLabel}>Documentation</Text>
                  <Text style={s.dailyValue}>{project.photos.length} photos on file</Text>
                </View>
              </View>
              <View style={[s.dailyRow, { borderBottomWidth: 0 }]}>
                <Ionicons name="warning-outline" size={18} color={openIssues.length > 0 ? YELLOW : GREEN} />
                <View style={{ flex: 1 }}>
                  <Text style={s.dailyLabel}>Open Issues</Text>
                  <Text style={[s.dailyValue, { color: openIssues.length > 0 ? YELLOW : GREEN }]}>
                    {openIssues.length === 0 ? 'No open issues' : `${openIssues.length} requiring attention`}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={s.reportBtn}
              onPress={() => Alert.alert('Daily Report', 'Generate and share today\'s site report?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Generate PDF', onPress: () => Alert.alert('Generated', 'Daily report ready to share.') },
              ])}
            >
              <Ionicons name="document-text-outline" size={18} color={YELLOW} />
              <Text style={s.reportBtnText}>Generate Daily Report</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  headerSub: { fontSize: 11, color: TEXT2, marginTop: 2 },
  phaseChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  phaseIcon: { fontSize: 14 },
  phaseText: { fontSize: 11, fontWeight: '700' },
  tabBar: { flexDirection: 'row', backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: YELLOW },
  tabText: { fontSize: 13, color: TEXT2, fontWeight: '600' },
  tabTextActive: { color: YELLOW },
  scroll: { flex: 1 },
  content: { padding: 16 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 12 },

  weatherCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: CARD, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  weatherIcon: { fontSize: 24 },
  weatherText: { fontSize: 13, fontWeight: '600', color: TEXT },
  weatherSub: { fontSize: 11, color: TEXT2 },

  criticalAlert: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: `${RED}10`, borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: `${RED}30` },
  criticalTitle: { fontSize: 13, fontWeight: '700', color: RED },
  criticalSub: { fontSize: 11, color: `${RED}CC`, marginTop: 2 },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  metricCard: { width: '48%', backgroundColor: CARD, borderRadius: 12, padding: 14, borderTopWidth: 3, borderWidth: 1, borderColor: BORDER },
  metricNum: { fontSize: 24, fontWeight: '800' },
  metricLabel: { fontSize: 12, color: TEXT2, marginTop: 2 },

  budgetCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  budgetSpent: { fontSize: 22, fontWeight: '800', color: TEXT },
  budgetLabel: { fontSize: 11, color: TEXT2, marginTop: 2 },
  budgetDivider: { width: 1, height: 36, backgroundColor: BORDER },
  budgetRemaining: { fontSize: 15, fontWeight: '700' },
  budgetBar: { height: 6, backgroundColor: BORDER, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  budgetBarFill: { height: '100%', borderRadius: 3 },
  budgetPct: { fontSize: 11, color: TEXT2 },

  timelineCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  timelineRow: { flexDirection: 'row', alignItems: 'center' },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  timelineLine: { flex: 1, height: 1, backgroundColor: BORDER, marginHorizontal: 8 },
  timelineLabel: { fontSize: 11, color: TEXT2 },
  timelineDate: { fontSize: 12, fontWeight: '700', color: TEXT },

  superCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER },
  superTitle: { fontSize: 12, color: TEXT2 },
  superName: { fontSize: 14, fontWeight: '700', color: TEXT, marginTop: 2 },
  callBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${GREEN}20`, alignItems: 'center', justifyContent: 'center' },

  crewSummary: { flexDirection: 'row', backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  crewStat: { flex: 1, alignItems: 'center' },
  crewStatNum: { fontSize: 28, fontWeight: '800' },
  crewStatLabel: { fontSize: 11, color: TEXT2, marginTop: 2 },
  crewDivider: { width: 1, backgroundColor: BORDER, marginHorizontal: 8 },
  crewCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: BORDER },
  crewAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  crewAvatarText: { fontSize: 14, fontWeight: '800' },
  crewName: { fontSize: 14, fontWeight: '700', color: TEXT },
  crewRole: { fontSize: 11, color: TEXT2, marginTop: 2 },
  crewCheckInTime: { fontSize: 10, color: GREEN, marginTop: 2 },
  checkInToggle: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  checkInToggleIn: { backgroundColor: `${GREEN}15`, borderColor: `${GREEN}40` },
  checkInToggleOut: { backgroundColor: `${RED}10`, borderColor: `${RED}30` },
  checkInToggleText: { fontSize: 12, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: TEXT2 },

  dailyTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 12 },
  dailyCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  dailyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
  dailyLabel: { fontSize: 12, color: TEXT2 },
  dailyValue: { fontSize: 13, fontWeight: '600', color: TEXT, marginTop: 2 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: `${YELLOW}15`, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: `${YELLOW}40` },
  reportBtnText: { fontSize: 14, fontWeight: '700', color: YELLOW },
});
