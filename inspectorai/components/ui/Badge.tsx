import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type BadgeVariant = 'severity_minor' | 'severity_moderate' | 'severity_severe' | 'severity_total_loss'
  | 'status_draft' | 'status_in_progress' | 'status_completed' | 'status_submitted'
  | 'report_draft' | 'report_submitted' | 'report_approved' | 'report_rejected'
  | 'urgency_immediate' | 'urgency_can_wait' | 'urgency_cosmetic'
  | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

export function getSeverityBadgeVariant(severity: string): BadgeVariant {
  switch (severity) {
    case 'minor': return 'severity_minor';
    case 'moderate': return 'severity_moderate';
    case 'severe': return 'severity_severe';
    case 'total_loss': return 'severity_total_loss';
    default: return 'default';
  }
}

export function getStatusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'draft': return 'status_draft';
    case 'in_progress': return 'status_in_progress';
    case 'completed': return 'status_completed';
    case 'submitted': return 'status_submitted';
    default: return 'default';
  }
}

export function getReportBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'draft': return 'report_draft';
    case 'submitted': return 'report_submitted';
    case 'approved': return 'report_approved';
    case 'rejected': return 'report_rejected';
    default: return 'default';
  }
}

export function getUrgencyBadgeVariant(urgency: string): BadgeVariant {
  switch (urgency) {
    case 'immediate': return 'urgency_immediate';
    case 'can_wait': return 'urgency_can_wait';
    case 'cosmetic': return 'urgency_cosmetic';
    default: return 'default';
  }
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Severity
  severity_minor: { backgroundColor: '#14532d' },
  text_severity_minor: { color: '#86efac' },
  severity_moderate: { backgroundColor: '#451a03' },
  text_severity_moderate: { color: '#fdba74' },
  severity_severe: { backgroundColor: '#431407' },
  text_severity_severe: { color: '#fb923c' },
  severity_total_loss: { backgroundColor: '#450a0a' },
  text_severity_total_loss: { color: '#fca5a5' },
  // Status
  status_draft: { backgroundColor: '#27272a' },
  text_status_draft: { color: '#a1a1aa' },
  status_in_progress: { backgroundColor: '#172554' },
  text_status_in_progress: { color: '#93c5fd' },
  status_completed: { backgroundColor: '#14532d' },
  text_status_completed: { color: '#86efac' },
  status_submitted: { backgroundColor: '#1e1b4b' },
  text_status_submitted: { color: '#a5b4fc' },
  // Report
  report_draft: { backgroundColor: '#27272a' },
  text_report_draft: { color: '#a1a1aa' },
  report_submitted: { backgroundColor: '#1e1b4b' },
  text_report_submitted: { color: '#a5b4fc' },
  report_approved: { backgroundColor: '#14532d' },
  text_report_approved: { color: '#86efac' },
  report_rejected: { backgroundColor: '#450a0a' },
  text_report_rejected: { color: '#fca5a5' },
  // Urgency
  urgency_immediate: { backgroundColor: '#450a0a' },
  text_urgency_immediate: { color: '#fca5a5' },
  urgency_can_wait: { backgroundColor: '#451a03' },
  text_urgency_can_wait: { color: '#fdba74' },
  urgency_cosmetic: { backgroundColor: '#14532d' },
  text_urgency_cosmetic: { color: '#86efac' },
  // Default
  default: { backgroundColor: '#27272a' },
  text_default: { color: '#a1a1aa' },
});
