import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ScanSearch, Filter, ClipboardList } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { getInspections } from '@/lib/actions/inspections';
import { InspectionCard } from '@/components/inspections/InspectionCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Inspection, InspectionStatus } from '@/types';

type FilterTab = 'all' | InspectionStatus;

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'submitted', label: 'Submitted' },
];

export default function InspectScreen() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const loadInspections = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const data = await getInspections(user.id);
      setInspections(data);
    } catch (err) {
      console.error('Failed to load inspections:', err);
      Alert.alert('Error', 'Failed to load inspections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInspections();
  }, [loadInspections]);

  const filteredInspections = activeFilter === 'all'
    ? inspections
    : inspections.filter((i) => i.status === activeFilter);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading inspections..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ScanSearch size={22} color="#dc2626" />
          <Text style={styles.headerTitle}>Inspections</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/inspections/new')}
          style={styles.newButton}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filterTabs.map((tab) => {
          const count = tab.key === 'all'
            ? inspections.length
            : inspections.filter((i) => i.status === tab.key).length;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.8}
              style={[
                styles.filterTab,
                activeFilter === tab.key && styles.filterTabActive,
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === tab.key && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[
                  styles.filterBadge,
                  activeFilter === tab.key && styles.filterBadgeActive,
                ]}>
                  <Text style={[
                    styles.filterBadgeText,
                    activeFilter === tab.key && styles.filterBadgeTextActive,
                  ]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      {filteredInspections.length === 0 ? (
        <View style={styles.emptyState}>
          <ClipboardList size={48} color="#3f3f46" />
          <Text style={styles.emptyTitle}>
            {activeFilter === 'all' ? 'No inspections yet' : `No ${activeFilter.replace('_', ' ')} inspections`}
          </Text>
          <Text style={styles.emptySubtitle}>
            Tap "New" to start a property damage inspection
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/inspections/new')}
            style={styles.emptyButton}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#ffffff" />
            <Text style={styles.emptyButtonText}>Start Inspection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredInspections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <InspectionCard
              inspection={item}
              onPress={() => router.push(`/inspections/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#dc2626"
            />
          }
        />
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  filterScroll: {
    backgroundColor: '#111111',
    maxHeight: 52,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1c1c1e',
  },
  filterTabActive: {
    backgroundColor: '#dc2626',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#71717a',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  filterBadge: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeActive: {
    backgroundColor: '#ffffff33',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717a',
  },
  filterBadgeTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
