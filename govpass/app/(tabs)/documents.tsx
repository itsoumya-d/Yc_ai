import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

type Document = {
  id: string;
  name: string;
  type: string;
  emoji: string;
  scanned: string;
  expires?: string;
  status: 'verified' | 'pending' | 'expired';
  fileSize: string;
};

const DOCUMENTS: Document[] = [
  { id: '1', name: "Driver's License", type: 'Government ID', emoji: '🪪', scanned: 'Jan 15, 2025', expires: 'Aug 2028', status: 'verified', fileSize: '1.2 MB' },
  { id: '2', name: 'Social Security Card', type: 'Federal ID', emoji: '🔒', scanned: 'Jan 15, 2025', status: 'verified', fileSize: '0.8 MB' },
  { id: '3', name: 'Birth Certificate', type: 'Vital Record', emoji: '📜', scanned: 'Jan 20, 2025', status: 'verified', fileSize: '2.1 MB' },
  { id: '4', name: 'Tax Return 2024', type: 'Tax Document', emoji: '📋', scanned: 'Feb 1, 2025', status: 'pending', fileSize: '3.4 MB' },
  { id: '5', name: 'Proof of Address', type: 'Utility Bill', emoji: '🏠', scanned: 'Jan 28, 2025', expires: 'Apr 2025', status: 'verified', fileSize: '0.5 MB' },
  { id: '6', name: 'Medicaid Card', type: 'Insurance', emoji: '🏥', scanned: 'Dec 10, 2024', expires: 'Dec 2025', status: 'verified', fileSize: '0.4 MB' },
  { id: '7', name: 'Pay Stub (March)', type: 'Income Proof', emoji: '💵', scanned: 'Mar 5, 2025', status: 'verified', fileSize: '0.6 MB' },
  { id: '8', name: 'Lease Agreement', type: 'Housing', emoji: '🏢', scanned: 'Nov 1, 2024', expires: 'Oct 2025', status: 'verified', fileSize: '4.2 MB' },
];

const STATUS_CONFIG = {
  verified: { label: '✓ Verified', bg: '#D1FAE5', text: '#065F46' },
  pending: { label: '⏳ Pending', bg: '#FEF9C3', text: '#713F12' },
  expired: { label: '✕ Expired', bg: '#FEE2E2', text: '#991B1B' },
};

const CATEGORIES = ['All', 'Government ID', 'Tax Document', 'Insurance', 'Housing', 'Income Proof'];

export default function DocumentsScreen() {
  const [category, setCategory] = useState('All');

  const filtered = DOCUMENTS.filter(d => category === 'All' || d.type === category);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Documents</Text>
            <Text style={styles.subtitle}>{DOCUMENTS.length} documents stored securely</Text>
          </View>
          <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/scanner')}>
            <Text style={styles.scanBtnText}>+ Scan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Verified', count: DOCUMENTS.filter(d => d.status === 'verified').length, color: '#10B981' },
            { label: 'Pending', count: DOCUMENTS.filter(d => d.status === 'pending').length, color: '#F59E0B' },
            { label: 'Expiring Soon', count: DOCUMENTS.filter(d => d.expires).length, color: '#3B82F6' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.securityBanner}>
          <Text style={styles.securityIcon}>🔐</Text>
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>AES-256 Encrypted</Text>
            <Text style={styles.securitySubtitle}>Documents are stored encrypted and never shared without your consent.</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, category === cat && styles.catPillActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{filtered.length} Documents</Text>
        {filtered.map(doc => {
          const cfg = STATUS_CONFIG[doc.status];
          return (
            <View key={doc.id} style={styles.docCard}>
              <View style={styles.docIcon}>
                <Text style={styles.docEmoji}>{doc.emoji}</Text>
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docType}>{doc.type}</Text>
                <View style={styles.docMeta}>
                  <Text style={styles.docMetaText}>Scanned {doc.scanned}</Text>
                  {doc.expires && <Text style={styles.docMetaText}>· Expires {doc.expires}</Text>}
                </View>
              </View>
              <View style={styles.docRight}>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
                </View>
                <Text style={styles.fileSize}>{doc.fileSize}</Text>
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.addCard}>
          <Text style={styles.addCardIcon}>➕</Text>
          <Text style={styles.addCardText}>Scan or upload a new document</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4FF' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#1B4EDE', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  scanBtn: { backgroundColor: '#1B4EDE', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  scanBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E0E7FF' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 2 },
  securityBanner: { backgroundColor: '#EEF2FF', borderRadius: 14, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#C7D2FE' },
  securityIcon: { fontSize: 24 },
  securityText: { flex: 1 },
  securityTitle: { fontSize: 13, fontWeight: '700', color: '#3730A3', marginBottom: 2 },
  securitySubtitle: { fontSize: 12, color: '#4338CA', lineHeight: 16 },
  categoryScroll: { marginBottom: 16 },
  catPill: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1.5, borderColor: '#E0E7FF' },
  catPillActive: { backgroundColor: '#1B4EDE', borderColor: '#1B4EDE' },
  catText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  docCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E0E7FF' },
  docIcon: { width: 48, height: 48, backgroundColor: '#EEF2FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docEmoji: { fontSize: 22 },
  docInfo: { flex: 1 },
  docName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  docType: { fontSize: 11, color: '#1B4EDE', fontWeight: '600', marginBottom: 4 },
  docMeta: { flexDirection: 'row', gap: 4 },
  docMetaText: { fontSize: 11, color: '#94A3B8' },
  docRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  fileSize: { fontSize: 11, color: '#94A3B8' },
  addCard: { backgroundColor: '#EEF2FF', borderRadius: 14, padding: 16, marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#C7D2FE', borderStyle: 'dashed' },
  addCardIcon: { fontSize: 18 },
  addCardText: { fontSize: 14, color: '#4338CA', fontWeight: '600' },
});
