const fs = require('fs');

const apps = [
  { dir: 'mortal', categories: ['reminders', 'deadswitch_alerts', 'checkin_prompts', 'product_updates', 'marketing'] },
  { dir: 'stockpulse', categories: ['low_stock_alerts', 'price_changes', 'reorder_reminders', 'product_updates', 'marketing'] },
  { dir: 'routeai', categories: ['route_updates', 'delivery_alerts', 'daily_summary', 'product_updates', 'marketing'] },
  { dir: 'inspector-ai', categories: ['inspection_reminders', 'report_ready', 'overdue_alerts', 'product_updates', 'marketing'] },
  { dir: 'sitesync', categories: ['site_updates', 'milestone_alerts', 'task_reminders', 'product_updates', 'marketing'] },
  { dir: 'govpass', categories: ['expiry_warnings', 'renewal_reminders', 'document_ready', 'product_updates', 'marketing'] },
  { dir: 'claimback', categories: ['claim_updates', 'deadline_alerts', 'status_changes', 'product_updates', 'marketing'] },
  { dir: 'aura-check', categories: ['daily_checkin', 'wellness_reminders', 'score_updates', 'product_updates', 'marketing'] },
  { dir: 'fieldlens', categories: ['job_assignments', 'schedule_changes', 'completion_alerts', 'product_updates', 'marketing'] },
  { dir: 'compliancesnap-expo', categories: ['violation_alerts', 'audit_reminders', 'report_ready', 'product_updates', 'marketing'] },
];

const categoryLabels = {
  reminders: 'Reminders',
  deadswitch_alerts: 'Dead Switch Alerts',
  checkin_prompts: 'Check-in Prompts',
  product_updates: 'Product Updates',
  marketing: 'Promotions & Offers',
  low_stock_alerts: 'Low Stock Alerts',
  price_changes: 'Price Changes',
  reorder_reminders: 'Reorder Reminders',
  route_updates: 'Route Updates',
  delivery_alerts: 'Delivery Alerts',
  daily_summary: 'Daily Summary',
  inspection_reminders: 'Inspection Reminders',
  report_ready: 'Report Ready',
  overdue_alerts: 'Overdue Alerts',
  site_updates: 'Site Updates',
  milestone_alerts: 'Milestone Alerts',
  task_reminders: 'Task Reminders',
  expiry_warnings: 'Expiry Warnings',
  renewal_reminders: 'Renewal Reminders',
  document_ready: 'Document Ready',
  claim_updates: 'Claim Updates',
  deadline_alerts: 'Deadline Alerts',
  status_changes: 'Status Changes',
  daily_checkin: 'Daily Check-in',
  wellness_reminders: 'Wellness Reminders',
  score_updates: 'Score Updates',
  job_assignments: 'Job Assignments',
  schedule_changes: 'Schedule Changes',
  completion_alerts: 'Completion Alerts',
  violation_alerts: 'Violation Alerts',
  audit_reminders: 'Audit Reminders',
};

const notifPrefsLib = (appDir) => `import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = '@${appDir}_notification_prefs';

export interface NotificationPrefs {
  categories: Record<string, boolean>;
  quietHoursEnabled: boolean;
  quietFrom: string; // HH:mm
  quietTo: string;   // HH:mm
}

const DEFAULT_PREFS: NotificationPrefs = {
  categories: {},
  quietHoursEnabled: false,
  quietFrom: '22:00',
  quietTo: '08:00',
};

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export function isCategoryEnabled(prefs: NotificationPrefs, category: string): boolean {
  // Default to true if not explicitly set
  return prefs.categories[category] !== false;
}

export function isInQuietHours(prefs: NotificationPrefs): boolean {
  if (!prefs.quietHoursEnabled) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [fromH, fromM] = prefs.quietFrom.split(':').map(Number);
  const [toH, toM] = prefs.quietTo.split(':').map(Number);
  const fromMinutes = fromH * 60 + fromM;
  const toMinutes = toH * 60 + toM;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (fromMinutes > toMinutes) {
    return currentMinutes >= fromMinutes || currentMinutes < toMinutes;
  }
  return currentMinutes >= fromMinutes && currentMinutes < toMinutes;
}
`;

const notifPrefsComponent = (app) => {
  const categoryItems = app.categories.map(c =>
    `  { id: '${c}', label: '${categoryLabels[c] || c}' },`
  ).join('\n');

  return `import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, ScrollView, TouchableOpacity,
  Switch, StyleSheet, TextInput, Platform, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotificationPrefs, saveNotificationPrefs, type NotificationPrefs } from '@/lib/notificationPrefs';

const CATEGORIES = [
${categoryItems}
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function NotificationPreferences({ visible, onClose }: Props) {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    categories: {},
    quietHoursEnabled: false,
    quietFrom: '22:00',
    quietTo: '08:00',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      getNotificationPrefs().then(setPrefs);
    }
  }, [visible]);

  const toggleCategory = (id: string, value: boolean) => {
    setPrefs(p => ({ ...p, categories: { ...p.categories, [id]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    await saveNotificationPrefs(prefs);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Notifications</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} accessibilityLabel="Close">
            <Ionicons name="close" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.content}>
          {/* Categories */}
          <Text style={s.sectionLabel}>NOTIFICATION TYPES</Text>
          <View style={s.card}>
            {CATEGORIES.map((cat, i) => (
              <View key={cat.id} style={[s.row, i < CATEGORIES.length - 1 && s.rowBorder]}>
                <Text style={s.rowLabel}>{cat.label}</Text>
                <Switch
                  value={prefs.categories[cat.id] !== false}
                  onValueChange={(v) => toggleCategory(cat.id, v)}
                  trackColor={{ false: '#374151', true: '#4F46E5' }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>

          {/* Quiet Hours */}
          <Text style={[s.sectionLabel, { marginTop: 24 }]}>QUIET HOURS</Text>
          <View style={s.card}>
            <View style={[s.row, s.rowBorder]}>
              <Text style={s.rowLabel}>Enable Quiet Hours</Text>
              <Switch
                value={prefs.quietHoursEnabled}
                onValueChange={(v) => setPrefs(p => ({ ...p, quietHoursEnabled: v }))}
                trackColor={{ false: '#374151', true: '#4F46E5' }}
                thumbColor="#fff"
              />
            </View>
            {prefs.quietHoursEnabled && (
              <>
                <View style={[s.row, s.rowBorder]}>
                  <Text style={s.rowLabel}>From</Text>
                  <TextInput
                    value={prefs.quietFrom}
                    onChangeText={(v) => setPrefs(p => ({ ...p, quietFrom: v }))}
                    placeholder="22:00"
                    placeholderTextColor="#6B7280"
                    style={s.timeInput}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
                <View style={s.row}>
                  <Text style={s.rowLabel}>Until</Text>
                  <TextInput
                    value={prefs.quietTo}
                    onChangeText={(v) => setPrefs(p => ({ ...p, quietTo: v }))}
                    placeholder="08:00"
                    placeholderTextColor="#6B7280"
                    style={s.timeInput}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </>
            )}
            {prefs.quietHoursEnabled && (
              <View style={s.quietPreview}>
                <Ionicons name="moon-outline" size={14} color="#6B7280" />
                <Text style={s.quietPreviewText}>
                  No notifications between {prefs.quietFrom} and {prefs.quietTo}
                </Text>
              </View>
            )}
          </View>

          {/* Preview note */}
          <View style={s.previewNote}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={s.previewNoteText}>
              Critical alerts (security, safety) are always delivered regardless of quiet hours.
            </Text>
          </View>
        </ScrollView>

        {/* Save button */}
        <View style={s.footer}>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
            <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save Preferences'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 16 : 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
  title: { fontSize: 18, fontWeight: '700', color: '#F9FAFB' },
  closeBtn: { padding: 4 },
  content: { padding: 20, paddingBottom: 32 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', letterSpacing: 1, marginBottom: 8 },
  card: { backgroundColor: '#1F2937', borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#374151' },
  rowLabel: { fontSize: 15, color: '#E5E7EB', flex: 1 },
  timeInput: { backgroundColor: '#374151', color: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, fontSize: 14, minWidth: 80, textAlign: 'center' },
  quietPreview: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingBottom: 12 },
  quietPreviewText: { fontSize: 12, color: '#6B7280', flex: 1 },
  previewNote: { flexDirection: 'row', gap: 8, marginTop: 16, padding: 12, backgroundColor: '#1F2937', borderRadius: 10 },
  previewNoteText: { fontSize: 12, color: '#6B7280', flex: 1, lineHeight: 18 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#1F2937' },
  saveBtn: { backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
`;
};

apps.forEach(app => {
  const basePath = 'E:/Yc_ai/' + app.dir;
  if (!fs.existsSync(basePath)) { console.log('SKIP:', app.dir); return; }

  // Create lib/notificationPrefs.ts
  fs.writeFileSync(basePath + '/lib/notificationPrefs.ts', notifPrefsLib(app.dir), 'utf8');

  // Create components/NotificationPreferences.tsx
  fs.writeFileSync(basePath + '/components/NotificationPreferences.tsx', notifPrefsComponent(app), 'utf8');

  console.log('Created NotificationPreferences for:', app.dir);
});

console.log('Done!');
