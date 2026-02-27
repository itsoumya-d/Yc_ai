import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Badge } from '../ui/Badge';
import type { Dispute } from '../../types';

interface DisputeCardProps {
  dispute: Dispute;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Draft', variant: 'neutral' },
  submitted: { label: 'Submitted', variant: 'info' },
  in_review: { label: 'In Review', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  open: { label: 'Open', variant: 'info' },
  won: { label: 'Won', variant: 'success' },
  lost: { label: 'Lost', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
};

const BILL_TYPE_ICONS: Record<string, string> = {
  medical: '🏥',
  bank: '🏦',
  utility: '💡',
  insurance: '🛡️',
  telecom: '📱',
  other: '📄',
};

export function DisputeCard({ dispute }: DisputeCardProps) {
  const statusConfig = STATUS_CONFIG[dispute.status] || { label: dispute.status, variant: 'neutral' as const };
  const icon = BILL_TYPE_ICONS[dispute.bill_type || 'other'] || '📄';
  const amount = dispute.amount_disputed || dispute.dispute_amount || 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/disputes/[id]', params: { id: dispute.id } })}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.provider}>{dispute.provider_name || 'Unknown Provider'}</Text>
          <Text style={styles.amount}>${amount.toFixed(2)} disputed</Text>
          <Text style={styles.date}>{new Date(dispute.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={styles.right}>
          <Badge label={statusConfig.label} variant={statusConfig.variant} />
          {dispute.status === 'won' && dispute.resolved_amount && (
            <Text style={styles.wonAmount}>+${dispute.resolved_amount.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  provider: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  amount: { fontSize: 13, color: '#16a34a', fontWeight: '500', marginTop: 2 },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  wonAmount: { fontSize: 13, fontWeight: '700', color: '#16a34a', marginTop: 4 },
});
