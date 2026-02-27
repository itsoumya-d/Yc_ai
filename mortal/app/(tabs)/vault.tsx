import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getDocuments, uploadVaultDocument } from '../../lib/actions/documents';
import type { VaultDocument } from '../../types';

export default function VaultScreen() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setError(null);
      const data = await getDocuments();
      setDocuments(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load documents.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      setUploading(true);
      const file = result.assets[0];
      await uploadVaultDocument(file.uri, file.name, file.mimeType || 'application/octet-stream');
      await fetchDocuments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      Alert.alert('Upload Failed', msg);
    } finally {
      setUploading(false);
    }
  };

  const DOC_ICONS: Record<string, string> = {
    will: '📜',
    trust: '🏛️',
    insurance: '🛡️',
    deed: '🏠',
    id: '🪪',
    medical: '🏥',
    other: '📄',
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading vault...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Couldn't load vault</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); fetchDocuments(); }}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Document Vault</Text>
          <Text style={styles.subtitle}>{documents.length} documents stored</Text>
        </View>
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          <Text style={styles.uploadBtnText}>{uploading ? 'Uploading...' : '+ Upload'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔐</Text>
            <Text style={styles.emptyTitle}>Vault is empty</Text>
            <Text style={styles.emptyText}>
              Upload important documents — will, insurance policies, deeds — and AI will summarize them.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.docCard}>
            <Text style={styles.docIcon}>{DOC_ICONS[item.doc_type || 'other'] || '📄'}</Text>
            <View style={styles.docInfo}>
              <Text style={styles.docName} numberOfLines={1}>{item.name}</Text>
              {item.ai_summary && (
                <Text style={styles.docSummary} numberOfLines={2}>{item.ai_summary}</Text>
              )}
              <Text style={styles.docDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0720' },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#1a0d35',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#a78bfa', marginTop: 2 },
  uploadBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 32 },
  docCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1e1030',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  docIcon: { fontSize: 28, marginRight: 12, marginTop: 2 },
  docInfo: { flex: 1 },
  docName: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  docSummary: { fontSize: 12, color: '#a78bfa', marginTop: 4, lineHeight: 18 },
  docDate: { fontSize: 11, color: '#6b7280', marginTop: 6 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#a78bfa', textAlign: 'center', lineHeight: 22 },
  // Error & loading states
  loadingText: { marginTop: 12, fontSize: 14, color: '#a78bfa' },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#a78bfa', textAlign: 'center', marginBottom: 24 },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
});
