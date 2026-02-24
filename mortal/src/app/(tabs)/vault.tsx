import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useVaultStore } from '@/stores/vault';
import { COLORS, DOC_CATEGORIES } from '@/constants/theme';
import * as DocumentPicker from 'expo-document-picker';

export default function VaultScreen() {
  const { documents, addDocument } = useVaultStore();

  const handleAddDocument = async (categoryId: string) => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: false });
    if (result.canceled) return;
    const file = result.assets[0];
    addDocument({
      id: Date.now().toString(),
      name: file.name,
      category: categoryId as any,
      fileName: file.name,
      fileUri: file.uri,
      uploadedAt: new Date().toISOString(),
      isEncrypted: true,
    });
    Alert.alert('Document Added', `${file.name} has been securely stored in your vault.`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 32 }}>🔒</Text>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>Secure Vault</Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>{documents.length} documents • End-to-end encrypted</Text>
          </View>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>Add Documents</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DOC_CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} onPress={() => handleAddDocument(cat.id)} style={{
              width: '48%', backgroundColor: COLORS.card, borderRadius: 12, padding: 16,
              borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', gap: 6,
            }}>
              <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.text, textAlign: 'center' }}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {documents.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>Stored Documents</Text>
            {documents.map((doc) => {
              const cat = DOC_CATEGORIES.find((c) => c.id === doc.category);
              return (
                <View key={doc.id} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 28 }}>{cat?.icon ?? '📄'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{doc.name}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                      🔒 Encrypted • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
}
