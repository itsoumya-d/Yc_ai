import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 25,
    borderBottom: '2px solid #1e3a5f',
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: '#111827',
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  statusBadge: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase' as const,
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  metaBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 10,
  },
  metaLabel: {
    fontSize: 9,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginTop: 18,
    marginBottom: 8,
    color: '#111827',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 5,
  },
  notes: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #d1d5db',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cellWide: {
    flex: 3,
    fontSize: 10,
  },
  cellMedium: {
    flex: 2,
    fontSize: 10,
  },
  cellNarrow: {
    flex: 1,
    fontSize: 10,
  },
  cellBold: {
    fontFamily: 'Helvetica-Bold',
  },
  resolutionBlock: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderLeft: '3px solid #1e3a5f',
  },
  resolutionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  resolutionBody: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 6,
  },
  votesRow: {
    flexDirection: 'row',
    gap: 12,
    fontSize: 9,
    color: '#6b7280',
  },
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center' as const,
    fontSize: 9,
    color: '#9ca3af',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
});

const meetingTypeLabels: Record<string, string> = {
  regular: 'Regular Meeting',
  special: 'Special Meeting',
  committee: 'Committee Meeting',
  annual: 'Annual Meeting',
};

const statusLabels: Record<string, string> = {
  draft: 'DRAFT',
  scheduled: 'SCHEDULED',
  completed: 'COMPLETED',
  canceled: 'CANCELED',
};

const priorityLabels: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

interface MeetingDocumentProps {
  meeting: any;
  organizationName?: string;
}

export function MeetingDocument({ meeting, organizationName }: MeetingDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>{meeting.title}</Text>
              <Text style={styles.subtitle}>
                {meetingTypeLabels[meeting.meeting_type] || meeting.meeting_type} — Meeting Minutes
              </Text>
              {organizationName && (
                <Text style={styles.subtitle}>{organizationName}</Text>
              )}
            </View>
            <Text style={styles.statusBadge}>
              {statusLabels[meeting.status] || meeting.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Meeting Details */}
        <View style={styles.metaRow}>
          {meeting.scheduled_at && (
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Date & Time</Text>
              <Text style={styles.metaValue}>{formatDateTime(meeting.scheduled_at)}</Text>
            </View>
          )}
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>{meeting.duration_minutes} minutes</Text>
          </View>
          {meeting.location && (
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Location</Text>
              <Text style={styles.metaValue}>{meeting.location}</Text>
            </View>
          )}
        </View>

        {/* Notes / Agenda */}
        {meeting.notes && (
          <View>
            <Text style={styles.sectionTitle}>Agenda / Notes</Text>
            <Text style={styles.notes}>{meeting.notes}</Text>
          </View>
        )}

        {/* Action Items */}
        {meeting.action_items && meeting.action_items.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Action Items ({meeting.action_items.length})</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellWide, styles.cellBold]}>Task</Text>
              <Text style={[styles.cellMedium, styles.cellBold]}>Assignee</Text>
              <Text style={[styles.cellNarrow, styles.cellBold]}>Priority</Text>
              <Text style={[styles.cellNarrow, styles.cellBold]}>Status</Text>
              <Text style={[styles.cellMedium, styles.cellBold]}>Due Date</Text>
            </View>
            {meeting.action_items.map((item: any) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.cellWide}>{item.title}</Text>
                <Text style={styles.cellMedium}>{item.assignee_name || '—'}</Text>
                <Text style={styles.cellNarrow}>{priorityLabels[item.priority] || item.priority}</Text>
                <Text style={styles.cellNarrow}>{item.status.replace('_', ' ')}</Text>
                <Text style={styles.cellMedium}>{item.due_date ? formatDate(item.due_date) : '—'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Resolutions */}
        {meeting.resolutions && meeting.resolutions.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Resolutions ({meeting.resolutions.length})</Text>
            {meeting.resolutions.map((res: any) => (
              <View key={res.id} style={styles.resolutionBlock} wrap={false}>
                <Text style={styles.resolutionTitle}>{res.title}</Text>
                {res.body && (
                  <Text style={styles.resolutionBody}>{res.body}</Text>
                )}
                <View style={styles.votesRow}>
                  <Text>Status: {res.status.toUpperCase()}</Text>
                  <Text>For: {res.votes_for}</Text>
                  <Text>Against: {res.votes_against}</Text>
                  <Text>Abstain: {res.votes_abstain}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          {meeting.title} — Minutes generated on {formatDate(new Date().toISOString())}
          {organizationName ? ` — ${organizationName}` : ''}
        </Text>
      </Page>
    </Document>
  );
}
