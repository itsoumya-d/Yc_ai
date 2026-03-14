import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { BillType } from '@/lib/openai';

interface Bill {
  id: string;
  provider: string;
  bill_type: BillType;
  bill_date: string;
  total_amount: number;
  potential_savings: number;
  status: 'analyzed' | 'disputed' | 'resolved' | 'denied';
  created_at: string;
}

const BILL_TYPE_LABELS: Record<BillType, string> = {
  medical: 'Medical',
  utility: 'Utility',
  telecom: 'Telecom',
  insurance: 'Insurance',
  subscription: 'Subscription',
  other: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  analyzed: '#6366f1',
  disputed: '#f59e0b',
  resolved: '#059669',
  denied: '#ef4444',
};

export default function BillsScreen() {
  const { user } = useAuthStore();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBills = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bills')
      .select('id, provider, bill_type, bill_date, total_amount, potential_savings, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setBills(data);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => { loadBills(); }, [loadBills]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBills();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pb-4 pt-14">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">My Bills</Text>
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-brand-600"
            onPress={() => router.push('/(tabs)/scan')}
          >
            <Ionicons name="add" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {bills.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-brand-100">
            <Ionicons name="receipt-outline" size={40} color="#059669" />
          </View>
          <Text className="text-center text-xl font-semibold text-gray-800">No bills yet</Text>
          <Text className="mt-2 text-center text-sm text-gray-500">
            Scan your first bill to detect overcharges and start saving money
          </Text>
          <TouchableOpacity
            className="mt-6 rounded-xl bg-brand-600 px-6 py-3.5"
            onPress={() => router.push('/(tabs)/scan')}
          >
            <Text className="font-semibold text-white">Scan Your First Bill</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4 gap-3"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="rounded-2xl bg-white p-4 shadow-sm"
              onPress={() => router.push(`/bill/${item.id}`)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{item.provider}</Text>
                  <View className="mt-1 flex-row items-center gap-2">
                    <View className="rounded-full bg-gray-100 px-2 py-0.5">
                      <Text className="text-xs text-gray-600">{BILL_TYPE_LABELS[item.bill_type]}</Text>
                    </View>
                    <Text className="text-xs text-gray-400">{new Date(item.bill_date).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-gray-500">${item.total_amount.toFixed(2)}</Text>
                  {item.potential_savings > 0 && (
                    <Text className="mt-0.5 text-sm font-bold text-brand-600">
                      Save ${item.potential_savings.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>

              <View className="mt-3 flex-row items-center justify-between">
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: `${STATUS_COLORS[item.status]}20` }}
                >
                  <Text className="text-xs font-medium capitalize" style={{ color: STATUS_COLORS[item.status] }}>
                    {item.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
