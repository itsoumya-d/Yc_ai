import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { getContacts } from '../../lib/actions/contacts';
import { ContactCard } from '../../components/contacts/ContactCard';
import type { TrustedContact } from '../../types';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchContacts}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Trusted Contacts</Text>
          <Text style={styles.subtitle}>{contacts.length} contacts added</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/contacts/add')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No contacts yet</Text>
            <Text style={styles.emptyText}>
              Add trusted people who will be notified and given access when needed.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/contacts/add')}>
              <Text style={styles.emptyBtnText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <ContactCard contact={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0720' },
  centered: {
    flex: 1,
    backgroundColor: '#0f0720',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#a78bfa', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  retryBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
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
  addBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 32, gap: 10 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#a78bfa', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#ffffff', fontWeight: '700' },
});
