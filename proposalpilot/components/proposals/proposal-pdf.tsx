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
    marginBottom: 30,
    borderBottom: '2px solid #2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  businessName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  metaBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 12,
  },
  metaLabel: {
    fontSize: 9,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#111827',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 6,
  },
  sectionContent: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 12,
  },
  notes: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    borderLeft: '3px solid #f59e0b',
  },
  notesLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 10,
    color: '#78350f',
    lineHeight: 1.5,
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
  clientSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
  },
  clientLabel: {
    fontSize: 9,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  clientCompany: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 2,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});

const pricingLabels: Record<string, string> = {
  fixed: 'Fixed Price',
  time_materials: 'Time & Materials',
  retainer: 'Retainer',
  value_based: 'Value-Based',
  milestone: 'Milestone',
};

const sectionTypeLabels: Record<string, string> = {
  executive_summary: 'Executive Summary',
  scope: 'Scope of Work',
  timeline: 'Timeline',
  pricing: 'Pricing',
  team: 'Team',
  case_studies: 'Case Studies',
  terms: 'Terms & Conditions',
  custom: '',
};

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface ProposalDocumentProps {
  proposal: any;
  profile: { full_name: string; business_name: string; email: string };
}

export function ProposalDocument({ proposal, profile }: ProposalDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              {profile.business_name && (
                <Text style={styles.businessName}>{profile.business_name}</Text>
              )}
              <Text style={styles.title}>{proposal.title}</Text>
            </View>
            <Text style={styles.statusBadge}>
              {proposal.status.toUpperCase()}
            </Text>
          </View>
          {profile.full_name && (
            <Text style={styles.subtitle}>Prepared by {profile.full_name}</Text>
          )}
        </View>

        {/* Client Info */}
        {proposal.clients && (
          <View style={styles.clientSection}>
            <Text style={styles.clientLabel}>Prepared For</Text>
            <Text style={styles.clientName}>{proposal.clients.name}</Text>
            {proposal.clients.company && (
              <Text style={styles.clientCompany}>{proposal.clients.company}</Text>
            )}
          </View>
        )}

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Value</Text>
            <Text style={styles.metaValue}>{formatCurrency(proposal.value, proposal.currency)}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Pricing Model</Text>
            <Text style={styles.metaValue}>{pricingLabels[proposal.pricing_model] || proposal.pricing_model}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{formatDate(proposal.created_at)}</Text>
          </View>
          {proposal.valid_until && (
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Valid Until</Text>
              <Text style={styles.metaValue}>{formatDate(proposal.valid_until)}</Text>
            </View>
          )}
        </View>

        {/* Sections */}
        {proposal.proposal_sections.map((section: any) => (
          <View key={section.id} wrap={false}>
            <Text style={styles.sectionTitle}>
              {section.section_type !== 'custom'
                ? sectionTypeLabels[section.section_type] || section.title
                : section.title}
            </Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Notes */}
        {proposal.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{proposal.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text
          style={styles.footer}
          fixed
        >
          {proposal.title} — Generated on {formatDate(new Date().toISOString())}
          {profile.business_name ? ` — ${profile.business_name}` : ''}
        </Text>
      </Page>
    </Document>
  );
}
