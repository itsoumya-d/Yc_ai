import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { InvoiceWithDetails, User } from '@/types/database';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    flexDirection: 'row',
  },
  sidebar: {
    width: 180,
    backgroundColor: '#0f172a',
    padding: 30,
    paddingTop: 40,
    color: '#ffffff',
  },
  sidebarBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  sidebarDetail: {
    fontSize: 8,
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  sidebarDivider: {
    height: 2,
    backgroundColor: '#16a34a',
    marginVertical: 20,
    width: 40,
  },
  sidebarLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#16a34a',
    letterSpacing: 1.5,
    marginBottom: 4,
    marginTop: 14,
  },
  sidebarValue: {
    fontSize: 10,
    color: '#e2e8f0',
    lineHeight: 1.5,
  },
  sidebarAmountBox: {
    backgroundColor: '#16a34a',
    borderRadius: 4,
    padding: 12,
    marginTop: 20,
    textAlign: 'center',
  },
  sidebarAmountLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#bbf7d0',
    letterSpacing: 1,
  },
  sidebarAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  main: {
    flex: 1,
    padding: 35,
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  dateBox: {
    textAlign: 'right',
  },
  dateLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: 10,
    color: '#334155',
    marginTop: 2,
    marginBottom: 8,
  },
  accentLine: {
    height: 3,
    backgroundColor: '#16a34a',
    marginBottom: 25,
    borderRadius: 2,
  },
  billTo: {
    marginBottom: 25,
  },
  billToLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#16a34a',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  billToName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  billToDetail: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.5,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  descCol: { width: '50%' },
  qtyCol: { width: '15%', textAlign: 'right' },
  rateCol: { width: '15%', textAlign: 'right' },
  amountCol: { width: '20%', textAlign: 'right' },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  totalsBlock: {
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 9,
    color: '#334155',
    textAlign: 'right',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#0f172a',
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#16a34a',
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8,
    color: '#64748b',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
  },
});

function formatMoney(amount: number, currency: string = 'USD') {
  return `${currency === 'USD' ? '$' : currency + ' '}${amount.toFixed(2)}`;
}

interface CreativeTemplateProps {
  invoice: InvoiceWithDetails;
  user?: User | null;
}

export function CreativeTemplate({ invoice, user }: CreativeTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarBrand}>
            {user?.business_name ?? 'Your Business'}
          </Text>
          <Text style={styles.sidebarDetail}>
            {[user?.business_address, user?.business_email, user?.business_phone]
              .filter(Boolean)
              .join('\n')}
          </Text>

          <View style={styles.sidebarDivider} />

          <Text style={styles.sidebarLabel}>Invoice</Text>
          <Text style={styles.sidebarValue}>{invoice.invoice_number}</Text>

          <Text style={styles.sidebarLabel}>Issued</Text>
          <Text style={styles.sidebarValue}>{invoice.issue_date}</Text>

          <Text style={styles.sidebarLabel}>Due</Text>
          <Text style={styles.sidebarValue}>{invoice.due_date}</Text>

          <Text style={styles.sidebarLabel}>Terms</Text>
          <Text style={styles.sidebarValue}>Net {invoice.payment_terms}</Text>

          <View style={styles.sidebarAmountBox}>
            <Text style={styles.sidebarAmountLabel}>Amount Due</Text>
            <Text style={styles.sidebarAmountValue}>
              {formatMoney(invoice.amount_due, invoice.currency)}
            </Text>
          </View>

          {invoice.terms && (
            <>
              <Text style={{ ...styles.sidebarLabel, marginTop: 20 }}>Terms</Text>
              <Text style={{ ...styles.sidebarDetail, fontSize: 7 }}>{invoice.terms}</Text>
            </>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.invoiceTitle}>Invoice</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Issue Date</Text>
              <Text style={styles.dateValue}>{invoice.issue_date}</Text>
              <Text style={styles.dateLabel}>Due Date</Text>
              <Text style={styles.dateValue}>{invoice.due_date}</Text>
            </View>
          </View>

          <View style={styles.accentLine} />

          {/* Bill To */}
          <View style={styles.billTo}>
            <Text style={styles.billToLabel}>Bill To</Text>
            <Text style={styles.billToName}>
              {invoice.client?.name ?? 'Client'}
            </Text>
            {invoice.client?.company && (
              <Text style={styles.billToDetail}>{invoice.client.company}</Text>
            )}
            <Text style={styles.billToDetail}>{invoice.client?.email}</Text>
            {invoice.client?.address && (
              <Text style={styles.billToDetail}>{invoice.client.address}</Text>
            )}
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderText, ...styles.descCol }}>Description</Text>
              <Text style={{ ...styles.tableHeaderText, ...styles.qtyCol }}>Qty</Text>
              <Text style={{ ...styles.tableHeaderText, ...styles.rateCol }}>Rate</Text>
              <Text style={{ ...styles.tableHeaderText, ...styles.amountCol }}>Amount</Text>
            </View>
            {invoice.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={{ ...styles.descCol, color: '#334155' }}>{item.description}</Text>
                <Text style={{ ...styles.qtyCol, color: '#334155' }}>{item.quantity}</Text>
                <Text style={{ ...styles.rateCol, color: '#334155' }}>
                  {formatMoney(item.unit_price, invoice.currency)}
                </Text>
                <Text style={{ ...styles.amountCol, fontWeight: 'bold', color: '#0f172a' }}>
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

          <Text style={styles.footer}>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
}
