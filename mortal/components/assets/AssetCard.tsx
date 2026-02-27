import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Badge } from '../ui/Badge';
import type { DigitalAsset } from '../../types';

interface AssetCardProps {
  asset: DigitalAsset;
  onPress?: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  social_media: '📱',
  financial: '💰',
  email: '📧',
  crypto: '🔑',
  other: '📦',
};

const DISPOSITION_BADGE: Record<string, { label: string; variant: 'purple' | 'success' | 'warning' | 'danger' | 'neutral' | 'info' }> = {
  memorialize: { label: 'Memorialize', variant: 'info' },
  delete: { label: 'Delete', variant: 'danger' },
  transfer: { label: 'Transfer', variant: 'success' },
  download: { label: 'Download first', variant: 'warning' },
};

export function AssetCard({ asset, onPress }: AssetCardProps) {
  const icon = CATEGORY_ICONS[asset.category || asset.asset_type || 'other'] || '📦';
  const dispositionInfo = DISPOSITION_BADGE[asset.disposition] || { label: asset.disposition, variant: 'neutral' as const };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{asset.name || asset.platform || asset.account_name}</Text>
        {(asset.username || asset.account_name) && (
          <Text style={styles.username}>{asset.username || asset.account_name}</Text>
        )}
      </View>
      <Badge label={dispositionInfo.label} variant={dispositionInfo.variant} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1030',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2d1b4e',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d1b4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  username: { fontSize: 12, color: '#a78bfa', marginTop: 2 },
});
