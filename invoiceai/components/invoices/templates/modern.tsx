import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { InvoiceWithDetails, User } from '@/types/database';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  topBar: {
    backgroundColor: '#16a34a',
    height: 8,
  },
  content: {
    padding: 40,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  brandSection: {},
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  invoiceLabel: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  invoiceNum: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  amountDue: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 8,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 20,
  },
  infoCard: {
    flex: 1,
    padding: 14,
    backgroundColor: '#fafafa',
    borderRadius: 6,
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 10,
    lineHeight: 1.6,
  },
  infoValueBold: {
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 1.6,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#16a34a',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  descCol: { width: '50%' },
  qtyCol: { width: '15%', textAlign: 'right' },
  rateCol: { width: '15%', textAlign: 'right' },
  amountCol: { width: '20%', textAlign: 'right' },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalsBlock: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 10, color: '#666' },
  totalValue: { fontSize: 10 },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#16a34a',
    marginTop: 6,
  },
  grandTotalLabel: { fontSize: 13, fontWeight: 'bold' },
  grandTotalValue: { fontSize: 15, fontWeight: 'bold', color: '#16a34a' },
  notes: {
    marginTop: 30,
    padding: 14,
    backgroundColor: '#fafafa',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
  },
  notesTitle: { fontSize: 9, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  notesText: { fontSize: 9, color: '#666', lineHeight: 1.6 },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
});

function formatMoney(amount: number, currency: string = 'USD') {
  return `${currency === 'USD' ? '$' : currency + ' '}${amount.toFixed(2)}`;
}

interface ModernTemplateProps {
  invoice: InvoiceWithDetails;
  user?: User | null;
}

export function ModernTemplate({ invoice, user }: ModernTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandSection}>
              <Text style={styles.brandName}>
                {user?.business_name ?? 'Your Business'}
              </Text>
              {user?.business_email && (
                <Text style={{ fontSize: 9, color: '#666', marginTop: 4 }}>
                  {user.business_email}
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.invoiceLabel}>Invoice</Text>
              <Text style={styles.invoiceNum}>{invoice.invoice_number}</Text>
              <View style={styles.amountDue}>
                <Text style={styles.amountLabel}>Amount Due</Text>
                <Text style={styles.amountValue}>
                  {formatMoney(invoice.amount_due, invoice.currency)}
                </Text>
              </View>
            </View>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Bill To</Text>
              <Text style={styles.infoValueBold}>
                {invoice.client?.name ?? 'Client'}
              </Text>
              {invoice.client?.company && (
                <Text style={styles.infoValue}>{invoice.client.company}</Text>
              )}
              <Text style={styles.infoValue}>{invoice.client?.email}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Invoice Date</Text>
              <Text style={styles.infoValue}>{invoice.issue_date}</Text>
              <Text style={{ ...styles.infoLabel, marginTop: 10 }}>Due Date</Text>
              <Text style={styles.infoValue}>{invoice.due_date}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Payment Terms</Text>
              <Text style={styles.infoValue}>Net {invoice.payment_terms}</Text>
              <Text style={{ ...styles.infoLabel, marginTop: 10 }}>Status</Text>
              <Text style={{ ...styles.infoValue, fontWeight: 'bold', color: '#16a34a' }}>
                {invoice.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Line Items */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderText, ...styles.descCol }}>Description</Text>
              <Text style={{ ...styles.tableHeaderText, ...styles.qtyCol }}>Qty</Text>
              <Text style={{ ...styles.tableHeaderText, ...styles.rateCol }}>Rate</Text>
              <Text style={{ ...styles.tableHeaderText, ...styles.amountCol }}>Amount</Text>
            </View>
            {invoice.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.descCol}>{item.description}</Text>
                <Text style={styles.qtyCol}>{item.quantity}</Text>
                <Text style={styles.rateCol}>{formatMoney(item.unit_price, invoice.currency)}</Text>
                <Text style={{ ...styles.amountCol, fontWeight: 'bold' }}>
                  {formatMoney(item.amount, invoice.currency)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalsBlock}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatMoney(invoice.subtotal, invoice.currency)}</Text>
              </View>
              {invoice.tax_rate > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax ({invoice.tax_rate}%)</Text>
                  <Text style={styles.totalValue}>{formatMoney(invoice.tax_amount, invoice.currency)}</Text>
                </View>
              )}
              {invoice.discount_amount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount</Text>
                  <Text style={{ ...styles.totalValue, color: '#16a34a' }}>
                    -{formatMoney(invoice.discount_amount, invoice.currency)}
                  </Text>
                </View>
              )}
              <View style={styles.grandTotal}>
                <Text style={styles.grandTotalLabel}>Total Due</Text>
                <Text style={styles.grandTotalValue}>
                  {formatMoney(invoice.amount_due, invoice.currency)}
                </Text>
              </View>
            </View>
          </View>

          {invoice.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          )}

          <Text style={styles.footer}>
            Thank you for your business!
          </Text>
        </View>
      </Page>
    </Document>
  );
}
