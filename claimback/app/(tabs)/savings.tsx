import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

interface SavingsSummary {
  identified: number;
  disputed: number;
  recovered: number;
  totalBills: number;
  resolvedBills: number;
  billsByType: Record<string, number>;
}

export default function SavingsScreen() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<SavingsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!user) return;

    const { data: bills } = await supabase
      .from('bills')
      .select('bill_type, potential_savings, status, outcome_amount')
      .eq('user_id', user.id);

    if (!bills) { setLoading(false); return; }

    const s: SavingsSummary = {
      identified: 0,
      disputed: 0,
      recovered: 0,
      totalBills: bills.length,
      resolvedBills: 0,
      billsByType: {},
    };

    for (const bill of bills) {
      s.identified += bill.potential_savings ?? 0;
      if (bill.status === 'disputed') s.disputed += bill.potential_savings ?? 0;
      if (bill.status === 'resolved') {
        s.recovered += bill.outcome_amount ?? 0;
        s.resolvedBills++;
      }
      s.billsByType[bill.bill_type] = (s.billsByType[bill.bill_type] ?? 0) + 1;
    }

    setSummary(s);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const onRefresh = () => { setRefreshing(true); loadSummary(); };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}
    >
      {/* Header */}
      <View className="bg-brand-600 px-5 pb-8 pt-14">
        <Text className="text-2xl font-bold text-white">Your Savings</Text>
        <Text className="mt-1 text-sm text-green-200">Money recovered through Claimback</Text>
        <View className="mt-6">
          <Text className="text-sm text-green-100">Total Recovered</Text>
          <Text className="text-5xl font-bold text-white">
            ${(summary?.recovered ?? 0).toFixed(2)}
          </Text>
        </View>
      </View>

      <View className="p-5 gap-4">
        {/* Savings pipeline */}
        <View className="rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-4 text-base font-semibold text-gray-900">Savings Pipeline</Text>
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                  <Ionicons name="search-outline" size={20} color="#6366f1" />
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-700">Identified</Text>
                  <Text className="text-xs text-gray-400">Potential overcharges found</Text>
                </View>
              </View>
              <Text className="text-base font-bold text-indigo-600">
                ${(summary?.identified ?? 0).toFixed(2)}
              </Text>
            </View>

            <View className="ml-5 h-6 w-0.5 bg-gray-100" />

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Ionicons name="mail-outline" size={20} color="#f59e0b" />
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-700">Disputed</Text>
                  <Text className="text-xs text-gray-400">Letters sent, awaiting response</Text>
                </View>
              </View>
              <Text className="text-base font-bold text-amber-600">
                ${(summary?.disputed ?? 0).toFixed(2)}
              </Text>
            </View>

            <View className="ml-5 h-6 w-0.5 bg-gray-100" />

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-700">Recovered</Text>
                  <Text className="text-xs text-gray-400">Money back in your pocket</Text>
                </View>
              </View>
              <Text className="text-base font-bold text-brand-600">
                ${(summary?.recovered ?? 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-2xl font-bold text-gray-900">{summary?.totalBills ?? 0}</Text>
            <Text className="mt-1 text-xs text-gray-500">Bills analyzed</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-2xl font-bold text-brand-600">{summary?.resolvedBills ?? 0}</Text>
            <Text className="mt-1 text-xs text-gray-500">Disputes resolved</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-2xl font-bold text-gray-900">
              {summary?.totalBills && summary.totalBills > 0
                ? `${Math.round((summary.resolvedBills / summary.totalBills) * 100)}%`
                : '—'}
            </Text>
            <Text className="mt-1 text-xs text-gray-500">Success rate</Text>
          </View>
        </View>

        {/* Bills by type */}
        {summary && Object.keys(summary.billsByType).length > 0 && (
          <View className="rounded-2xl bg-white p-5 shadow-sm">
            <Text className="mb-4 text-base font-semibold text-gray-900">Bills by Category</Text>
            {Object.entries(summary.billsByType).map(([type, count]) => (
              <View key={type} className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm capitalize text-gray-700">{type}</Text>
                <View className="flex-row items-center gap-2">
                  <View
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: count * 20 }}
                  />
                  <Text className="text-sm font-medium text-gray-500">{count}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
