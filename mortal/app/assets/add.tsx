import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { createAsset } from '../../lib/actions/assets';

const CATEGORIES = [
  { value: 'social_media', label: 'Social Media', icon: '📱' },
  { value: 'financial', label: 'Financial', icon: '💰' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'crypto', label: 'Crypto', icon: '🔑' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const DISPOSITIONS = [
  { value: 'memorialize', label: 'Memorialize' },
  { value: 'delete', label: 'Delete' },
  { value: 'transfer', label: 'Transfer to heir' },
  { value: 'download', label: 'Download data first' },
];

export default function AddAssetScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [category, setCategory] = useState('social_media');
  const [disposition, setDisposition] = useState('memorialize');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Please enter a name for this asset.');
      return;
    }
    setLoading(true);
    try {
      await createAsset({ name, username, category, disposition, notes });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Digital Asset</Text>
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Asset Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Facebook, Gmail, Coinbase"
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username / Email</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="your@email.com or @handle"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.optionChip, category === cat.value && styles.optionChipActive]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={styles.optionIcon}>{cat.icon}</Text>
                <Text style={[styles.optionLabel, category === cat.value && styles.optionLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>What to do with this account</Text>
          {DISPOSITIONS.map((d) => (
            <TouchableOpacity
              key={d.value}
              style={[styles.dispositionRow, disposition === d.value && styles.dispositionRowActive]}
              onPress={() => setDisposition(d.value)}
            >
              <View style={[styles.radio, disposition === d.value && styles.radioActive]} />
              <Text style={[styles.dispositionLabel, disposition === d.value && styles.dispositionLabelActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional instructions..."
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0720' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a0d35',
    borderBottomWidth: 1,
    borderBottomColor: '#2d1b4e',
  },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 20, color: '#a78bfa' },
  title: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  saveBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#ffffff', fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#a78bfa', marginBottom: 8 },
  input: {
    backgroundColor: '#1e1030',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e1030',
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  optionChipActive: { borderColor: '#7c3aed', backgroundColor: '#2d1b4e' },
  optionIcon: { fontSize: 14 },
  optionLabel: { fontSize: 13, color: '#a78bfa' },
  optionLabelActive: { color: '#ffffff', fontWeight: '600' },
  dispositionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#1e1030',
    borderWidth: 1,
    borderColor: '#2d1b4e',
    marginBottom: 8,
  },
  dispositionRowActive: { borderColor: '#7c3aed' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4b5563',
    marginRight: 12,
  },
  radioActive: { borderColor: '#7c3aed', backgroundColor: '#7c3aed' },
  dispositionLabel: { fontSize: 14, color: '#9ca3af' },
  dispositionLabelActive: { color: '#ffffff', fontWeight: '500' },
});
