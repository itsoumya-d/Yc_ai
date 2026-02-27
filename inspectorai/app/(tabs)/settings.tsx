import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User, Bell, Key, Shield, ChevronRight, LogOut,
  Moon, Building2, Phone, Mail, Eye, EyeOff,
} from 'lucide-react-native';
import { supabase, signOut } from '@/lib/supabase';
import { setOpenAIKey } from '@/lib/actions/ai';
import * as SecureStore from 'expo-secure-store';
import type { NotificationSettings } from '@/types';

const OPENAI_KEY_STORE = 'openai_api_key';
const INSURANCE_KEY_STORE = 'insurance_api_key';

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [openaiKey, setOpenaiKey] = useState('');
  const [insuranceKey, setInsuranceKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showInsuranceKey, setShowInsuranceKey] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    push_enabled: true,
    email_enabled: true,
    report_status_updates: true,
    new_assignments: true,
    weekly_summary: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
    });

    SecureStore.getItemAsync(OPENAI_KEY_STORE).then((key) => {
      if (key) {
        setOpenaiKey(key);
        setOpenAIKey(key);
      }
    });

    SecureStore.getItemAsync(INSURANCE_KEY_STORE).then((key) => {
      if (key) setInsuranceKey(key);
    });
  }, []);

  const handleSaveOpenAIKey = useCallback(async () => {
    if (!openaiKey.trim()) return;
    await SecureStore.setItemAsync(OPENAI_KEY_STORE, openaiKey.trim());
    setOpenAIKey(openaiKey.trim());
    Alert.alert('Saved', 'OpenAI API key saved securely.');
  }, [openaiKey]);

  const handleSaveInsuranceKey = useCallback(async () => {
    if (!insuranceKey.trim()) return;
    await SecureStore.setItemAsync(INSURANCE_KEY_STORE, insuranceKey.trim());
    Alert.alert('Saved', 'Insurance API key saved securely.');
  }, [insuranceKey]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [router]);

  const toggleNotification = useCallback((key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <User size={28} color="#dc2626" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.user_metadata?.full_name ?? 'Inspector'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            {[
              { key: 'push_enabled' as const, label: 'Push Notifications', icon: Bell },
              { key: 'email_enabled' as const, label: 'Email Notifications', icon: Mail },
              { key: 'report_status_updates' as const, label: 'Report Status Updates', icon: Shield },
              { key: 'new_assignments' as const, label: 'New Assignments', icon: Building2 },
              { key: 'weekly_summary' as const, label: 'Weekly Summary', icon: Moon },
            ].map((item, idx) => (
              <View key={item.key} style={[styles.settingRow, idx > 0 && styles.settingRowBorder]}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBg}>
                    <item.icon size={14} color="#dc2626" />
                  </View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                <Switch
                  value={notifications[item.key]}
                  onValueChange={() => toggleNotification(item.key)}
                  trackColor={{ false: '#3f3f46', true: '#dc2626' }}
                  thumbColor="#ffffff"
                />
              </View>
            ))}
          </View>
        </View>

        {/* API Keys */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>

          <View style={styles.card}>
            <View style={styles.apiKeySection}>
              <View style={styles.apiKeyHeader}>
                <Key size={14} color="#dc2626" />
                <Text style={styles.apiKeyLabel}>OpenAI API Key</Text>
              </View>
              <Text style={styles.apiKeyHint}>Required for AI damage analysis</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={openaiKey}
                  onChangeText={setOpenaiKey}
                  placeholder="sk-..."
                  placeholderTextColor="#52525b"
                  secureTextEntry={!showOpenaiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowOpenaiKey(!showOpenaiKey)} style={styles.eyeButton}>
                  {showOpenaiKey ? (
                    <EyeOff size={16} color="#71717a" />
                  ) : (
                    <Eye size={16} color="#71717a" />
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleSaveOpenAIKey} style={styles.saveButton} activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>Save OpenAI Key</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.apiKeySection, styles.apiKeySectionBorder]}>
              <View style={styles.apiKeyHeader}>
                <Building2 size={14} color="#ea580c" />
                <Text style={styles.apiKeyLabel}>Insurance API Key</Text>
              </View>
              <Text style={styles.apiKeyHint}>Optional: for direct insurer integration</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={insuranceKey}
                  onChangeText={setInsuranceKey}
                  placeholder="Enter insurance API key"
                  placeholderTextColor="#52525b"
                  secureTextEntry={!showInsuranceKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowInsuranceKey(!showInsuranceKey)} style={styles.eyeButton}>
                  {showInsuranceKey ? (
                    <EyeOff size={16} color="#71717a" />
                  ) : (
                    <Eye size={16} color="#71717a" />
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleSaveInsuranceKey} style={styles.saveButton} activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>Save Insurance Key</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>AI Model</Text>
              <Text style={styles.infoValue}>GPT-4o Vision</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>Supabase + Expo</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton} activeOpacity={0.8}>
          <LogOut size={18} color="#fca5a5" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#ffffff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  card: { backgroundColor: '#1c1c1e', borderRadius: 14, overflow: 'hidden' },
  profileCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2d1515',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  profileEmail: { fontSize: 13, color: '#71717a', marginTop: 2 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  settingRowBorder: { borderTopWidth: 1, borderTopColor: '#27272a' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#2d1515',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { fontSize: 14, color: '#e4e4e7' },
  apiKeySection: { padding: 16, gap: 8 },
  apiKeySectionBorder: { borderTopWidth: 1, borderTopColor: '#27272a' },
  apiKeyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  apiKeyLabel: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  apiKeyHint: { fontSize: 12, color: '#71717a' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  eyeButton: { padding: 4 },
  saveButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: '#27272a' },
  infoLabel: { fontSize: 14, color: '#a1a1aa' },
  infoValue: { fontSize: 14, color: '#ffffff', fontWeight: '500' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2d1515',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 20,
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: '#fca5a5' },
});
