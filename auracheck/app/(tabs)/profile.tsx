import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Shield, Bell, HelpCircle, ChevronRight, Heart } from 'lucide-react-native';

const FITZPATRICK_TYPES = [
  { type: 1, desc: 'Very fair, always burns' },
  { type: 2, desc: 'Fair, usually burns' },
  { type: 3, desc: 'Medium, sometimes burns' },
  { type: 4, desc: 'Olive, rarely burns' },
  { type: 5, desc: 'Brown, very rarely burns' },
  { type: 6, desc: 'Dark brown, never burns' },
];

export default function ProfileScreen() {
  const sections = [
    { title: 'Skin Profile', items: [
      { icon: User, label: 'Personal Info', sub: 'Name, email' },
      { icon: Heart, label: 'Fitzpatrick Type', sub: 'Type III — Medium, sometimes burns' },
    ]},
    { title: 'App Settings', items: [
      { icon: Bell, label: 'Reminders', sub: 'Weekly check reminders' },
      { icon: Shield, label: 'Privacy & Data', sub: 'Manage your data' },
      { icon: HelpCircle, label: 'Help & FAQ', sub: 'Frequently asked questions' },
    ]},
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>AuraCheck User</Text>
          <Text style={styles.profileSub}>Free Plan • 0 checks completed</Text>
        </View>
      </View>

      {/* Fitzpatrick type guide */}
      <View style={styles.fitzSection}>
        <Text style={styles.fitzTitle}>Fitzpatrick Skin Types</Text>
        {FITZPATRICK_TYPES.map((ft) => (
          <View key={ft.type} style={[styles.fitzItem, ft.type === 3 && styles.fitzItemActive]}>
            <View style={[styles.fitzNum, ft.type === 3 && styles.fitzNumActive]}>
              <Text style={[styles.fitzNumText, ft.type === 3 && styles.fitzNumTextActive]}>{ft.type}</Text>
            </View>
            <Text style={[styles.fitzDesc, ft.type === 3 && styles.fitzDescActive]}>{ft.desc}</Text>
            {ft.type === 3 && <Text style={styles.yourType}>Your type</Text>}
          </View>
        ))}
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, i) => (
            <TouchableOpacity key={item.label} style={[styles.settingItem, i === 0 && styles.first, i === section.items.length - 1 && styles.last]}>
              <item.icon size={20} color="#e11d48" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingSub}>{item.sub}</Text>
              </View>
              <ChevronRight size={16} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Text style={styles.disclaimer}>
        AuraCheck AI is not a medical device and cannot diagnose conditions. Always consult a licensed dermatologist for medical evaluation.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 40 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#ffffff', borderRadius: 16, margin: 16, padding: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e11d48', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  profileInfo: {},
  profileName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  profileSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  fitzSection: { backgroundColor: '#ffffff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16, gap: 8 },
  fitzTitle: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 4 },
  fitzItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 10 },
  fitzItemActive: { backgroundColor: '#fff1f2' },
  fitzNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  fitzNumActive: { backgroundColor: '#e11d48' },
  fitzNumText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  fitzNumTextActive: { color: '#ffffff' },
  fitzDesc: { flex: 1, fontSize: 13, color: '#64748b' },
  fitzDescActive: { color: '#9f1239', fontWeight: '600' },
  yourType: { fontSize: 11, fontWeight: '700', color: '#e11d48' },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 4 },
  settingItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#ffffff', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  first: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  last: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderBottomWidth: 0 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  settingSub: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  disclaimer: { marginHorizontal: 20, marginTop: 8, fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 16 },
});
