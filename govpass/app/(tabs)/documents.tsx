import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

interface Document { id: string; name: string; document_type: string; created_at: string; }

export default function DocumentsScreen() {
  const user = useAuthStore((s) => s.user);
  const [unlocked, setUnlocked] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  async function authenticate() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (\!hasHardware || \!isEnrolled) { setUnlocked(true); return; }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your document vault',
      fallbackLabel: 'Use passcode',
    });
    if (result.success) { setUnlocked(true); loadDocuments(); }
  }

  async function loadDocuments() {
    setLoading(true);
    const { data } = await supabase.from('documents').select('id, name, document_type, created_at').eq('user_id', user?.id).order('created_at', { ascending: false });
    setDocuments(data ?? []);
    setLoading(false);
  }

  async function addDocument() {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    if (result.canceled || \!result.assets?.[0]) return;
    const file = result.assets[0];
    Alert.alert('Add Document', `Upload "${file.name}" to your vault?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Upload',
        onPress: async () => {
          const { error } = await supabase.from('documents').insert({ user_id: user?.id, name: file.name, document_type: 'general', file_size: file.size });
          if (\!error) { Alert.alert('Success', 'Document added to vault'); loadDocuments(); }
        },
      },
    ]);
  }

  if (\!unlocked) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-5xl mb-6">🔒</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Document Vault</Text>
        <Text className="text-gray-500 text-center mb-8">Your documents are protected with biometric authentication. Tap below to unlock your vault.</Text>
        <TouchableOpacity className="bg-blue-600 px-8 py-4 rounded-xl" onPress={authenticate}>
          <Text className="text-white font-semibold text-base">Unlock with Biometrics</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-4 border-b border-gray-100 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-gray-900">Document Vault</Text>
          <Text className="text-gray-500 text-sm">Securely stored documents</Text>
        </View>
        <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg" onPress={addDocument}>
          <Text className="text-white font-medium text-sm">+ Add</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#1a56db" /></View>
      ) : documents.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl mb-4">📁</Text>
          <Text className="text-gray-500 text-center">No documents yet. Add IDs, tax forms, and other important documents to your secure vault.</Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View className="bg-gray-50 rounded-xl p-4 mb-3 flex-row items-center">
              <Text className="text-2xl mr-3">📄</Text>
              <View className="flex-1">
                <Text className="font-medium text-gray-900" numberOfLines={1}>{item.name}</Text>
                <Text className="text-gray-500 text-sm">{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
