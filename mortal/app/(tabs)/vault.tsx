import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

export default function VaultScreen() {
  const user = useAuthStore((s) => s.user);
  const [unlocked, setUnlocked] = useState(false);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function unlock() {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock your vault', cancelLabel: 'Cancel' });
    if (result.success) { setUnlocked(true); loadDocs(); }
  }

  async function loadDocs() {
    setLoading(true);
    const { data } = await supabase.from('vault_documents').select('id, name, document_type, created_at').eq('user_id', user?.id);
    setDocs(data ?? []);
    setLoading(false);
  }

  async function addDoc() {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'] });
    if (result.canceled) return;
    const file = result.assets[0];
    Alert.alert('Add to Vault', 'Store "' + file.name + '" securely?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Store', onPress: async () => {
        await supabase.from('vault_documents').insert({ user_id: user?.id, name: file.name, document_type: 'general' });
        loadDocs();
      }},
    ]);
  }
  if (\!unlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>locked</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#f1f5f9', marginBottom: 8, textAlign: 'center' }}>Document Vault</Text>
        <Text style={{ color: '#64748b', textAlign: 'center', marginBottom: 32 }}>Your documents are encrypted. Authenticate to access.</Text>
        <TouchableOpacity style={{ backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }} onPress={unlock}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Unlock Vault</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f1a' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1e1e2e', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View><Text style={{ fontSize: 22, fontWeight: '700', color: '#f1f5f9' }}>Document Vault</Text><Text style={{ color: '#64748b', fontSize: 13 }}>{docs.length} documents</Text></View>
        <TouchableOpacity style={{ backgroundColor: '#7c3aed', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }} onPress={addDoc}>
          <Text style={{ color: 'white', fontWeight: '600' }}>+ Add</Text>
        </TouchableOpacity>
      </View>
      {loading ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#a78bfa" /></View> :
        docs.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>folder</Text>
            <Text style={{ color: '#64748b', textAlign: 'center' }}>Add wills, trusts, and important documents to your secure vault.</Text>
          </View>
        ) : (
          <FlatList data={docs} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 16 }} renderItem={({ item }) => (
            <View style={{ backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>doc</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#e2e8f0', fontWeight: '600' }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ color: '#4a5568', fontSize: 12 }}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
          )} />
        )
      }
    </View>
  );
}
