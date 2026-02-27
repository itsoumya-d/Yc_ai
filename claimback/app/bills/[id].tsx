import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getBillById } from '../../lib/actions/bills';
import { createDispute } from '../../lib/actions/disputes';
import type { Bill } from '../../types';

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [disputing, setDisputing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getBillById(id)
      .then(setBill)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDispute = async () => {
    if (!bill) return;
    setDisputing(true);
    try {
      const dispute = await createDispute(bill.id, 'Bill contains overcharges identified by Claimback AI analysis.');
      router.push({ pathname: '/disputes/[id]', params: { id: dispute.id } });
    } catch (error: any) {
      console.error(error);
    } finally {
      setDisputing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><ActivityIndicator size="large" color="#16a34a" /></View>
      </SafeAreaView>
    );
  }

  if (!bill) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}><Text style={styles.errorText}>Bill not found.</Text></View>
      </SafeAreaView>
    );
  }

  const overchargeTotal = (bill.line_items || [])
    .filter((item: any) => item.is_overcharge)
    .reduce((sum: number, item: any) => sum + (item.amount - (item.fair_amount || 0)), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.providerCard}>
          <Text style={styles.providerName}>{bill.provider_name || 'Unknown Provider'}</Text>
          <Text style={styles.billType}>{bill.bill_type?.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.billDate}>{new Date(bill.created_at).toLocaleDateString()}</Text>
        </View>

        <View style={styles.amountsCard}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Billed</Text>
            <Text style={styles.amountValue}>${bill.total_amount?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Fair Price</Text>
            <Text style={[styles.amountValue, styles.greenText]}>${bill.fair_total?.toFixed(2) || '0.00'}</Text>
          </View>
          {overchargeTotal > 0 && (
            <View style={[styles.amountRow, styles.overchargeHighlight]}>
              <Text style={styles.overchargeLabel}>Overcharge Amount</Text>
              <Text style={styles.overchargeValue}>${overchargeTotal.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {bill.line_items && bill.line_items.length > 0 && (
          <View style={styles.lineItemsSection}>
            <Text style={styles.sectionTitle}>Line Items</Text>
            {bill.line_items.map((item: any, i: number) => (
              <View key={i} style={[styles.lineItem, item.is_overcharge && styles.lineItemOvercharge]}>
                <View style={styles.lineItemLeft}>
                  <Text style={styles.lineItemName}>{item.description}</Text>
                  {item.is_overcharge && (
                    <Text style={styles.overchargeTag}>Overcharge detected</Text>
                  )}
                </View>
                <View style={styles.lineItemRight}>
                  <Text style={styles.lineItemAmount}>${item.amount?.toFixed(2)}</Text>
                  {item.is_overcharge && item.fair_amount && (
                    <Text style={styles.fairAmount}>Fair: ${item.fair_amount.toFixed(2)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {overchargeTotal > 0 && !bill.dispute_id && (
          <TouchableOpacity
            style={[styles.disputeBtn, disputing && styles.disputeBtnDisabled]}
            onPress={handleDispute}
            disabled={disputing}
          >
            {disputing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.disputeBtnText}>Dispute Overcharges (${overchargeTotal.toFixed(2)})</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#64748b' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#16a34a',
  },
  backBtn: { padding: 4, width: 40 },
  backBtnText: { fontSize: 22, color: '#ffffff' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  content: { flex: 1, padding: 16 },
  providerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  providerName: { fontSize: 22, fontWeight: '700', color: '#1e293b' },
  billType: { fontSize: 13, color: '#16a34a', fontWeight: '600', marginTop: 4 },
  billDate: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  amountsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  amountLabel: { fontSize: 14, color: '#64748b' },
  amountValue: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  greenText: { color: '#16a34a' },
  overchargeHighlight: {
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  overchargeLabel: { fontSize: 14, color: '#ea580c', fontWeight: '600' },
  overchargeValue: { fontSize: 16, fontWeight: '800', color: '#ea580c' },
  lineItemsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  lineItemOvercharge: { borderLeftWidth: 3, borderLeftColor: '#f97316' },
  lineItemLeft: { flex: 1, marginRight: 12 },
  lineItemName: { fontSize: 13, color: '#1e293b' },
  overchargeTag: { fontSize: 11, color: '#ea580c', marginTop: 2 },
  lineItemRight: { alignItems: 'flex-end' },
  lineItemAmount: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  fairAmount: { fontSize: 11, color: '#16a34a', marginTop: 2 },
  disputeBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  disputeBtnDisabled: { opacity: 0.6 },
  disputeBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
});
