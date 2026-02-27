import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FileText, CheckCircle2, Clock, XCircle, Send, DollarSign } from 'lucide-react-native';
import type { Report } from '@/types';
import { Badge, getReportBadgeVariant } from '@/components/ui/Badge';

interface ReportCardProps {
  report: Report;
  onPress?: () => void;
  onSubmit?: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved': return CheckCircle2;
    case 'rejected': return XCircle;
    case 'submitted': return Send;
    default: return Clock;
  }
}

function getStatusIconColor(status: string): string {
  switch (status) {
    case 'approved': return '#16a34a';
    case 'rejected': return '#dc2626';
    case 'submitted': return '#818cf8';
    default: return '#71717a';
  }
}

export function ReportCard({ report, onPress, onSubmit }: ReportCardProps) {
  const StatusIcon = getStatusIcon(report.status);
  const statusIconColor = getStatusIconColor(report.status);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FileText size={20} color="#dc2626" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={2}>{report.title}</Text>
          <Text style={styles.date}>{formatDate(report.generated_at)}</Text>
        </View>
        <Badge
          label={report.status.replace('_', ' ')}
          variant={getReportBadgeVariant(report.status)}
        />
      </View>

      <Text style={styles.summary} numberOfLines={3}>{report.summary}</Text>

      <View style={styles.footer}>
        <View style={styles.claimRow}>
          <DollarSign size={14} color="#dc2626" />
          <Text style={styles.claimLabel}>Claim Amount:</Text>
          <Text style={styles.claimAmount}>
            ${report.total_claim_amount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <StatusIcon size={14} color={statusIconColor} />
          <Text style={[styles.statusText, { color: statusIconColor }]}>
            {report.status === 'submitted' && report.submitted_at
              ? `Submitted ${formatDate(report.submitted_at)}`
              : report.status === 'approved' && report.approved_at
              ? `Approved ${formatDate(report.approved_at)}`
              : report.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {report.status === 'draft' && onSubmit && (
        <TouchableOpacity onPress={onSubmit} activeOpacity={0.8} style={styles.submitButton}>
          <Send size={14} color="#ffffff" />
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2d1515',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  date: {
    fontSize: 12,
    color: '#71717a',
  },
  summary: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 19,
  },
  footer: {
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  claimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimLabel: {
    fontSize: 13,
    color: '#71717a',
  },
  claimAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 10,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
