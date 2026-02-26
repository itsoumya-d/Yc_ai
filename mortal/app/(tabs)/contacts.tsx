import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

type Contact = {
  id: string;
  name: string;
  role: string;
  roleType: 'legal' | 'medical' | 'financial' | 'personal';
  phone: string;
  email: string;
  firm?: string;
  notes: string;
  hasAccess: string[];
  priority: number;
};

const CONTACTS: Contact[] = [
  { id: '1', name: 'Sarah Mitchell', role: 'Executor & Spouse', roleType: 'legal', phone: '+1 (503) 555-0142', email: 'sarah.mitchell@email.com', notes: 'Primary executor. Full access to all accounts and vault. Co-owner of property.', hasAccess: ['All Assets', 'Vault', 'Contacts'], priority: 1 },
  { id: '2', name: 'James R. Whitfield', role: 'Estate Attorney', roleType: 'legal', phone: '+1 (503) 555-0198', email: 'jwhitfield@whitfieldlaw.com', firm: 'Whitfield & Associates', notes: 'Holds original will and trust documents. Contact immediately upon passing.', hasAccess: ['Will', 'Trust Docs'], priority: 2 },
  { id: '3', name: 'Dr. Priya Nair', role: 'Healthcare Proxy', roleType: 'medical', phone: '+1 (503) 555-0203', email: 'pnair@ohsuhealth.org', firm: 'OHSU Medical', notes: 'Authorized to make medical decisions per POLST and advance directive on file.', hasAccess: ['Medical Records', 'POLST'], priority: 3 },
  { id: '4', name: 'Michael Chen', role: 'Financial Advisor', roleType: 'financial', phone: '+1 (503) 555-0167', email: 'm.chen@edwardjones.com', firm: 'Edward Jones', notes: 'Manages investment accounts. Vanguard, brokerage. Contact for portfolio transfer.', hasAccess: ['Investment Accounts'], priority: 4 },
  { id: '5', name: 'Emma & Lucas Mitchell', role: 'Children / Beneficiaries', roleType: 'personal', phone: '+1 (503) 555-0119', email: 'emma.m@email.com', notes: 'Primary beneficiaries per will. Trust distributes at ages 25 and 30.', hasAccess: ['Trust Schedule', 'Personal Items'], priority: 5 },
  { id: '6', name: 'Robert Torres', role: 'Digital Executor', roleType: 'legal', phone: '+1 (503) 555-0088', email: 'rtorres@email.com', notes: 'Designated for social media, email, and digital account closure. Tech-savvy.', hasAccess: ['Digital Assets', 'Social Accounts'], priority: 6 },
];

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  legal: { bg: '#1C1410', text: '#D97706', border: '#292010' },
  medical: { bg: '#0F1A14', text: '#4ADE80', border: '#132010' },
  financial: { bg: '#0F1220', text: '#60A5FA', border: '#131828' },
  personal: { bg: '#1A1010', text: '#F87171', border: '#281414' },
};

const PRIORITY_LABELS: Record<number, string> = { 1: '1st Contact', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th' };

export default function ContactsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Trusted Contacts</Text>
          <Text style={styles.subtitle}>People who carry out your wishes</Text>
        </View>

        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.alertText}>
            These contacts have been notified of their roles. Keep information up to date.
          </Text>
        </View>

        {CONTACTS.map(contact => {
          const rc = ROLE_COLORS[contact.roleType];
          return (
            <View key={contact.id} style={[styles.contactCard, { borderColor: rc.border }]}>
              <View style={styles.contactTop}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>
                    {contact.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <View style={styles.contactNameRow}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPriority}>{PRIORITY_LABELS[contact.priority]}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: rc.bg }]}>
                    <Text style={[styles.roleText, { color: rc.text }]}>{contact.role}</Text>
                  </View>
                  {contact.firm && <Text style={styles.contactFirm}>{contact.firm}</Text>}
                </View>
              </View>

              <View style={styles.contactDetails}>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
                <Text style={styles.contactEmail}>{contact.email}</Text>
              </View>

              <Text style={styles.contactNotes}>{contact.notes}</Text>

              <View style={styles.accessRow}>
                <Text style={styles.accessLabel}>Has access to: </Text>
                <Text style={styles.accessList}>{contact.hasAccess.join(' · ')}</Text>
              </View>

              <View style={styles.contactActions}>
                <TouchableOpacity style={styles.contactBtn}>
                  <Text style={styles.contactBtnText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn}>
                  <Text style={styles.contactBtnText}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.contactBtn, styles.contactBtnPrimary]}>
                  <Text style={[styles.contactBtnText, styles.contactBtnPrimaryText]}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Trusted Contact</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0A09' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#F5F5F4', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#78716C', marginTop: 2 },
  alertBanner: { backgroundColor: '#1C1310', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: '#292010' },
  alertIcon: { fontSize: 16 },
  alertText: { flex: 1, fontSize: 12, color: '#A8A29E', lineHeight: 17 },
  contactCard: { backgroundColor: '#1C1917', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  contactTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#292524', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 16, fontWeight: '800', color: '#D97706' },
  contactInfo: { flex: 1 },
  contactNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  contactName: { fontSize: 15, fontWeight: '800', color: '#F5F5F4' },
  contactPriority: { fontSize: 10, color: '#78716C', fontWeight: '600' },
  roleBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  roleText: { fontSize: 11, fontWeight: '700' },
  contactFirm: { fontSize: 11, color: '#78716C' },
  contactDetails: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#292524' },
  contactPhone: { fontSize: 13, color: '#A8A29E', marginBottom: 2 },
  contactEmail: { fontSize: 13, color: '#A8A29E' },
  contactNotes: { fontSize: 13, color: '#78716C', lineHeight: 18, marginBottom: 10 },
  accessRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  accessLabel: { fontSize: 11, color: '#57534E' },
  accessList: { fontSize: 11, color: '#D97706', flex: 1 },
  contactActions: { flexDirection: 'row', gap: 8 },
  contactBtn: { flex: 1, backgroundColor: '#292524', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#3C3833' },
  contactBtnText: { color: '#A8A29E', fontSize: 13, fontWeight: '600' },
  contactBtnPrimary: { backgroundColor: '#D97706', borderColor: '#D97706' },
  contactBtnPrimaryText: { color: '#0C0A09' },
  addBtn: { backgroundColor: '#1C1917', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#D97706', borderStyle: 'dashed', marginTop: 4 },
  addBtnText: { color: '#D97706', fontWeight: '700', fontSize: 14 },
});
