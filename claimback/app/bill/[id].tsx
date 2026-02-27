import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { generateDisputeLetter, BillType, Overcharge, LineItem } from '@/lib/openai';
import { useAuthStore } from '@/store/auth';

const SEVERITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6366f1',
};

interface BillDetail {
  id: string;
  provider: string;
  bill_type: BillType;
  bill_date: string;
  total_amount: number;
  line_items: LineItem[];
  overcharges: Overcharge[];
  potential_savings: number;
  summary: string;
  status: string;
}

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingLetter, setGeneratingLetter] = useState(false);

  const loadBill = useCallback(async () => {
    const { data } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setBill(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadBill(); }, [loadBill]);

  async function handleGenerateLetter() {
    if (!bill || !user) return;
    setGeneratingLetter(true);
    try {
      const userName = user.user_metadata?.full_name ?? 'Account Holder';
      const letter = await generateDisputeLetter(
        {
          provider: bill.provider,
          billDate: bill.bill_date,
          totalAmount: bill.total_amount,
          lineItems: bill.line_items,
          overcharges: bill.overcharges,
          totalPotentialSavings: bill.potential_savings,
          summary: bill.summary,
        },
        bill.bill_type,
        userName,
      );

      const { data: saved } = await supabase
        .from('dispute_letters')
        .insert({ user_id: user.id, bill_id: bill.id, letter_content: letter, status: 'draft' })
        .select('id')
        .single();

      await supabase.from('bills').update({ status: 'disputed' }).eq('id', bill.id);
      setBill((prev) => prev ? { ...prev, status: 'disputed' } : prev);

      if (saved) router.push(`/dispute/${saved.id}`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to generate letter');
    } finally {
      setGeneratingLetter(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!bill) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Bill not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pb-4 pt-14">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">{bill.provider}</Text>
            <Text className="text-sm text-gray-500">{new Date(bill.bill_date).toLocaleDateString()}</Text>
          </View>
          <View className="rounded-full bg-gray-100 px-3 py-1">
            <Text className="text-xs capitalize text-gray-600">{bill.status}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-5 gap-4">
        {/* Summary */}
        <View className="rounded-2xl bg-white p-5 shadow-sm">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-400">Total Billed</Text>
              <Text className="text-2xl font-bold text-gray-900">${bill.total_amount.toFixed(2)}</Text>
            </View>
            {bill.potential_savings > 0 && (
              <View className="items-end">
                <Text className="text-xs text-gray-400">Potential Savings</Text>
                <Text className="text-2xl font-bold text-brand-600">${bill.potential_savings.toFixed(2)}</Text>
              </View>
            )}
          </View>
          {bill.summary && (
            <Text className="mt-3 text-sm text-gray-600">{bill.summary}</Text>
          )}
        </View>

        {/* Overcharges */}
        {bill.overcharges?.length > 0 && (
          <View className="rounded-2xl bg-white shadow-sm overflow-hidden">
            <View className="border-b border-gray-100 px-5 py-4">
              <Text className="font-semibold text-gray-900">
                Detected Overcharges ({bill.overcharges.length})
              </Text>
            </View>
            {bill.overcharges.map((o, i) => (
              <View key={i} className="border-b border-gray-50 px-5 py-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center gap-2">
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: `${SEVERITY_COLORS[o.severity]}20` }}
                      >
                        <Text className="text-xs font-medium capitalize" style={{ color: SEVERITY_COLORS[o.severity] }}>
                          {o.severity}
                        </Text>
                      </View>
                      <Text className="text-xs capitalize text-gray-400">{o.type.replace('_', ' ')}</Text>
                    </View>
                    <Text className="mt-1.5 text-sm text-gray-800">{o.description}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-gray-400">Save</Text>
                    <Text className="text-base font-bold text-brand-600">${o.potentialSavings.toFixed(2)}</Text>
                  </View>
                </View>
                <View className="mt-2 flex-row gap-4">
                  <Text className="text-xs text-gray-400">Billed: <Text className="text-red-500">${o.billedAmount.toFixed(2)}</Text></Text>
                  <Text className="text-xs text-gray-400">Fair: <Text className="text-green-600">${o.fairAmount.toFixed(2)}</Text></Text>
                  <Text className="text-xs text-gray-400">Confidence: {Math.round(o.confidence * 100)}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Line items */}
        {bill.line_items?.length > 0 && (
          <View className="rounded-2xl bg-white shadow-sm overflow-hidden">
            <View className="border-b border-gray-100 px-5 py-4">
              <Text className="font-semibold text-gray-900">Line Items</Text>
            </View>
            {bill.line_items.map((item, i) => (
              <View key={i} className="flex-row items-center justify-between border-b border-gray-50 px-5 py-3">
                <View className="flex-1 pr-3">
                  <Text className="text-sm text-gray-800">{item.description}</Text>
                  {item.code && <Text className="text-xs text-gray-400">{item.code}</Text>}
                </View>
                <Text className="text-sm font-medium text-gray-700">${item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      {bill.overcharges?.length > 0 && bill.status === 'analyzed' && (
        <View className="border-t border-gray-100 bg-white p-5">
          <TouchableOpacity
            className={`items-center rounded-xl py-4 ${generatingLetter ? 'bg-brand-500 opacity-70' : 'bg-brand-600'}`}
            onPress={handleGenerateLetter}
            disabled={generatingLetter}
          >
            {generatingLetter ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-base font-semibold text-white">Generating Dispute Letter...</Text>
              </View>
            ) : (
              <Text className="text-base font-semibold text-white">
                Generate Dispute Letter — Save ${bill.potential_savings.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
