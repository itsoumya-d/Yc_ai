import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { InvoiceWithDetails, User } from '@/types/database';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#ffffff',
  },
  darkHeader: {
    backgroundColor: '#1a1a2e',
    padding: 40,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  brandDetails: {
    fontSize: 9,
    color: '#a0a0b8',
    marginTop: 6,
    lineHeight: 1.6,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#a0a0b8',
    textAlign: 'right',
    marginTop: 4,
  },
  statusBand: {
    backgroundColor: '#16a34a',
    padding: 12,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#ffffff',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  body: {
    padding: 40,
    paddingTop: 25,
    color: '#1a1a1a',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  infoBlock: {
    width: '45%',
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#16a34a',
    marginBottom: 6,
    letterSpacing: 1.5,
  },
  infoValue: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    padding: 10,
    borderRadius: 2,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    width: '45%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: '#666',
  },
  totalValue: {
    fontSize: 10,
    textAlign: 'right',
    color: '#333',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#1a1a2e',
    borderRadius: 2,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  notes: {
    marginTop: 25,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#555',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
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

interface BoldTemplateProps {
  invoice: InvoiceWithDetails;
  user?: User | null;
}

export function BoldTemplate({ invoice, user }: BoldTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Dark Header */}
        <View style={styles.darkHeader}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.brandName}>
                {user?.business_name ?? 'Your Business'}
              </Text>
              <Text style={styles.brandDetails}>
                {[user?.business_address, user?.business_email, user?.business_phone]
                  .filter(Boolean)
                  .join('\n')}
              </Text>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            </View>
          </View>
        </View>

        {/* Green Status Band */}
        <View style={styles.statusBand}>
          <View style={{ flexDirection: 'row', gap: 30 }}>
            <View>
              <Text style={styles.statusLabel}>Issue Date</Text>
              <Text style={styles.statusValue}>{invoice.issue_date}</Text>
            </View>
            <View>
              <Text style={styles.statusLabel}>Due Date</Text>
              <Text style={styles.statusValue}>{invoice.due_date}</Text>
            </View>
            <View>
              <Text style={styles.statusLabel}>Terms</Text>
              <Text style={styles.statusValue}>Net {invoice.payment_terms}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.statusLabel}>Amount Due</Text>
            <Text style={{ ...styles.statusValue, fontSize: 14 }}>
              {formatMoney(invoice.amount_due, invoice.currency)}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Bill To */}
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.sectionLabel}>Bill To</Text>
              <Text style={{ ...styles.infoValue, fontWeight: 'bold' }}>
                {invoice.client?.name ?? 'Client'}
              </Text>
              {invoice.client?.company && (
                <Text style={styles.infoValue}>{invoice.client.company}</Text>
              )}
              <Text style={styles.infoValue}>{invoice.client?.email}</Text>
              {invoice.client?.address && (
                <Text style={styles.infoValue}>{invoice.client.address}</Text>
              )}
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
            {invoice.items.map((item, index) => (
              <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={{ ...styles.descCol, color: '#333' }}>{item.description}</Text>
                <Text style={{ ...styles.qtyCol, color: '#333' }}>{item.quantity}</Text>
                <Text style={{ ...styles.rateCol, color: '#333' }}>
                  {formatMoney(item.unit_price, invoice.currency)}
                </Text>
                <Text style={{ ...styles.amountCol, fontWeight: 'bold', color: '#1a1a1a' }}>
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
                <Text style={styles.totalValue}>
                  {formatMoney(invoice.subtotal, invoice.currency)}
                </Text>
              </View>
              {invoice.tax_rate > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax ({invoice.tax_rate}%)</Text>
                  <Text style={styles.totalValue}>
                    {formatMoney(invoice.tax_amount, invoice.currency)}
                  </Text>
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

          {/* Notes */}
          {invoice.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
  );
}
