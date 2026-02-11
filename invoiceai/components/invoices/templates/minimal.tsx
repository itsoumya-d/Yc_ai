import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { InvoiceWithDetails, User } from '@/types/database';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  invoiceTitle: {
    fontSize: 11,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  detailsBlock: {},
  label: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 3,
  },
  value: {
    fontSize: 10,
    lineHeight: 1.6,
  },
  valueBold: {
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 1.6,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tableHeaderText: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  descCol: { width: '55%' },
  qtyCol: { width: '10%', textAlign: 'right' },
  rateCol: { width: '15%', textAlign: 'right' },
  amountCol: { width: '20%', textAlign: 'right' },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBlock: {
    width: '35%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: { fontSize: 10, color: '#999' },
  totalValue: { fontSize: 10 },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  grandTotalLabel: { fontSize: 11, fontWeight: 'bold' },
  grandTotalValue: { fontSize: 13, fontWeight: 'bold' },
  notes: {
    marginTop: 40,
  },
  notesText: {
    fontSize: 9,
    color: '#999',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#ccc',
  },
});

function formatMoney(amount: number, currency: string = 'USD') {
  return `${currency === 'USD' ? '$' : currency + ' '}${amount.toFixed(2)}`;
}

interface MinimalTemplateProps {
  invoice: InvoiceWithDetails;
  user?: User | null;
}

export function MinimalTemplate({ invoice, user }: MinimalTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brandName}>
            {user?.business_name ?? 'Your Business'}
          </Text>
          <Text style={styles.invoiceTitle}>Invoice</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailsBlock}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.valueBold}>{invoice.client?.name ?? 'Client'}</Text>
            {invoice.client?.company && (
              <Text style={styles.value}>{invoice.client.company}</Text>
            )}
            <Text style={styles.value}>{invoice.client?.email}</Text>
          </View>
          <View style={styles.detailsBlock}>
            <Text style={styles.label}>Invoice No.</Text>
            <Text style={styles.valueBold}>{invoice.invoice_number}</Text>
          </View>
          <View style={styles.detailsBlock}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{invoice.issue_date}</Text>
            <Text style={{ ...styles.label, marginTop: 8 }}>Due</Text>
            <Text style={styles.value}>{invoice.due_date}</Text>
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
              <Text style={styles.amountCol}>{formatMoney(item.amount, invoice.currency)}</Text>
            </View>
          ))}
        </View>

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
                <Text style={styles.totalValue}>-{formatMoney(invoice.discount_amount, invoice.currency)}</Text>
              </View>
            )}
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatMoney(invoice.amount_due, invoice.currency)}</Text>
            </View>
          </View>
        </View>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Thank you for your business
        </Text>
      </Page>
    </Document>
  );
}
