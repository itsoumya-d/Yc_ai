import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type TeamMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  project: string;
  photosToday: number;
  lastActive: string;
  status: 'active' | 'on-site' | 'offline';
  phone: string;
};

const TEAM: TeamMember[] = [
  { id: '1', name: 'Marcus Chen', initials: 'MC', role: 'Site Superintendent', project: 'Eastside Tower', photosToday: 18, lastActive: '5 min ago', status: 'on-site', phone: '(503) 555-0142' },
  { id: '2', name: 'Priya Sharma', initials: 'PS', role: 'Project Manager', project: 'Eastside Tower', photosToday: 4, lastActive: '23 min ago', status: 'active', phone: '(503) 555-0189' },
  { id: '3', name: 'Derek O\'Brien', initials: 'DO', role: 'Safety Inspector', project: 'Both Sites', photosToday: 11, lastActive: '1 hr ago', status: 'on-site', phone: '(503) 555-0221' },
  { id: '4', name: 'Yuki Tanaka', initials: 'YT', role: 'Structural Engineer', project: 'Eastside Tower', photosToday: 7, lastActive: '2 hr ago', status: 'active', phone: '(503) 555-0309' },
  { id: '5', name: 'James Okonkwo', initials: 'JO', role: 'Site Foreman', project: 'Harbor View Condos', photosToday: 14, lastActive: '12 min ago', status: 'on-site', phone: '(503) 555-0467' },
  { id: '6', name: 'Sofia Reyes', initials: 'SR', role: 'Documentation Lead', project: 'Harbor View Condos', photosToday: 9, lastActive: '45 min ago', status: 'active', phone: '(503) 555-0513' },
  { id: '7', name: 'Tom Nguyen', initials: 'TN', role: 'MEP Coordinator', project: 'Eastside Tower', photosToday: 0, lastActive: 'Yesterday', status: 'offline', phone: '(503) 555-0624' },
  { id: '8', name: 'Aisha Johnson', initials: 'AJ', role: 'Owner\'s Rep', project: 'Both Sites', photosToday: 2, lastActive: '3 hr ago', status: 'active', phone: '(503) 555-0731' },
];

const STATUS_CONFIG = {
  'on-site': { label: 'On Site', color: '#10B981', bg: '#ECFDF5' },
  'active': { label: 'Active', color: '#3B82F6', bg: '#EFF6FF' },
  'offline': { label: 'Offline', color: '#94A3B8', bg: '#F1F5F9' },
};

export default function SiteSyncTeamScreen() {
  const [project, setProject] = useState('All');

  const filtered = TEAM.filter(m => project === 'All' || m.project === project || m.project === 'Both Sites');

  const onSiteCount = TEAM.filter(m => m.status === 'on-site').length;
  const totalPhotos = TEAM.reduce((s, m) => s + m.photosToday, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Team</Text>
            <Text style={styles.subtitle}>Site documentation crew</Text>
          </View>
          <TouchableOpacity style={styles.inviteBtn}>
            <Text style={styles.inviteBtnText}>+ Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Live stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.liveDot} />
            <Text style={styles.statVal}>{onSiteCount}</Text>
            <Text style={styles.statLabel}>On Site Now</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{TEAM.length}</Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{totalPhotos}</Text>
            <Text style={styles.statLabel}>Photos Today</Text>
          </View>
        </View>

        {/* Project filter */}
        <View style={styles.filterRow}>
          {['All', 'Eastside Tower', 'Harbor View Condos'].map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.filterBtn, project === p && styles.filterBtnActive]}
              onPress={() => setProject(p)}
            >
              <Text style={[styles.filterBtnText, project === p && styles.filterBtnTextActive]}>
                {p === 'All' ? 'All Sites' : p.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top contributors today */}
        <Text style={styles.sectionTitle}>Top Contributors Today 📸</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topScroll}>
          {[...TEAM].sort((a, b) => b.photosToday - a.photosToday).slice(0, 5).map(m => (
            <View key={m.id} style={styles.topCard}>
              <View style={[styles.topAvatar, { backgroundColor: m.status === 'on-site' ? '#065F46' : m.status === 'active' ? '#1E40AF' : '#334155' }]}>
                <Text style={styles.topAvatarText}>{m.initials}</Text>
              </View>
              <Text style={styles.topName}>{m.name.split(' ')[0]}</Text>
              <Text style={styles.topPhotos}>{m.photosToday} photos</Text>
            </View>
          ))}
        </ScrollView>

        {/* Member list */}
        <Text style={styles.sectionTitle}>All Members</Text>
        {filtered.map(member => {
          const sc = STATUS_CONFIG[member.status];
          return (
            <View key={member.id} style={styles.memberCard}>
              <View style={[styles.memberAvatar, { backgroundColor: member.status === 'on-site' ? '#065F46' : member.status === 'active' ? '#1E40AF' : '#334155' }]}>
                <Text style={styles.memberAvatarText}>{member.initials}</Text>
                <View style={[styles.statusIndicator, { backgroundColor: sc.color }]} />
              </View>
              <View style={styles.memberInfo}>
                <View style={styles.memberTopRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                  </View>
                </View>
                <Text style={styles.memberRole}>{member.role}</Text>
                <View style={styles.memberMetaRow}>
                  <Text style={styles.memberMeta}>📷 {member.photosToday} today</Text>
                  <Text style={styles.memberMetaDot}>·</Text>
                  <Text style={styles.memberMeta}>⏱ {member.lastActive}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Text style={styles.callBtnText}>📞</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Pending invites */}
        <View style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>📨 Pending Invites (2)</Text>
          <Text style={styles.pendingText}>carlos.m@builder.com · Sent 2 days ago</Text>
          <Text style={styles.pendingText}>nina.k@engineer.net · Sent 5 days ago</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 26, fontWeight: '900', color: '#0F2027', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  inviteBtn: { backgroundColor: '#0F2027', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  inviteBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  statsCard: { backgroundColor: '#0F2027', borderRadius: 18, padding: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', flexDirection: 'column', gap: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  statVal: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
  filterBtnActive: { backgroundColor: '#0F2027', borderColor: '#0F2027' },
  filterBtnText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  filterBtnTextActive: { color: '#FFF' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F2027', marginBottom: 12 },

  topScroll: { marginBottom: 20 },
  topCard: { alignItems: 'center', marginRight: 16, gap: 6 },
  topAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  topAvatarText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  topName: { fontSize: 12, fontWeight: '600', color: '#0F2027' },
  topPhotos: { fontSize: 11, color: '#10B981', fontWeight: '700' },

  memberCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  memberAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  memberAvatarText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  statusIndicator: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFF' },
  memberInfo: { flex: 1 },
  memberTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  memberName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  memberRole: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  memberMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberMeta: { fontSize: 11, color: '#94A3B8' },
  memberMetaDot: { color: '#CBD5E1', fontSize: 10 },
  callBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  callBtnText: { fontSize: 18 },

  pendingCard: { backgroundColor: '#FFF8F0', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FDE68A', gap: 6 },
  pendingTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  pendingText: { fontSize: 12, color: '#B45309' },
});
