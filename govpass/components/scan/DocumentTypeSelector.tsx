import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { DocumentType } from '../../types';

interface DocumentTypeSelectorProps {
  selected: DocumentType;
  onSelect: (type: DocumentType) => void;
}

const DOCUMENT_TYPES: { type: DocumentType; label: string; icon: string }[] = [
  { type: 'id', label: 'ID/License', icon: '🪪' },
  { type: 'tax', label: 'Tax Form', icon: '🧾' },
  { type: 'pay_stub', label: 'Pay Stub', icon: '💵' },
  { type: 'social_security', label: 'SS Card', icon: '🔒' },
  { type: 'bank_statement', label: 'Bank Statement', icon: '🏦' },
];

export function DocumentTypeSelector({ selected, onSelect }: DocumentTypeSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {DOCUMENT_TYPES.map(({ type, label, icon }) => (
        <TouchableOpacity
          key={type}
          style={[styles.chip, selected === type && styles.chipSelected]}
          onPress={() => onSelect(type)}
          activeOpacity={0.7}
        >
          <Text style={styles.chipIcon}>{icon}</Text>
          <Text style={[styles.chipLabel, selected === type && styles.chipLabelSelected]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingVertical: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  chipIcon: { fontSize: 16 },
  chipLabel: { fontSize: 13, fontWeight: '500', color: '#64748b' },
  chipLabelSelected: { color: '#ffffff' },
});
