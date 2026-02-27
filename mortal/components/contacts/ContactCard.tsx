import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Badge } from '../ui/Badge';
import type { TrustedContact } from '../../types';

interface ContactCardProps {
  contact: TrustedContact;
  onPress?: () => void;
}

const ROLE_CONFIG: Record<string, { label: string; variant: 'purple' | 'success' | 'info' | 'warning' | 'neutral' }> = {
  executor: { label: 'Executor', variant: 'purple' },
  healthcare_proxy: { label: 'Healthcare Proxy', variant: 'info' },
  digital_executor: { label: 'Digital Executor', variant: 'warning' },
  beneficiary: { label: 'Beneficiary', variant: 'success' },
  emergency_contact: { label: 'Emergency Contact', variant: 'neutral' },
};

export function ContactCard({ contact, onPress }: ContactCardProps) {
  const roleConfig = ROLE_CONFIG[contact.role] || { label: contact.role, variant: 'neutral' as const };
  const initials = contact.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{contact.full_name}</Text>
        <Text style={styles.detail}>{contact.email}</Text>
        {contact.relationship && (
          <Text style={styles.relationship}>{contact.relationship}</Text>
        )}
      </View>
      <Badge label={roleConfig.label} variant={roleConfig.variant} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1030',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b1f6e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#c4b5fd' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  detail: { fontSize: 12, color: '#a78bfa', marginTop: 2 },
  relationship: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});
