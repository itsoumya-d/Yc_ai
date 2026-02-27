import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, TrendingUp, ClipboardList, DollarSign, Home, FileCheck } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { getInspections, getDashboardStats } from '@/lib/actions/inspections';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { InspectionCard } from '@/components/inspections/InspectionCard';
import type { Inspection, DashboardStats } from '@/types';

export default function DashboardScreen() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [inspData, statsData] = await Promise.all([
        getInspections(user.id),
        getDashboardStats(user.id),
      ]);

      setInspections(inspData.slice(0, 5));
      setStats(statsData);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading dashboard..." />;
  }

  const statCards = [
    {
      icon: ClipboardList,
      label: 'Inspections',
      value: String(stats?.total_inspections ?? 0),
      color: '#dc2626',
      bg: '#2d1515',
    },
    {
      icon: DollarSign,
      label: 'Total Claims',
      value: stats?.total_claims_value
        ? `$${(stats.total_claims_value / 1000).toFixed(0)}K`
        : '$0',
      color: '#ea580c',
      bg: '#2c1a10',
    },
    {
      icon: Home,
      label: 'Properties',
      value: String(stats?.properties_inspected ?? 0),
      color: '#f59e0b',
      bg: '#2c2010',
    },
    {
      icon: FileCheck,
      label: 'Approved',
      value: String(stats?.approved_reports ?? 0),
      color: '#16a34a',
      bg: '#14301c',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>InspectorAI</Text>
          <Text style={styles.subtitle}>Property Damage Assessment</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/inspections/new')}
          style={styles.newButton}
          activeOpacity={0.8}
        >
          <Plus size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#dc2626"
          />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bg }]}>
              <View style={[styles.statIconBg, { backgroundColor: `${stat.color}22` }]}>
                <stat.icon size={18} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Avg Damage Cost */}
        {(stats?.avg_damage_cost ?? 0) > 0 && (
          <View style={styles.avgCostCard}>
            <TrendingUp size={18} color="#dc2626" />
            <View style={styles.avgCostText}>
              <Text style={styles.avgCostLabel}>Avg. Damage Cost per Inspection</Text>
              <Text style={styles.avgCostValue}>
                ${stats!.avg_damage_cost.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Recent Inspections */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Inspections</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/inspect')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {inspections.length === 0 ? (
          <View style={styles.emptyState}>
            <ClipboardList size={40} color="#3f3f46" />
            <Text style={styles.emptyTitle}>No inspections yet</Text>
            <Text style={styles.emptySubtitle}>
              Start your first inspection to assess property damage
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/inspections/new')}
              style={styles.emptyButton}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Start Inspection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          inspections.map((insp) => (
            <InspectionCard
              key={insp.id}
              inspection={insp}
              onPress={() => router.push(`/inspections/${insp.id}`)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  newButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: '#71717a',
  },
  avgCostCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  avgCostText: {
    flex: 1,
  },
  avgCostLabel: {
    fontSize: 12,
    color: '#71717a',
  },
  avgCostValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  seeAll: {
    fontSize: 13,
    color: '#dc2626',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
