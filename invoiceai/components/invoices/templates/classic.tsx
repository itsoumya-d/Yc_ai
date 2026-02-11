import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { InvoiceWithDetails, User } from '@/types/database';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#333',
  },
  invoiceNumber: {
    fontSize: 11,
    textAlign: 'right',
    color: '#666',
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailsBlock: {
    width: '45%',
  },
  label: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#999',
    marginBottom: 4,
    letterSpacing: 1,
  },
  value: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#666',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
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
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 10,
    color: '#666',
  },
  totalValue: {
    fontSize: 10,
    textAlign: 'right',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 2,
    borderTopColor: '#16a34a',
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  notes: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  notesText: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.5,
  },
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

interface ClassicTemplateProps {
  invoice: InvoiceWithDetails;
  user?: User | null;
}

export function ClassicTemplate({ invoice, user }: ClassicTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>
              {user?.business_name ?? 'Your Business'}
            </Text>
            {user?.business_address && (
              <Text style={{ ...styles.value, marginTop: 4, color: '#666' }}>
                {user.business_address}
              </Text>
            )}
            {user?.business_email && (
              <Text style={{ ...styles.value, color: '#666' }}>
                {user.business_email}
              </Text>
            )}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailsBlock}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={{ ...styles.value, fontWeight: 'bold' }}>
              {invoice.client?.name ?? 'Client'}
            </Text>
            {invoice.client?.company && (
              <Text style={styles.value}>{invoice.client.company}</Text>
            )}
            <Text style={styles.value}>{invoice.client?.email}</Text>
            {invoice.client?.address && (
              <Text style={styles.value}>{invoice.client.address}</Text>
            )}
          </View>
          <View style={styles.detailsBlock}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={styles.label}>Issue Date</Text>
              <Text style={styles.value}>{invoice.issue_date}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>{invoice.due_date}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Terms</Text>
              <Text style={styles.value}>Net {invoice.payment_terms}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
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

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </Page>
    </Document>
  );
}
