import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVaultStore, DocumentCategory, VaultDocument } from '../../store/vault-store';

const SAGE = '#5B8C5A';
const GOLD = '#C4A35A';
const CREAM = '#FDFBF7';
const IVORY = '#E8DFD0';
const TEXT = '#2D3B2C';
const TEXT2 = '#6B7B6A';

const CATEGORIES: { key: DocumentCategory; label: string; icon: string; color: string; desc: string }[] = [
  { key: 'will', label: 'Will & Testament', icon: '📜', color: '#5B8C5A', desc: 'Last will, trusts, estate plan' },
  { key: 'financial', label: 'Financial', icon: '🏦', color: '#C4A35A', desc: 'Accounts, investments, retirement' },
  { key: 'healthcare', label: 'Healthcare', icon: '🏥', color: '#6B8C9A', desc: 'Directive, DNR, medical proxy' },
  { key: 'insurance', label: 'Insurance', icon: '🛡️', color: '#7B6B8A', desc: 'Life, health, property policies' },
  { key: 'letters', label: 'Personal Letters', icon: '✉️', color: '#8A6B5B', desc: 'Messages to loved ones' },
  { key: 'digital', label: 'Digital Assets', icon: '🔑', color: '#4A6B8A', desc: 'Accounts, passwords, crypto' },
  { key: 'property', label: 'Property', icon: '🏠', color: '#6B8A5B', desc: 'Deeds, mortgages, vehicles' },
];

function DocumentCard({ doc }: { doc: VaultDocument }) {
  const [expanded, setExpanded] = useState(false);
  const accessLabel = { all: 'All trusted', executor_only: 'Executor only', emergency: 'Emergency' }[doc.accessLevel];
  const accessColor = { all: SAGE, executor_only: GOLD, emergency: '#DC2626' }[doc.accessLevel];

  return (
    <TouchableOpacity style={dc.card} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
      <View style={dc.header}>
        <View style={dc.titleRow}>
          <Ionicons name="document-text-outline" size={20} color={SAGE} />
          <Text style={dc.title}>{doc.title}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={TEXT2} />
      </View>
      <View style={dc.meta}>
        <View style={[dc.badge, { backgroundColor: `${accessColor}18` }]}>
          <Text style={[dc.badgeText, { color: accessColor }]}>{accessLabel}</Text>
        </View>
        {doc.isEncrypted && (
          <View style={dc.encBadge}>
            <Ionicons name="lock-closed" size={11} color={SAGE} />
            <Text style={dc.encText}>Encrypted</Text>
          </View>
        )}
        <Text style={dc.fileSize}>{doc.fileSize}</Text>
        <Text style={dc.date}>{doc.uploadedAt}</Text>
      </View>
      {expanded && doc.extractedFields && (
        <View style={dc.fields}>
          {Object.entries(doc.extractedFields).map(([k, v]) => (
            <View key={k} style={dc.fieldRow}>
              <Text style={dc.fieldKey}>{k}</Text>
              <Text style={dc.fieldVal}>{v}</Text>
            </View>
          ))}
        </View>
      )}
      {expanded && doc.description && (
        <Text style={dc.desc}>{doc.description}</Text>
      )}
    </TouchableOpacity>
  );
}

const dc = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: IVORY },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: TEXT, flex: 1 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  encBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F0F5F0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  encText: { fontSize: 11, color: SAGE, fontWeight: '600' },
  fileSize: { fontSize: 12, color: TEXT2 },
  date: { fontSize: 12, color: TEXT2 },
  fields: { marginTop: 12, backgroundColor: '#FAFAF8', borderRadius: 10, padding: 12, gap: 6 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldKey: { fontSize: 13, color: TEXT2, fontWeight: '600' },
  fieldVal: { fontSize: 13, color: TEXT, fontWeight: '500' },
  desc: { marginTop: 10, fontSize: 13, color: TEXT2, lineHeight: 18 },
});

export default function VaultScreen() {
  const { documents, addDocument } = useVaultStore();
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');

  const filtered = activeCategory === 'all' ? documents : documents.filter(d => d.category === activeCategory);
  const covered = new Set(documents.map(d => d.category));

  const handleAddDoc = () => {
    Alert.alert(
      'Add Document',
      'In the full app, you would upload a document using your camera or photo library. AI extracts key fields automatically.',
      [{ text: 'Got it', style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Document Vault</Text>
          <Text style={s.sub}>{documents.length} documents · End-to-end encrypted</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={handleAddDoc}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillsRow} contentContainerStyle={s.pills}>
        <TouchableOpacity style={[s.pill, activeCategory === 'all' && s.pillActive]} onPress={() => setActiveCategory('all')}>
          <Text style={[s.pillText, activeCategory === 'all' && s.pillTextActive]}>All ({documents.length})</Text>
        </TouchableOpacity>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c.key} style={[s.pill, activeCategory === c.key && s.pillActive]} onPress={() => setActiveCategory(c.key)}>
            <Text style={[s.pillText, activeCategory === c.key && s.pillTextActive]}>{c.icon} {c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Category grid (when viewing all) */}
        {activeCategory === 'all' && (
          <View style={s.catGrid}>
            {CATEGORIES.map(c => {
              const count = documents.filter(d => d.category === c.key).length;
              const hasDocs = covered.has(c.key);
              return (
                <TouchableOpacity key={c.key} style={[s.catCard, !hasDocs && s.catCardEmpty]} onPress={() => setActiveCategory(c.key)}>
                  <Text style={s.catIcon}>{c.icon}</Text>
                  <Text style={s.catLabel}>{c.label}</Text>
                  <Text style={[s.catCount, !hasDocs && s.catCountEmpty]}>{count > 0 ? `${count} doc${count > 1 ? 's' : ''}` : 'Add'}</Text>
                  {!hasDocs && (
                    <View style={s.catPlus}>
                      <Ionicons name="add-circle" size={16} color={GOLD} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Document list */}
        {filtered.map(doc => <DocumentCard key={doc.id} doc={doc} />)}

        {filtered.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📂</Text>
            <Text style={s.emptyTitle}>No documents yet</Text>
            <Text style={s.emptySub}>Add your first document in this category.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={handleAddDoc}>
              <Text style={s.emptyBtnText}>+ Add Document</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: IVORY },
  title: { fontSize: 22, fontWeight: '800', color: TEXT },
  sub: { fontSize: 13, color: TEXT2, marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: SAGE, alignItems: 'center', justifyContent: 'center' },
  pillsRow: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: IVORY },
  pills: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: IVORY, backgroundColor: '#FFFFFF' },
  pillActive: { backgroundColor: SAGE, borderColor: SAGE },
  pillText: { fontSize: 13, fontWeight: '600', color: TEXT2 },
  pillTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  content: { padding: 20 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  catCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: IVORY, position: 'relative' },
  catCardEmpty: { borderStyle: 'dashed', borderColor: '#D0C8B8' },
  catIcon: { fontSize: 24, marginBottom: 8 },
  catLabel: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 4 },
  catCount: { fontSize: 12, color: SAGE, fontWeight: '600' },
  catCountEmpty: { color: GOLD },
  catPlus: { position: 'absolute', top: 10, right: 10 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 6 },
  emptySub: { fontSize: 14, color: TEXT2, marginBottom: 20 },
  emptyBtn: { backgroundColor: SAGE, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
