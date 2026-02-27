import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Wrench, Crown, Bell, HelpCircle, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const sections = [
    {
      title: 'Profile',
      items: [
        { icon: User, label: 'Account Details', sub: 'Name, email, trade' },
        { icon: Wrench, label: 'Trade & Experience', sub: 'Plumbing • Journeyman' },
      ],
    },
    {
      title: 'Subscription',
      items: [
        { icon: Crown, label: 'Current Plan', sub: 'Free — 3 AI analyses/day' },
      ],
    },
    {
      title: 'App',
      items: [
        { icon: Bell, label: 'Notifications', sub: 'Daily tips, reminders' },
        { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, contact us' },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>T</Text>
        </View>
        <View>
          <Text style={styles.profileName}>Tradesperson</Text>
          <Text style={styles.profileRole}>Plumbing • Journeyman</Text>
        </View>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>FREE</Text>
        </View>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, i) => (
            <TouchableOpacity key={item.label} style={[styles.settingItem, i === 0 && styles.settingItemFirst, i === section.items.length - 1 && styles.settingItemLast]}>
              <item.icon size={20} color="#d97706" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingSub}>{item.sub}</Text>
              </View>
              <ChevronRight size={16} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Text style={styles.version}>FieldLens v1.0.0 — AI-powered trade coaching</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { paddingBottom: 40 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#111827' },
  title: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1e293b', borderRadius: 16, margin: 20, padding: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#d97706', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#111827' },
  profileName: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  profileRole: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  freeBadge: { marginLeft: 'auto', backgroundColor: '#374151', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  freeBadgeText: { fontSize: 11, fontWeight: '700', color: '#9ca3af' },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  settingItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1e293b', padding: 14, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  settingItemFirst: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  settingItemLast: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderBottomWidth: 0 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  settingSub: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  version: { textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 8 },
});
