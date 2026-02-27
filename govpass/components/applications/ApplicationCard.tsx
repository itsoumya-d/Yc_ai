import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Badge } from '../ui/Badge';
import type { Application } from '../../types';

interface ApplicationCardProps {
  application: Application;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<Application['status'], { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Draft', variant: 'neutral' },
  submitted: { label: 'Submitted', variant: 'info' },
  under_review: { label: 'In Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  denied: { label: 'Denied', variant: 'danger' },
};

const PROGRAM_ICONS: Record<string, string> = {
  snap: '🛒',
  medicaid: '🏥',
  eitc: '💰',
  chip: '👶',
  wic: '🍎',
  housing: '🏠',
};

export function ApplicationCard({ application, onPress }: ApplicationCardProps) {
  const statusConfig = STATUS_CONFIG[application.status];
  const submittedDate = application.submitted_at
    ? new Date(application.submitted_at).toLocaleDateString()
    : null;
  const createdDate = new Date(application.created_at).toLocaleDateString();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{PROGRAM_ICONS[application.program] || '📋'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.programName}>{application.program_name}</Text>
          <Text style={styles.date}>
            {submittedDate ? `Submitted ${submittedDate}` : `Started ${createdDate}`}
          </Text>
        </View>
        <Badge label={statusConfig.label} variant={statusConfig.variant} />
      </View>
      {application.reference_number && (
        <Text style={styles.refNumber}>Ref: {application.reference_number}</Text>
      )}
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
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  programName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  refNumber: { fontSize: 11, color: '#94a3b8', marginTop: 8, marginLeft: 56 },
});
