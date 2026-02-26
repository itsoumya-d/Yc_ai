import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const ALERTS = [
  { id: '1', type: 'low_stock', title: 'Low Stock: iPhone 15 Pro Case', desc: 'Only 12 units remaining (min: 20)', severity: 'high', time: '2 hours ago' },
  { id: '2', type: 'low_stock', title: 'Critical: Cotton Crew T-Shirt M', desc: 'Only 3 units remaining (min: 25)', severity: 'critical', time: '4 hours ago' },
  { id: '3', type: 'reorder', title: 'Reorder Suggested: Bamboo Cutting Board', desc: '8 units left, trending upward', severity: 'medium', time: '1 day ago' },
  { id: '4', type: 'expiry', title: 'Expiry Alert: Craft Coffee Blend', desc: '12 units expire in 30 days', severity: 'low', time: '2 days ago' },
];

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  high: { bg: '#FEF9C3', text: '#713F12', border: '#FDE047' },
  medium: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  low: { bg: '#F0F9FF', text: '#0C4A6E', border: '#BAE6FD' },
};

export default function AlertsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Alerts</Text>
        <Text style={styles.subtitle}>{ALERTS.length} active notifications</Text>
        {ALERTS.map(alert => {
          const colors = severityColors[alert.severity];
          return (
            <View key={alert.id} style={[styles.alertCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <View style={styles.alertHeader}>
                <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
              <Text style={[styles.alertDesc, { color: colors.text }]}>{alert.desc}</Text>
              <TouchableOpacity style={[styles.alertAction, { borderColor: colors.text }]} onPress={() => router.push('/reorder')}>
                <Text style={[styles.alertActionText, { color: colors.text }]}>Take Action</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FDF4' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F4C3A', paddingTop: 20, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  alertCard: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1.5 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  alertTitle: { fontSize: 14, fontWeight: '800', flex: 1, marginRight: 8 },
  alertTime: { fontSize: 11, color: '#94A3B8' },
  alertDesc: { fontSize: 13, marginBottom: 12 },
  alertAction: { borderRadius: 8, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  alertActionText: { fontSize: 12, fontWeight: '700' },
});
