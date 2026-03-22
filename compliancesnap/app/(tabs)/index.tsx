import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';

type Severity = 'critical' | 'major' | 'minor';
const SEV_COLORS: Record<Severity, string> = {
  critical: '#FF3B30', major: '#FF9500', minor: '#FFC107',
};
const SEV_LABEL: Record<Severity, string> = {
  critical: 'Critical', major: 'Major', minor: 'Minor',
};

const MOCK_RECENT_ISSUES = [
  { id: '1', description: 'Missing fire extinguisher signage', area: 'Warehouse A', severity: 'critical' as Severity, time: '2h ago' },
  { id: '2', description: 'Blocked emergency exit', area: 'Loading Dock', severity: 'major' as Severity, time: '4h ago' },
  { id: '3', description: 'PPE not worn — visitor area', area: 'Main Floor', severity: 'minor' as Severity, time: 'Yesterday' },
  { id: '4', description: 'Spill not marked — aisle 7', area: 'Storage B', severity: 'major' as Severity, time: 'Yesterday' },
];

const MOCK_AUDITS = [
  { id: '1', site: 'Warehouse A', score: 87, total: 24, issues: 3, date: 'Today 9:00 AM' },
  { id: '2', site: 'Loading Dock', score: 72, total: 18, issues: 5, date: 'Yesterday' },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const uname = user?.email?.split('@')[0] ?? 'Inspector';

  const criticalCount = MOCK_RECENT_ISSUES.filter(i => i.severity === 'critical').length;
  const totalIssues = MOCK_RECENT_ISSUES.length;
  const avgScore = Math.round(MOCK_AUDITS.reduce((a, b) => a + b.score, 0) / MOCK_AUDITS.length);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Compliance Overview</Text>
            <Text style={s.name}>{uname}</Text>
          </View>
          <TouchableOpacity style={s.avatar}>
            <Text style={s.avatarText}>{uname[0]?.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Score Card */}
        <View style={s.scoreCard}>
          <View style={s.scoreLeft}>
            <Text style={s.scoreLabel}>COMPLIANCE SCORE</Text>
            <Text style={[s.scoreValue, { color: avgScore >= 85 ? '#34C759' : avgScore >= 70 ? '#FF9500' : '#FF3B30' }]}>{avgScore}%</Text>
            <Text style={s.scoreSub}>Across all active sites</Text>
          </View>
          <View style={s.scoreRight}>
            <View style={[s.scoreBar, { height: `${avgScore}%` as any }]} />
          </View>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { borderColor: '#FF3B3020' }]}>
            <Text style={[s.statVal, { color: '#FF3B30' }]}>{criticalCount}</Text>
            <Text style={s.statLabel}>Critical</Text>
          </View>
          <View style={[s.statCard, { borderColor: '#FF950020' }]}>
            <Text style={[s.statVal, { color: '#FF9500' }]}>{totalIssues - criticalCount}</Text>
            <Text style={s.statLabel}>Other Issues</Text>
          </View>
          <View style={[s.statCard, { borderColor: '#34C75920' }]}>
            <Text style={[s.statVal, { color: '#34C759' }]}>{MOCK_AUDITS.length}</Text>
            <Text style={s.statLabel}>Audits Done</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => Alert.alert('Snap', 'Take compliance photo?')}>
            <Ionicons name="camera-outline" size={18} color="#2D3436" />
            <Text style={s.actionText}>Snap Issue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => Alert.alert('Audit', 'Start new audit?')}>
            <Ionicons name="clipboard-outline" size={18} color="#2D3436" />
            <Text style={s.actionText}>New Audit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => Alert.alert('Report', 'Generate report?')}>
            <Ionicons name="document-text-outline" size={18} color="#2D3436" />
            <Text style={s.actionText}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Issues */}
        <Text style={s.sectionTitle}>Recent Issues</Text>
        {MOCK_RECENT_ISSUES.map((issue) => (
          <TouchableOpacity key={issue.id} style={s.issueCard} activeOpacity={0.8}>
            <View style={[s.sevBar, { backgroundColor: SEV_COLORS[issue.severity] }]} />
            <View style={{ flex: 1 }}>
              <View style={s.issueTop}>
                <Text style={s.issueDesc} numberOfLines={1}>{issue.description}</Text>
                <View style={[s.sevBadge, { backgroundColor: SEV_COLORS[issue.severity] + '20' }]}>
                  <Text style={[s.sevText, { color: SEV_COLORS[issue.severity] }]}>{SEV_LABEL[issue.severity]}</Text>
                </View>
              </View>
              <View style={s.issueMeta}>
                <Ionicons name="location-outline" size={12} color="#8E8E93" />
                <Text style={s.issueArea}>{issue.area}</Text>
                <Text style={s.issueTime}>· {issue.time}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Recent Audits */}
        <Text style={s.sectionTitle}>Recent Audits</Text>
        {MOCK_AUDITS.map((audit) => (
          <TouchableOpacity key={audit.id} style={s.auditCard} activeOpacity={0.8}>
            <View style={s.auditLeft}>
              <Text style={s.auditSite}>{audit.site}</Text>
              <Text style={s.auditMeta}>{audit.issues} issues · {audit.total} checks · {audit.date}</Text>
            </View>
            <View style={[s.scoreCircle, { borderColor: audit.score >= 85 ? '#34C759' : '#FF9500' }]}>
              <Text style={[s.scoreCircleVal, { color: audit.score >= 85 ? '#34C759' : '#FF9500' }]}>{audit.score}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  greeting: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  name: { fontSize: 22, fontWeight: '700', color: '#2D3436' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFC107', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#2D3436', fontSize: 18, fontWeight: '700' },
  scoreCard: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, padding: 20, borderRadius: 16, backgroundColor: '#2D3436', overflow: 'hidden' },
  scoreLeft: { flex: 1 },
  scoreLabel: { fontSize: 11, fontWeight: '700', color: '#FFFFFF80', letterSpacing: 0.8, marginBottom: 8 },
  scoreValue: { fontSize: 52, fontWeight: '900', lineHeight: 56 },
  scoreSub: { fontSize: 12, color: '#FFFFFF60', marginTop: 4 },
  scoreRight: { width: 12, borderRadius: 6, backgroundColor: '#FFFFFF20', alignSelf: 'stretch', justifyContent: 'flex-end', overflow: 'hidden' },
  scoreBar: { width: '100%', borderRadius: 6, backgroundColor: '#34C759' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  statVal: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#8E8E93', marginTop: 2, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 10, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA' },
  actionText: { fontSize: 11, fontWeight: '600', color: '#2D3436' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#2D3436', paddingHorizontal: 20, marginBottom: 12 },
  issueCard: { flexDirection: 'row', alignItems: 'center', gap: 0, marginHorizontal: 20, marginBottom: 8, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA', overflow: 'hidden' },
  sevBar: { width: 4, alignSelf: 'stretch' },
  issueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, paddingBottom: 4 },
  issueDesc: { fontSize: 14, fontWeight: '600', color: '#2D3436', flex: 1, marginRight: 8 },
  sevBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, flexShrink: 0 },
  sevText: { fontSize: 10, fontWeight: '700' },
  issueMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 12, paddingBottom: 10 },
  issueArea: { fontSize: 12, color: '#8E8E93' },
  issueTime: { fontSize: 12, color: '#8E8E93' },
  auditCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 8, padding: 14, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5EA' },
  auditLeft: { flex: 1 },
  auditSite: { fontSize: 15, fontWeight: '700', color: '#2D3436', marginBottom: 3 },
  auditMeta: { fontSize: 12, color: '#8E8E93' },
  scoreCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoreCircleVal: { fontSize: 14, fontWeight: '800' },
});
