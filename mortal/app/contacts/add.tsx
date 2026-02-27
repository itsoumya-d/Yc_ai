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
import { createContact } from '../../lib/actions/contacts';

const ROLES = [
  { value: 'executor', label: 'Executor', desc: 'Manages estate after death' },
  { value: 'healthcare_proxy', label: 'Healthcare Proxy', desc: 'Makes medical decisions' },
  { value: 'digital_executor', label: 'Digital Executor', desc: 'Manages digital accounts' },
  { value: 'beneficiary', label: 'Beneficiary', desc: 'Receives assets or funds' },
  { value: 'emergency_contact', label: 'Emergency Contact', desc: 'First to be notified' },
];

export default function AddContactScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('executor');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Name and email are required.');
      return;
    }
    setLoading(true);
    try {
      await createContact({ full_name: fullName, email, phone, role, relationship, notes });
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
        <Text style={styles.title}>Add Trusted Contact</Text>
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {[
          { label: 'Full Name *', value: fullName, setter: setFullName, placeholder: 'Jane Smith' },
          { label: 'Email *', value: email, setter: setEmail, placeholder: 'jane@example.com', keyboardType: 'email-address' as const, autoCapitalize: 'none' as const },
          { label: 'Phone', value: phone, setter: setPhone, placeholder: '+1 (555) 000-0000', keyboardType: 'phone-pad' as const },
          { label: 'Relationship', value: relationship, setter: setRelationship, placeholder: 'Spouse, sibling, friend...' },
        ].map(({ label, value, setter, placeholder, keyboardType, autoCapitalize }) => (
          <View key={label} style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setter}
              placeholder={placeholder}
              placeholderTextColor="#6b7280"
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
            />
          </View>
        ))}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role</Text>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.roleRow, role === r.value && styles.roleRowActive]}
              onPress={() => setRole(r.value)}
            >
              <View style={[styles.radio, role === r.value && styles.radioActive]} />
              <View style={styles.roleText}>
                <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>{r.label}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special instructions for this person..."
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
  roleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#1e1030',
    borderWidth: 1,
    borderColor: '#2d1b4e',
    marginBottom: 8,
  },
  roleRowActive: { borderColor: '#7c3aed' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4b5563',
    marginRight: 12,
    marginTop: 2,
  },
  radioActive: { borderColor: '#7c3aed', backgroundColor: '#7c3aed' },
  roleText: { flex: 1 },
  roleLabel: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
  roleLabelActive: { color: '#ffffff', fontWeight: '700' },
  roleDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
