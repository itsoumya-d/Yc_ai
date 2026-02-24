import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useVaultStore } from '@/stores/vault';
import { COLORS } from '@/constants/theme';

export default function ContactsScreen() {
  const { contacts, addContact, removeContact } = useVaultStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleAdd = () => {
    if (!name || !email) { Alert.alert('Required', 'Name and email are required.'); return; }
    addContact({ id: Date.now().toString(), name, email, relationship, hasFullAccess: true, addedAt: new Date().toISOString() });
    setName(''); setEmail(''); setRelationship(''); setAdding(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>Trusted Contacts</Text>
          <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
            These people will receive access to your vault if your check-in lapses.
          </Text>
        </View>

        <TouchableOpacity onPress={() => setAdding(!adding)} style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>{adding ? 'Cancel' : '+ Add Trusted Contact'}</Text>
        </TouchableOpacity>

        {adding && (
          <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 }}>
            {[{ label: 'Full Name', value: name, setter: setName }, { label: 'Email Address', value: email, setter: setEmail }, { label: 'Relationship (e.g. Spouse)', value: relationship, setter: setRelationship }].map((field) => (
              <View key={field.label}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 4 }}>{field.label}</Text>
                <TextInput value={field.value} onChangeText={field.setter}
                  style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.background }}
                  placeholderTextColor={COLORS.textMuted} placeholder={field.label}
                />
              </View>
            ))}
            <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 }}>
              <Text style={{ color: 'white', fontWeight: '700' }}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        )}

        {contacts.map((contact) => (
          <View key={contact.id} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>{contact.name}</Text>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>{contact.email}</Text>
                {contact.relationship && <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{contact.relationship}</Text>}
              </View>
              <TouchableOpacity onPress={() => removeContact(contact.id)}>
                <Text style={{ color: COLORS.error, fontSize: 13 }}>Remove</Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success }} />
              <Text style={{ fontSize: 11, color: COLORS.success }}>Full vault access</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
