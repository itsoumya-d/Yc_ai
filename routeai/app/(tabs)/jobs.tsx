import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { parseJobFromText } from '@/services/ai';
import { getOrgJobs, createJob } from '@/services/supabase';
import { useAuthStore } from '@/stores/auth';
import {
  COLORS,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  JOB_STATUS_COLORS,
  PRIORITY_COLORS,
} from '@/constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Job {
  id: string;
  serviceType: string;
  status: string;
  priority: string;
  scheduledAt: string;
  estimatedDuration: number;
  notes?: string;
  customer: {
    name: string;
    address: string;
    phone?: string;
  };
  driverName?: string;
}

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  try { return format(new Date(iso), 'h:mm a, MMM d'); } catch { return '--'; }
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function openMaps(address: string) {
  const enc = encodeURIComponent(address);
  const url = Platform.OS === 'ios' ? `maps://?daddr=${enc}` : `google.navigation:q=${enc}`;
  Linking.openURL(url).catch(() => Linking.openURL(`https://maps.google.com/?q=${enc}`));
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = JOB_STATUS_COLORS[job.status] ?? COLORS.textSecondary;
  const priorityColor = PRIORITY_COLORS[job.priority] ?? COLORS.textSecondary;

  return (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
    >
      {/* Priority stripe */}
      <View style={[styles.priorityStripe, { backgroundColor: priorityColor }]} />

      <View style={styles.jobCardContent}>
        {/* Header row */}
        <View style={styles.jobCardHeader}>
          <Text style={styles.jobCustomer} numberOfLines={1}>{job.customer.name}</Text>
          <View style={[styles.statusChip, { backgroundColor: statusColor + '18' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {job.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.jobRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.jobAddress} numberOfLines={1}>{job.customer.address}</Text>
        </View>

        {/* Meta */}
        <View style={styles.jobMeta}>
          <View style={styles.jobMetaItem}>
            <Ionicons name="construct-outline" size={12} color={COLORS.primary} />
            <Text style={styles.jobMetaText}>{job.serviceType}</Text>
          </View>
          <View style={styles.jobMetaItem}>
            <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.jobMetaText}>{formatTime(job.scheduledAt)}</Text>
          </View>
          <View style={styles.jobMetaItem}>
            <Ionicons name="hourglass-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.jobMetaText}>{formatDuration(job.estimatedDuration)}</Text>
          </View>
        </View>

        {/* Priority badge */}
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '15' }]}>
          <Text style={[styles.priorityText, { color: priorityColor }]}>
            {job.priority.toUpperCase()}
          </Text>
        </View>

        {/* Expand indicator */}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.textSecondary}
          style={styles.expandIcon}
        />

        {/* Expanded details */}
        {expanded && (
          <View style={styles.expanded}>
            {job.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{job.notes}</Text>
              </View>
            ) : null}

            {job.driverName ? (
              <View style={styles.assignRow}>
                <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.assignText}>Assigned to: {job.driverName}</Text>
              </View>
            ) : null}

            <View style={styles.expandedActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => openMaps(job.customer.address)}
              >
                <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Add Job Modal ────────────────────────────────────────────────────────────

function AddJobModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { driverProfile } = useAuthStore();
  const queryClient = useQueryClient();
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState<{
    customerName: string;
    address: string;
    serviceType: string;
    estimatedDuration: number;
    priority: string;
    notes: string;
  } | null>(null);

  async function handleParse() {
    if (!rawText.trim()) return;
    setParsing(true);
    try {
      const result = await parseJobFromText(rawText.trim());
      setParsed(result);
    } catch {
      Alert.alert('Parse Error', 'Could not parse job. Please try again.');
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    if (!parsed || !driverProfile?.orgId) return;
    setSaving(true);
    try {
      await createJob({
        org_id: driverProfile.orgId,
        assigned_driver_id: driverProfile.id,
        service_type: parsed.serviceType,
        priority: parsed.priority,
        scheduled_at: new Date().toISOString(),
        estimated_duration: parsed.estimatedDuration,
        notes: parsed.notes,
      });
      await queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setRawText('');
      setParsed(null);
      onClose();
    } catch {
      Alert.alert('Error', 'Could not save job.');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setRawText('');
    setParsed(null);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Job</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            <Text style={styles.inputLabel}>Describe the job</Text>
            <TextInput
              style={styles.rawInput}
              value={rawText}
              onChangeText={setRawText}
              placeholder="e.g. John Smith at 123 Main St needs urgent HVAC repair, leaking unit, ~2 hours"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.parseBtn, (!rawText.trim() || parsing) && styles.btnDisabled]}
              onPress={handleParse}
              disabled={!rawText.trim() || parsing}
            >
              {parsing ? (
                <ActivityIndicator color={COLORS.surface} size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={16} color={COLORS.surface} />
                  <Text style={styles.parseBtnText}>Parse with AI</Text>
                </>
              )}
            </TouchableOpacity>

            {parsed && (
              <View style={styles.parsedCard}>
                <Text style={styles.parsedTitle}>Parsed Job Details</Text>
                {[
                  { label: 'Customer', value: parsed.customerName },
                  { label: 'Address', value: parsed.address },
                  { label: 'Service Type', value: parsed.serviceType },
                  { label: 'Duration', value: `${parsed.estimatedDuration} min` },
                  { label: 'Priority', value: parsed.priority.toUpperCase() },
                  ...(parsed.notes ? [{ label: 'Notes', value: parsed.notes }] : []),
                ].map(({ label, value }) => (
                  <View key={label} style={styles.parsedRow}>
                    <Text style={styles.parsedLabel}>{label}</Text>
                    <Text style={styles.parsedValue}>{value}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.btnDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={COLORS.surface} size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Job</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function JobsScreen() {
  const { driverProfile } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchJobs = useCallback(async (): Promise<Job[]> => {
    if (!driverProfile?.orgId) return [];
    const raw = await getOrgJobs(driverProfile.orgId);
    return raw.map((j: {
      id: string;
      service_type: string;
      status: string;
      priority: string;
      scheduled_at: string;
      estimated_duration: number;
      notes?: string;
      customers: { name: string; address: string; phone?: string };
      drivers?: { name: string };
    }) => ({
      id: j.id,
      serviceType: j.service_type,
      status: j.status,
      priority: j.priority,
      scheduledAt: j.scheduled_at,
      estimatedDuration: j.estimated_duration,
      notes: j.notes,
      customer: {
        name: j.customers?.name ?? 'Unknown',
        address: j.customers?.address ?? '',
        phone: j.customers?.phone,
      },
      driverName: j.drivers?.name,
    }));
  }, [driverProfile?.orgId]);

  const { data: jobs = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['jobs', driverProfile?.orgId],
    queryFn: fetchJobs,
    enabled: !!driverProfile?.orgId,
  });

  const filtered = useMemo(() => {
    let list = jobs;
    if (filter !== 'all') {
      list = list.filter((j) => j.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.customer.name.toLowerCase().includes(q) ||
          j.customer.address.toLowerCase().includes(q) ||
          j.serviceType.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [jobs, filter, search]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs</Text>
        <Text style={styles.headerSub}>{jobs.length} total</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search jobs, customers, addresses…"
          placeholderTextColor={COLORS.textSecondary}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jobs List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(j) => j.id}
          renderItem={({ item }) => <JobCard job={item} />}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No jobs found</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={28} color={COLORS.surface} />
      </TouchableOpacity>

      <AddJobModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  headerTitle: { color: COLORS.surface, fontSize: FONT_SIZE.xl, fontWeight: '700' },
  headerSub: { color: COLORS.primaryLight, fontSize: FONT_SIZE.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    marginBottom: 0,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  filterScroll: { maxHeight: 48 },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: COLORS.surface },
  listContent: { padding: SPACING.lg, paddingBottom: 90, gap: SPACING.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  jobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  priorityStripe: { width: 4 },
  jobCardContent: { flex: 1, padding: SPACING.md },
  jobCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  jobCustomer: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  statusChip: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  statusText: { fontSize: 10, fontWeight: '700' },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  jobAddress: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, flex: 1 },
  jobMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: 2 },
  jobMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  jobMetaText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  priorityText: { fontSize: 9, fontWeight: '800' },
  expandIcon: { position: 'absolute', bottom: SPACING.md, right: SPACING.md },
  expanded: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  notesBox: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  notesLabel: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 3 },
  notesText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  assignRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  assignText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  expandedActions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    gap: 6,
  },
  actionBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.textSecondary, marginTop: SPACING.md },

  fab: {
    position: 'absolute',
    bottom: SPACING.xxl,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },

  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  closeBtn: { padding: SPACING.xs },
  modalScroll: { flex: 1 },
  modalContent: { padding: SPACING.lg, gap: SPACING.md },
  inputLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  rawInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    minHeight: 100,
    ...SHADOWS.sm,
  },
  parseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  parseBtnText: { color: COLORS.surface, fontSize: FONT_SIZE.md, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
  parsedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.sm,
  },
  parsedTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  parsedRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  parsedLabel: { width: 90, fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary },
  parsedValue: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.text },
  saveBtn: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  saveBtnText: { color: COLORS.surface, fontSize: FONT_SIZE.md, fontWeight: '700' },
});
