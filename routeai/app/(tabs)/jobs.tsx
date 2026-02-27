import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type Job = {
  id: string;
  day: string;
  date: string;
  customer: string;
  address: string;
  type: string;
  duration: string;
  pay: number;
  status: 'completed' | 'upcoming' | 'in-progress' | 'cancelled';
  time: string;
  priority: 'normal' | 'urgent';
  distance: string;
};

const JOBS: Job[] = [
  // Today
  { id: '1', day: 'Today', date: 'Feb 22', customer: 'Margaret Wilson', address: '1842 Oak Ave, Portland', type: 'HVAC Repair', duration: '2h', pay: 185, status: 'in-progress', time: '9:00 AM', priority: 'normal', distance: '0.8 mi' },
  { id: '2', day: 'Today', date: 'Feb 22', customer: 'Tom & Lisa Barker', address: '503 NE Alberta St', type: 'Electrical Inspection', duration: '1.5h', pay: 120, status: 'upcoming', time: '12:30 PM', priority: 'normal', distance: '3.2 mi' },
  { id: '3', day: 'Today', date: 'Feb 22', customer: 'Green Valley Apts', address: '2200 N Williams Ave', type: 'Plumbing Emergency', duration: '3h', pay: 295, status: 'upcoming', time: '3:00 PM', priority: 'urgent', distance: '5.1 mi' },
  // Tomorrow
  { id: '4', day: 'Tomorrow', date: 'Feb 23', customer: 'Chen Family', address: '712 SE Hawthorne Blvd', type: 'Furnace Install', duration: '4h', pay: 380, status: 'upcoming', time: '8:00 AM', priority: 'normal', distance: '4.4 mi' },
  { id: '5', day: 'Tomorrow', date: 'Feb 23', customer: 'Rose City Bakery', address: '1911 NE Broadway', type: 'Commercial HVAC', duration: '2.5h', pay: 240, status: 'upcoming', time: '1:00 PM', priority: 'normal', distance: '2.8 mi' },
  // Wed Feb 19
  { id: '6', day: 'Wed', date: 'Feb 19', customer: 'David Park', address: '445 SW Morrison', type: 'Water Heater Replace', duration: '2h', pay: 220, status: 'completed', time: '10:00 AM', priority: 'normal', distance: '1.9 mi' },
  { id: '7', day: 'Wed', date: 'Feb 19', customer: 'Pearl District Condo', address: '1015 NW Couch St', type: 'Drain Cleaning', duration: '1h', pay: 95, status: 'completed', time: '2:00 PM', priority: 'normal', distance: '2.2 mi' },
  // Tue
  { id: '8', day: 'Tue', date: 'Feb 18', customer: 'Sandra Lewis', address: '3301 SE Division St', type: 'HVAC Maintenance', duration: '1.5h', pay: 140, status: 'completed', time: '11:00 AM', priority: 'normal', distance: '3.8 mi' },
  { id: '9', day: 'Tue', date: 'Feb 18', customer: 'Metro Fitness', address: '800 NW 23rd Ave', type: 'Electrical Upgrade', duration: '5h', pay: 520, status: 'completed', time: '1:00 PM', priority: 'normal', distance: '5.5 mi' },
];

const STATUS_CONFIG = {
  completed: { label: 'Done', bg: '#ECFDF5', text: '#065F46', border: '#10B981' },
  upcoming: { label: 'Upcoming', bg: '#EFF6FF', text: '#1D4ED8', border: '#4F46E5' },
  'in-progress': { label: 'Active', bg: '#FEF9C3', text: '#713F12', border: '#F59E0B' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', text: '#991B1B', border: '#EF4444' },
};

const TYPE_FILTERS = ['All', 'HVAC', 'Electrical', 'Plumbing'];
const STATUS_FILTERS = ['All Jobs', 'Active', 'Upcoming', 'Completed'];

const grouped = (jobs: Job[]) => {
  const groups: Record<string, Job[]> = {};
  jobs.forEach(j => {
    if (!groups[j.day]) groups[j.day] = [];
    groups[j.day].push(j);
  });
  return Object.entries(groups);
};

export default function RouteAIJobsScreen() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Jobs');

  const filtered = JOBS.filter(j => {
    const matchType = typeFilter === 'All' || j.type.includes(typeFilter);
    const matchStatus =
      statusFilter === 'All Jobs' ||
      (statusFilter === 'Active' && j.status === 'in-progress') ||
      (statusFilter === 'Upcoming' && j.status === 'upcoming') ||
      (statusFilter === 'Completed' && j.status === 'completed');
    return matchType && matchStatus;
  });

  const todayEarnings = JOBS.filter(j => j.day === 'Today' && j.status !== 'cancelled').reduce((s, j) => s + j.pay, 0);
  const weekJobs = JOBS.filter(j => j.status === 'completed').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Jobs</Text>
          <Text style={styles.subtitle}>This week's schedule</Text>
        </View>

        {/* Today hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroDate}>Today, Feb 22</Text>
            <Text style={styles.heroJobs}>{JOBS.filter(j => j.day === 'Today').length} jobs scheduled</Text>
          </View>
          <View style={styles.heroRight}>
            <Text style={styles.heroEarnings}>${todayEarnings}</Text>
            <Text style={styles.heroEarningsLabel}>Today's pay</Text>
          </View>
        </View>

        {/* Type filter */}
        <View style={styles.filterRow}>
          {TYPE_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, typeFilter === f && styles.filterBtnActive]}
              onPress={() => setTypeFilter(f)}
            >
              <Text style={[styles.filterBtnText, typeFilter === f && styles.filterBtnTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
          {STATUS_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.statusPill, statusFilter === f && styles.statusPillActive]}
              onPress={() => setStatusFilter(f)}
            >
              <Text style={[styles.statusPillText, statusFilter === f && styles.statusPillTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grouped job list */}
        {grouped(filtered).map(([day, dayJobs]) => (
          <View key={day}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{day}</Text>
              <Text style={styles.dayCount}>{dayJobs.length} job{dayJobs.length !== 1 ? 's' : ''}</Text>
            </View>
            {dayJobs.map(job => {
              const sc = STATUS_CONFIG[job.status];
              return (
                <View key={job.id} style={[styles.jobCard, { borderLeftColor: sc.border }]}>
                  <View style={styles.jobTop}>
                    <View style={styles.jobLeft}>
                      <View style={styles.jobTimeRow}>
                        <Text style={styles.jobTime}>{job.time}</Text>
                        {job.priority === 'urgent' && <Text style={styles.urgentBadge}>🔴 URGENT</Text>}
                      </View>
                      <Text style={styles.jobCustomer}>{job.customer}</Text>
                      <Text style={styles.jobType}>{job.type} · {job.duration}</Text>
                      <Text style={styles.jobAddress}>📍 {job.address} · {job.distance}</Text>
                    </View>
                    <View style={styles.jobRight}>
                      <Text style={styles.jobPay}>${job.pay}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                      </View>
                    </View>
                  </View>
                  {(job.status === 'upcoming' || job.status === 'in-progress') && (
                    <View style={styles.jobActions}>
                      <TouchableOpacity style={styles.navBtn}>
                        <Text style={styles.navBtnText}>🗺 Navigate</Text>
                      </TouchableOpacity>
                      {job.status === 'in-progress' && (
                        <TouchableOpacity style={styles.completeBtn}>
                          <Text style={styles.completeBtnText}>✓ Mark Complete</Text>
                        </TouchableOpacity>
                      )}
                      {job.status === 'upcoming' && (
                        <TouchableOpacity style={styles.startBtn}>
                          <Text style={styles.startBtnText}>▶ Start Job</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4FF' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },

  heroCard: { backgroundColor: '#4F46E5', borderRadius: 20, padding: 18, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLeft: {},
  heroDate: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  heroJobs: { fontSize: 18, fontWeight: '800', color: '#FFF', marginTop: 4 },
  heroRight: { alignItems: 'flex-end' },
  heroEarnings: { fontSize: 30, fontWeight: '900', color: '#FFF' },
  heroEarningsLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filterBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#E0E7FF' },
  filterBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  filterBtnText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  filterBtnTextActive: { color: '#FFF' },

  statusScroll: { marginBottom: 16 },
  statusPill: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1.5, borderColor: '#E0E7FF' },
  statusPillActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  statusPillText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  statusPillTextActive: { color: '#4F46E5' },

  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, marginTop: 4 },
  dayLabel: { fontSize: 14, fontWeight: '800', color: '#1E1B4B' },
  dayCount: { fontSize: 12, color: '#64748B' },

  jobCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E0E7FF', borderLeftWidth: 3, gap: 10 },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  jobLeft: { flex: 1, gap: 3 },
  jobTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  jobTime: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  urgentBadge: { fontSize: 10, fontWeight: '800', color: '#DC2626' },
  jobCustomer: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  jobType: { fontSize: 12, color: '#4F46E5', fontWeight: '600' },
  jobAddress: { fontSize: 11, color: '#94A3B8' },
  jobRight: { alignItems: 'flex-end', gap: 6 },
  jobPay: { fontSize: 20, fontWeight: '900', color: '#1E1B4B' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  jobActions: { flexDirection: 'row', gap: 8 },
  navBtn: { flex: 1, backgroundColor: '#EEF2FF', borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: '#C7D2FE' },
  navBtnText: { fontSize: 12, color: '#4F46E5', fontWeight: '700' },
  startBtn: { flex: 1, backgroundColor: '#4F46E5', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  startBtnText: { fontSize: 12, color: '#FFF', fontWeight: '700' },
  completeBtn: { flex: 1, backgroundColor: '#ECFDF5', borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0' },
  completeBtnText: { fontSize: 12, color: '#065F46', fontWeight: '700' },
});
