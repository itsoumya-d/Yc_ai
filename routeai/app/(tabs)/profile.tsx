import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch } from 'react-native';

const SKILLS = [
  { name: 'HVAC', level: 'Journeyman', certified: true, emoji: '❄️' },
  { name: 'Electrical', level: 'Apprentice', certified: true, emoji: '⚡' },
  { name: 'Plumbing', level: 'Journeyman', certified: false, emoji: '🔧' },
  { name: 'Appliance Repair', level: 'Certified', certified: true, emoji: '🍳' },
];

const SERVICE_AREAS = ['Portland Metro', 'Beaverton', 'Lake Oswego', 'Tigard', 'Hillsboro'];

const REVIEWS = [
  { name: 'Margaret W.', rating: 5, text: 'Fast, professional, fixed our HVAC same day. Highly recommend!', date: 'Feb 20' },
  { name: 'Tom B.', rating: 5, text: 'Thorough electrical inspection. Caught two code issues and explained everything clearly.', date: 'Feb 18' },
  { name: 'Green Valley Mgmt', rating: 4, text: 'Quick response on emergency plumbing call. Solid work.', date: 'Feb 10' },
];

const VEHICLE = { make: 'Ford', model: 'Transit', year: '2021', plate: 'GRX 4421', color: 'White' };

export default function RouteAIProfileScreen() {
  const [available, setAvailable] = useState(true);
  const [instantBook, setInstantBook] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const avgRating = 4.9;
  const totalJobs = 156;
  const monthsActive = 8;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Tech dashboard</Text>
        </View>

        {/* Profile hero */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>MR</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Marcus Rodriguez</Text>
              <Text style={styles.profileSub}>Multi-Trade Technician · Portland, OR</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStar}>⭐</Text>
                <Text style={styles.ratingVal}>{avgRating}</Text>
                <Text style={styles.ratingCount}>({totalJobs} jobs)</Text>
              </View>
            </View>
            <View style={[styles.availTag, { backgroundColor: available ? '#ECFDF5' : '#F1F5F9' }]}>
              <View style={[styles.availDot, { backgroundColor: available ? '#10B981' : '#94A3B8' }]} />
              <Text style={[styles.availText, { color: available ? '#065F46' : '#475569' }]}>
                {available ? 'Available' : 'Busy'}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{totalJobs}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{monthsActive}mo</Text>
              <Text style={styles.statLabel}>On Platform</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>97%</Text>
              <Text style={styles.statLabel}>On-Time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{avgRating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Availability toggle */}
        <View style={styles.togglesCard}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Available for Jobs</Text>
              <Text style={styles.toggleSub}>Show up in customer searches</Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ false: '#E0E7FF', true: '#4F46E5' }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.toggleRow, styles.toggleBorder]}>
            <View>
              <Text style={styles.toggleLabel}>Instant Book</Text>
              <Text style={styles.toggleSub}>Accept jobs automatically</Text>
            </View>
            <Switch
              value={instantBook}
              onValueChange={setInstantBook}
              trackColor={{ false: '#E0E7FF', true: '#4F46E5' }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.toggleRow, styles.toggleBorder]}>
            <View>
              <Text style={styles.toggleLabel}>Job notifications</Text>
              <Text style={styles.toggleSub}>New job alerts near you</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E0E7FF', true: '#4F46E5' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Skills & Certs */}
        <Text style={styles.sectionTitle}>Skills & Certifications</Text>
        <View style={styles.skillsGrid}>
          {SKILLS.map(skill => (
            <View key={skill.name} style={[styles.skillCard, skill.certified && styles.skillCardCertified]}>
              <Text style={styles.skillEmoji}>{skill.emoji}</Text>
              <Text style={styles.skillName}>{skill.name}</Text>
              <Text style={styles.skillLevel}>{skill.level}</Text>
              {skill.certified && <Text style={styles.certBadge}>✓ Certified</Text>}
            </View>
          ))}
        </View>

        {/* Vehicle */}
        <Text style={styles.sectionTitle}>Vehicle</Text>
        <View style={styles.vehicleCard}>
          <Text style={styles.vehicleEmoji}>🚐</Text>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleMain}>{VEHICLE.year} {VEHICLE.make} {VEHICLE.model}</Text>
            <Text style={styles.vehicleSub}>{VEHICLE.color} · {VEHICLE.plate}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Service areas */}
        <Text style={styles.sectionTitle}>Service Area</Text>
        <View style={styles.areaCard}>
          {SERVICE_AREAS.map(area => (
            <View key={area} style={styles.areaTag}>
              <Text style={styles.areaText}>📍 {area}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addAreaBtn}>
            <Text style={styles.addAreaText}>+ Add Area</Text>
          </TouchableOpacity>
        </View>

        {/* License number */}
        <Text style={styles.sectionTitle}>License & Compliance</Text>
        <View style={styles.licenseCard}>
          <View style={styles.licenseRow}>
            <Text style={styles.licenseLabel}>HVAC License</Text>
            <Text style={styles.licenseVal}>OR-HVAC-44812 · Exp Dec 2026</Text>
          </View>
          <View style={[styles.licenseRow, styles.licenseBorder]}>
            <Text style={styles.licenseLabel}>Electrician</Text>
            <Text style={styles.licenseVal}>OR-EL-22941 · Exp Aug 2025</Text>
          </View>
          <View style={[styles.licenseRow, styles.licenseBorder]}>
            <Text style={styles.licenseLabel}>Insurance</Text>
            <Text style={[styles.licenseVal, { color: '#10B981' }]}>✓ Active through Dec 2025</Text>
          </View>
        </View>

        {/* Recent reviews */}
        <Text style={styles.sectionTitle}>Recent Reviews</Text>
        {REVIEWS.map((r, i) => (
          <View key={i} style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <Text style={styles.reviewName}>{r.name}</Text>
              <View style={styles.reviewRatingRow}>
                {'⭐'.repeat(r.rating).split('').map((s, si) => (
                  <Text key={si} style={styles.reviewStar}>⭐</Text>
                ))}
                <Text style={styles.reviewDate}>{r.date}</Text>
              </View>
            </View>
            <Text style={styles.reviewText}>{r.text}</Text>
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 12 },

  profileCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#E0E7FF' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 17, fontWeight: '800', color: '#1E1B4B' },
  profileSub: { fontSize: 12, color: '#64748B' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingStar: { fontSize: 12 },
  ratingVal: { fontSize: 13, fontWeight: '800', color: '#1E1B4B' },
  ratingCount: { fontSize: 11, color: '#94A3B8' },
  availTag: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  availDot: { width: 7, height: 7, borderRadius: 4 },
  availText: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#E0E7FF', paddingTop: 14 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '900', color: '#4F46E5' },
  statLabel: { fontSize: 10, color: '#64748B', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E0E7FF' },

  togglesCard: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E0E7FF', overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  toggleBorder: { borderTopWidth: 1, borderTopColor: '#E0E7FF' },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: '#1E1B4B' },
  toggleSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  skillCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, width: '47.5%', alignItems: 'center', borderWidth: 1, borderColor: '#E0E7FF', gap: 4 },
  skillCardCertified: { borderColor: '#4F46E5', borderWidth: 1.5 },
  skillEmoji: { fontSize: 26 },
  skillName: { fontSize: 13, fontWeight: '700', color: '#1E1B4B' },
  skillLevel: { fontSize: 11, color: '#64748B' },
  certBadge: { fontSize: 11, color: '#4F46E5', fontWeight: '700', marginTop: 2 },

  vehicleCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E0E7FF' },
  vehicleEmoji: { fontSize: 36 },
  vehicleInfo: { flex: 1 },
  vehicleMain: { fontSize: 14, fontWeight: '700', color: '#1E1B4B' },
  vehicleSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  editBtn: { backgroundColor: '#EEF2FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnText: { fontSize: 12, color: '#4F46E5', fontWeight: '700' },

  areaCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderWidth: 1, borderColor: '#E0E7FF' },
  areaTag: { backgroundColor: '#EEF2FF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  areaText: { fontSize: 12, color: '#4338CA', fontWeight: '600' },
  addAreaBtn: { backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: '#4F46E5', borderStyle: 'dashed' },
  addAreaText: { fontSize: 12, color: '#4F46E5', fontWeight: '600' },

  licenseCard: { backgroundColor: '#FFF', borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: '#E0E7FF', overflow: 'hidden' },
  licenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  licenseBorder: { borderTopWidth: 1, borderTopColor: '#E0E7FF' },
  licenseLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  licenseVal: { fontSize: 12, color: '#1E1B4B', fontWeight: '600', flex: 1, textAlign: 'right' },

  reviewCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E0E7FF', gap: 6 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontSize: 13, fontWeight: '700', color: '#1E1B4B' },
  reviewRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reviewStar: { fontSize: 10 },
  reviewDate: { fontSize: 10, color: '#94A3B8', marginLeft: 6 },
  reviewText: { fontSize: 12, color: '#475569', lineHeight: 18 },
});
