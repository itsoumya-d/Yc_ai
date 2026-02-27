import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { MapPin, Camera, Clock } from 'lucide-react-native';
import type { Inspection } from '@/types';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { formatCostRange } from '@/lib/actions/damage';

interface InspectionCardProps {
  inspection: Inspection;
  onPress?: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    residential: 'Residential',
    commercial: 'Commercial',
    industrial: 'Industrial',
    vehicle: 'Vehicle',
    other: 'Other',
  };
  return labels[type] ?? type;
}

export function InspectionCard({ inspection, onPress }: InspectionCardProps) {
  const firstPhoto = inspection.photos[0];
  const statusLabel = inspection.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <View style={styles.content}>
        {/* Left: Photo or placeholder */}
        <View style={styles.photoContainer}>
          {firstPhoto?.uri ? (
            <Image source={{ uri: firstPhoto.uri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Camera size={20} color="#52525b" />
            </View>
          )}
        </View>

        {/* Right: Info */}
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.propertyName} numberOfLines={1}>
              {inspection.property.name}
            </Text>
            <Badge
              label={statusLabel}
              variant={getStatusBadgeVariant(inspection.status)}
            />
          </View>

          <View style={styles.metaRow}>
            <MapPin size={12} color="#71717a" />
            <Text style={styles.metaText} numberOfLines={1}>
              {inspection.property.address}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Camera size={12} color="#71717a" />
              <Text style={styles.statText}>{inspection.photos.length} photos</Text>
            </View>
            <View style={styles.stat}>
              <Clock size={12} color="#71717a" />
              <Text style={styles.statText}>{formatDate(inspection.created_at)}</Text>
            </View>
          </View>

          {inspection.total_estimate_min > 0 && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Est. Damage: </Text>
              <Text style={styles.costValue}>
                {formatCostRange(inspection.total_estimate_min, inspection.total_estimate_max)}
              </Text>
            </View>
          )}

          <View style={styles.tagsRow}>
            <View style={styles.typeTag}>
              <Text style={styles.typeTagText}>{getPropertyTypeLabel(inspection.property.type)}</Text>
            </View>
            {inspection.damage_items.length > 0 && (
              <View style={styles.damageTag}>
                <Text style={styles.damageTagText}>{inspection.damage_items.length} damage item{inspection.damage_items.length !== 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
  },
  photoContainer: {
    width: 90,
    height: 110,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  propertyName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    color: '#71717a',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#71717a',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 12,
    color: '#71717a',
  },
  costValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  typeTag: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeTagText: {
    fontSize: 10,
    color: '#a1a1aa',
  },
  damageTag: {
    backgroundColor: '#2d1515',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  damageTagText: {
    fontSize: 10,
    color: '#fca5a5',
  },
});
