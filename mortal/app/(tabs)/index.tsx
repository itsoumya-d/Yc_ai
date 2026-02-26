import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const SECTIONS = [
  { id: '1', title: 'Final Wishes', emoji: '🕊️', desc: 'Funeral preferences, burial/cremation, memorial service', completed: 2, total: 5 },
  { id: '2', title: 'Digital Legacy', emoji: '💻', desc: 'Social media, email accounts, cloud storage', completed: 0, total: 8 },
  { id: '3', title: 'Legal Documents', emoji: '📜', desc: 'Will, power of attorney, healthcare directive', completed: 1, total: 4 },
  { id: '4', title: 'Financial Assets', emoji: '🏦', desc: 'Bank accounts, investments, crypto, subscriptions', completed: 3, total: 12 },
  { id: '5', title: 'Trusted Contacts', emoji: '👥', desc: 'People to notify and their roles', completed: 2, total: 3 },
];

export default function HomeScreen() {
  const totalCompleted = SECTIONS.reduce((a, s) => a + s.completed, 0);
  const totalItems = SECTIONS.reduce((a, s) => a + s.total, 0);
  const progress = Math.round((totalCompleted / totalItems) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Your Plan</Text>
              <Text style={styles.progressSub}>{progress}% complete · {totalItems - totalCompleted} items remaining</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPct}>{progress}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* AI chat CTA */}
        <TouchableOpacity style={styles.chatCard} onPress={() => router.push('/chat')}>
          <Text style={styles.chatEmoji}>🤖</Text>
          <View style={styles.chatText}>
            <Text style={styles.chatTitle}>Continue planning with AI</Text>
            <Text style={styles.chatDesc}>Pick up where you left off</Text>
          </View>
          <Text style={styles.chatArrow}>→</Text>
        </TouchableOpacity>

        {/* Sections */}
        <Text style={styles.sectionLabel}>Planning Sections</Text>
        {SECTIONS.map((section) => (
          <TouchableOpacity key={section.id} style={styles.sectionCard}>
            <Text style={styles.sectionEmoji}>{section.emoji}</Text>
            <View style={styles.sectionContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={[styles.sectionProgress, section.completed === section.total && styles.sectionComplete]}>
                  {section.completed}/{section.total}
                </Text>
              </View>
              <Text style={styles.sectionDesc}>{section.desc}</Text>
              <View style={styles.sectionBar}>
                <View style={[styles.sectionFill, { width: `${(section.completed / section.total) * 100}%` }]} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Dead man's switch */}
        <View style={styles.switchCard}>
          <Text style={styles.switchTitle}>🔔 Check-in Active</Text>
          <Text style={styles.switchDesc}>Your trusted contacts will be notified if you don't check in within 90 days.</Text>
          <View style={styles.switchStatus}>
            <View style={styles.switchDot} />
            <Text style={styles.switchStatusText}>Last check-in: 3 days ago</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1917' },
  scroll: { padding: 16, paddingBottom: 40 },
  progressCard: { backgroundColor: '#292524', borderRadius: 20, padding: 20, marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  progressTitle: { color: '#F5F5F4', fontSize: 20, fontWeight: '700' },
  progressSub: { color: '#78716C', fontSize: 13, marginTop: 2 },
  progressCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#D97706', alignItems: 'center', justifyContent: 'center' },
  progressPct: { color: '#fff', fontSize: 18, fontWeight: '900' },
  progressBar: { height: 6, backgroundColor: '#3F3833', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#D97706', borderRadius: 3 },
  chatCard: { backgroundColor: '#292524', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  chatEmoji: { fontSize: 28 },
  chatText: { flex: 1 },
  chatTitle: { color: '#F5F5F4', fontSize: 15, fontWeight: '700' },
  chatDesc: { color: '#78716C', fontSize: 13 },
  chatArrow: { color: '#D97706', fontSize: 20 },
  sectionLabel: { color: '#78716C', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  sectionCard: { backgroundColor: '#292524', borderRadius: 16, padding: 16, flexDirection: 'row', gap: 14, marginBottom: 10 },
  sectionEmoji: { fontSize: 28 },
  sectionContent: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { color: '#F5F5F4', fontSize: 15, fontWeight: '700' },
  sectionProgress: { color: '#78716C', fontSize: 13 },
  sectionComplete: { color: '#22C55E' },
  sectionDesc: { color: '#78716C', fontSize: 12, marginBottom: 10 },
  sectionBar: { height: 4, backgroundColor: '#3F3833', borderRadius: 2, overflow: 'hidden' },
  sectionFill: { height: '100%', backgroundColor: '#D97706', borderRadius: 2 },
  switchCard: { backgroundColor: '#1A2511', borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#2D3A1E' },
  switchTitle: { color: '#4ADE80', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  switchDesc: { color: '#78716C', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  switchStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  switchStatusText: { color: '#4ADE80', fontSize: 12 },
});
