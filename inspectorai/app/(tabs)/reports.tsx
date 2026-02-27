import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { FileText, AlertCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { getReports, submitReport } from '@/lib/actions/reports';
import { ReportCard } from '@/components/reports/ReportCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Report, ReportStatus } from '@/types';

type FilterTab = 'all' | ReportStatus;

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function ReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const data = await getReports(user.id);
      setReports(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports();
  }, [loadReports]);

  const handleSubmitReport = useCallback(async (reportId: string) => {
    Alert.alert(
      'Submit Report',
      'Are you sure you want to submit this report for review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'default',
          onPress: async () => {
            try {
              await submitReport(reportId);
              setReports((prev) =>
                prev.map((r) =>
                  r.id === reportId
                    ? { ...r, status: 'submitted' as ReportStatus, submitted_at: new Date().toISOString() }
                    : r
                )
              );
            } catch {
              Alert.alert('Error', 'Failed to submit report. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  const filteredReports = activeFilter === 'all'
    ? reports
    : reports.filter((r) => r.status === activeFilter);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading reports..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#dc2626" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadReports}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FileText size={22} color="#dc2626" />
          <Text style={styles.headerTitle}>Reports</Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>
            {reports.filter((r) => r.status === 'submitted').length} pending
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {filterTabs.map((tab) => {
          const count = tab.key === 'all'
            ? reports.length
            : reports.filter((r) => r.status === tab.key).length;
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
                {count > 0 ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredReports.length === 0 ? (
        <View style={styles.emptyState}>
          <AlertCircle size={48} color="#3f3f46" />
          <Text style={styles.emptyTitle}>No reports found</Text>
          <Text style={styles.emptySubtitle}>
            Complete an inspection and generate a report to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReportCard
              report={item}
              onSubmit={item.status === 'draft' ? () => handleSubmitReport(item.id) : undefined}
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
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
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
  headerStats: {
    backgroundColor: '#2d1515',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerStatsText: {
    fontSize: 12,
    color: '#fca5a5',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#1c1c1e',
  },
  filterTabActive: {
    backgroundColor: '#dc2626',
  },
  filterTabText: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '500',
  },
  filterTabTextActive: {
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
});
