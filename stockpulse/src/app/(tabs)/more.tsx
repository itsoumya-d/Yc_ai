import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useInventoryStore } from '@/stores/inventory';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingRow {
  icon: IoniconsName;
  iconColor: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingItem({ icon, iconColor, label, sublabel, onPress, rightElement }: SettingRow) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sublabel && <Text style={styles.settingSublabel}>{sublabel}</Text>}
      </View>
      {rightElement ?? (
        onPress ? <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} /> : null
      )}
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { products, scanHistory, organization, location, clearScanHistory } = useInventoryStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoReorderEnabled, setAutoReorderEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const inventoryValue = products.reduce(
    (sum, p) => sum + (p.costPerUnit ?? 0) * p.currentStock,
    0
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Business card */}
        <View style={styles.businessCard}>
          <View style={styles.businessIconCircle}>
            <Ionicons name="storefront" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{organization?.name ?? 'My Organization'}</Text>
            <Text style={styles.businessLocation}>{location?.name ?? 'Main Location'}</Text>
            <Text style={styles.businessType}>
              {organization?.businessType ?? 'restaurant'} · B2B
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{scanHistory.length}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${inventoryValue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Inv. Value</Text>
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.section}>
          <SettingItem
            icon="notifications-outline"
            iconColor={COLORS.primary}
            label="Push Notifications"
            sublabel="Low stock and critical alerts"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.borderLight, true: COLORS.primaryLight }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textMuted}
              />
            }
          />
          <SettingItem
            icon="refresh-circle-outline"
            iconColor={COLORS.warning}
            label="Auto-Reorder Suggestions"
            sublabel="AI-powered ordering recommendations"
            rightElement={
              <Switch
                value={autoReorderEnabled}
                onValueChange={setAutoReorderEnabled}
                trackColor={{ false: COLORS.borderLight, true: COLORS.primaryLight }}
                thumbColor={autoReorderEnabled ? COLORS.primary : COLORS.textMuted}
              />
            }
          />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <SettingItem
            icon="moon-outline"
            iconColor="#6366F1"
            label="Dark Mode"
            sublabel="Coming soon"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={() => Alert.alert('Coming Soon', 'Dark mode will be available in the next update.')}
                trackColor={{ false: COLORS.borderLight, true: COLORS.primaryLight }}
                thumbColor={darkMode ? COLORS.primary : COLORS.textMuted}
                disabled
              />
            }
          />
          <SettingItem
            icon="language-outline"
            iconColor={COLORS.success}
            label="Language"
            sublabel="English (US)"
            onPress={() => Alert.alert('Language', 'Language settings coming soon.')}
          />
          <SettingItem
            icon="cash-outline"
            iconColor={COLORS.warning}
            label="Currency"
            sublabel="USD ($)"
            onPress={() => Alert.alert('Currency', 'Currency settings coming soon.')}
          />
        </View>

        {/* Data */}
        <Text style={styles.sectionTitle}>Data & Integrations</Text>
        <View style={styles.section}>
          <SettingItem
            icon="cloud-upload-outline"
            iconColor={COLORS.primary}
            label="Export Inventory"
            sublabel="Download as CSV or Excel"
            onPress={() => Alert.alert('Export', 'Export feature coming soon.')}
          />
          <SettingItem
            icon="qr-code-outline"
            iconColor="#8B5CF6"
            label="Barcode Labels"
            sublabel="Print SKU labels for products"
            onPress={() => Alert.alert('Labels', 'Label printing coming soon.')}
          />
          <SettingItem
            icon="git-merge-outline"
            iconColor="#F59E0B"
            label="POS Integration"
            sublabel="Connect Square, Clover, or Toast"
            onPress={() => Alert.alert('POS Integration', 'POS integrations coming soon.')}
          />
          <SettingItem
            icon="trash-outline"
            iconColor={COLORS.error}
            label="Clear Scan History"
            onPress={() =>
              Alert.alert('Clear History', 'Delete all scan history?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearScanHistory },
              ])
            }
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <SettingItem
            icon="person-outline"
            iconColor={COLORS.primary}
            label="Profile Settings"
            onPress={() => Alert.alert('Profile', 'Profile settings coming soon.')}
          />
          <SettingItem
            icon="business-outline"
            iconColor={COLORS.primaryDark}
            label="Organization Settings"
            onPress={() => Alert.alert('Organization', 'Organization settings coming soon.')}
          />
          <SettingItem
            icon="card-outline"
            iconColor="#10B981"
            label="Billing & Subscription"
            sublabel="Pro Plan · $49/mo"
            onPress={() => Alert.alert('Billing', 'Billing portal coming soon.')}
          />
          <SettingItem
            icon="help-circle-outline"
            iconColor={COLORS.textSecondary}
            label="Help & Support"
            onPress={() => Alert.alert('Support', 'support@stockpulse.app')}
          />
          <SettingItem
            icon="log-out-outline"
            iconColor={COLORS.error}
            label="Sign Out"
            onPress={() =>
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: () => {} },
              ])
            }
          />
        </View>

        <Text style={styles.version}>StockPulse v1.0.0 · Built with Expo SDK 52</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },

  scrollContent: { padding: SPACING.lg },

  businessCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  businessIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  businessInfo: { flex: 1 },
  businessName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  businessLocation: { fontSize: 13, color: COLORS.primaryLight, marginTop: 1 },
  businessType: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2, textTransform: 'capitalize' },

  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    alignItems: 'center', ...SHADOWS.sm,
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },

  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: COLORS.textSecondary,
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: SPACING.sm, marginTop: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 1, borderColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  settingSublabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },

  version: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: SPACING.lg },
});
