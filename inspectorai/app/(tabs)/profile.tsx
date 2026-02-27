import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch } from 'react-native';

const TERRITORIES = ['Multnomah County', 'Washington County', 'Clackamas County'];

const RECENT_ACTIVITY = [
  { id: '1', date: 'Feb 22', description: 'New inspection assigned — 1847 NE Burnside St', type: 'assigned' },
  { id: '2', date: 'Feb 20', description: 'Report approved — 503 Oak Grove Dr ($28,450)', type: 'approved' },
  { id: '3', date: 'Feb 18', description: 'Supplemental submitted — 2211 SW Canyon Rd', type: 'submitted' },
  { id: '4', date: 'Feb 15', description: 'Certification renewed — Oregon State Adjuster License', type: 'cert' },
];

const ACTIVITY_CONFIG = {
  assigned: { color: '#1D4ED8', bg: '#EFF6FF', icon: '📋' },
  approved: { color: '#15803D', bg: '#F0FDF4', icon: '✅' },
  submitted: { color: '#1E3A5F', bg: '#EFF6FF', icon: '📤' },
  cert: { color: '#D97706', bg: '#FEF9C3', icon: '📜' },
};

export default function InspectorAIProfileScreen() {
  const [available, setAvailable] = useState(true);
  const [aiAssist, setAiAssist] = useState(true);
  const [autoReport, setAutoReport] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const stats = {
    completed: 47,
    thisMonth: 6,
    avgTurnaround: '18 hrs',
    rating: 4.8,
    totalEstimated: 892400,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Adjuster dashboard</Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>DA</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Dr. Amanda Torres</Text>
              <Text style={styles.profileOrg}>Pacific Northwest Claims Group</Text>
              <Text style={styles.profileSub}>Senior Property Adjuster · Since Mar 2022</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Inspections</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{stats.thisMonth}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{stats.avgTurnaround}</Text>
              <Text style={styles.statLabel}>Avg. Turnaround</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: '#15803D' }]}>{stats.rating}⭐</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Loss Estimated (All Time)</Text>
            <Text style={styles.totalAmount}>${stats.totalEstimated.toLocaleString()}</Text>
          </View>
        </View>

        {/* License & Credentials */}
        <Text style={styles.sectionTitle}>License & Credentials</Text>
        <View style={styles.credsCard}>
          <View style={styles.credRow}>
            <Text style={styles.credIcon}>📜</Text>
            <View style={styles.credInfo}>
              <Text style={styles.credTitle}>Oregon State Adjuster License</Text>
              <Text style={styles.credSub}>License #OR-ADJ-10948 · Exp Dec 2026</Text>
            </View>
            <View style={styles.credStatus}>
              <Text style={styles.credStatusText}>✓ Active</Text>
            </View>
          </View>
          <View style={[styles.credRow, styles.credBorder]}>
            <Text style={styles.credIcon}>🏛️</Text>
            <View style={styles.credInfo}>
              <Text style={styles.credTitle}>Washington Adjuster License</Text>
              <Text style={styles.credSub}>License #WA-ADJ-55241 · Exp Aug 2025</Text>
            </View>
            <View style={styles.credStatus}>
              <Text style={styles.credStatusText}>✓ Active</Text>
            </View>
          </View>
          <View style={[styles.credRow, styles.credBorder]}>
            <Text style={styles.credIcon}>🎓</Text>
            <View style={styles.credInfo}>
              <Text style={styles.credTitle}>Xactimate Certified</Text>
              <Text style={styles.credSub}>Level 2 · Verisk Analytics · 2023</Text>
            </View>
            <View style={styles.credStatus}>
              <Text style={styles.credStatusText}>✓ Certified</Text>
            </View>
          </View>
          <View style={[styles.credRow, styles.credBorder]}>
            <Text style={styles.credIcon}>🏠</Text>
            <View style={styles.credInfo}>
              <Text style={styles.credTitle}>IICRC Water Damage</Text>
              <Text style={styles.credSub}>WRT Certified · Exp Mar 2026</Text>
            </View>
            <View style={styles.credStatus}>
              <Text style={styles.credStatusText}>✓ Certified</Text>
            </View>
          </View>
        </View>

        {/* Territory */}
        <Text style={styles.sectionTitle}>Service Territory</Text>
        <View style={styles.territoryCard}>
          {TERRITORIES.map(t => (
            <View key={t} style={styles.territoryChip}>
              <Text style={styles.territoryText}>📍 {t}</Text>
            </View>
          ))}
        </View>

        {/* AI settings */}
        <Text style={styles.sectionTitle}>AI Settings</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Available for Assignments</Text>
              <Text style={styles.settingSub}>Appear in assignment queue</Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ false: '#E2E8F0', true: '#1E3A5F' }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.settingRow, styles.settingBorder]}>
            <View>
              <Text style={styles.settingLabel}>AI Damage Detection Assist</Text>
              <Text style={styles.settingSub}>Real-time Xactimate suggestions on capture</Text>
            </View>
            <Switch
              value={aiAssist}
              onValueChange={setAiAssist}
              trackColor={{ false: '#E2E8F0', true: '#1E3A5F' }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.settingRow, styles.settingBorder]}>
            <View>
              <Text style={styles.settingLabel}>Auto-generate Reports</Text>
              <Text style={styles.settingSub}>Generate report draft when photos complete</Text>
            </View>
            <Switch
              value={autoReport}
              onValueChange={setAutoReport}
              trackColor={{ false: '#E2E8F0', true: '#1E3A5F' }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.settingRow, styles.settingBorder]}>
            <View>
              <Text style={styles.settingLabel}>Assignment notifications</Text>
              <Text style={styles.settingSub}>New inspections near you</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E2E8F0', true: '#1E3A5F' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Recent activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {RECENT_ACTIVITY.map(activity => {
          const ac = ACTIVITY_CONFIG[activity.type as keyof typeof ACTIVITY_CONFIG];
          return (
            <View key={activity.id} style={[styles.activityRow, { borderLeftColor: ac.color }]}>
              <View style={[styles.activityIcon, { backgroundColor: ac.bg }]}>
                <Text style={styles.activityIconText}>{ac.icon}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityDesc}>{activity.description}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
            </View>
          );
        })}

        {/* Export */}
        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>📊 Export Annual Performance Report</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#1E3A5F', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E3A5F', marginBottom: 12 },

  profileCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', gap: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#1E3A5F', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 17, fontWeight: '800', color: '#1E3A5F' },
  profileOrg: { fontSize: 12, color: '#475569', fontWeight: '600' },
  profileSub: { fontSize: 11, color: '#94A3B8' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 4 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '900', color: '#1E3A5F' },
  statLabel: { fontSize: 10, color: '#64748B', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },
  totalCard: { backgroundColor: '#F0F7FF', borderRadius: 12, padding: 14 },
  totalLabel: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  totalAmount: { fontSize: 22, fontWeight: '900', color: '#1E3A5F' },

  credsCard: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  credRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  credBorder: { borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  credIcon: { fontSize: 22 },
  credInfo: { flex: 1 },
  credTitle: { fontSize: 13, fontWeight: '700', color: '#1E3A5F' },
  credSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  credStatus: { backgroundColor: '#ECFDF5', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  credStatusText: { fontSize: 11, color: '#15803D', fontWeight: '700' },

  territoryCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  territoryChip: { backgroundColor: '#EFF6FF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  territoryText: { fontSize: 12, color: '#1D4ED8', fontWeight: '600' },

  settingsCard: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  settingBorder: { borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  settingLabel: { fontSize: 13, fontWeight: '600', color: '#1E3A5F' },
  settingSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  activityRow: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 3 },
  activityIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  activityIconText: { fontSize: 16 },
  activityInfo: { flex: 1 },
  activityDesc: { fontSize: 12, color: '#1E3A5F', fontWeight: '600' },
  activityDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  exportBtn: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  exportBtnText: { color: '#1E3A5F', fontWeight: '700', fontSize: 13 },
});
