import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, DollarSign, Clock } from 'lucide-react-native';
import type { DamageItem as DamageItemType } from '@/types';
import { Badge, getSeverityBadgeVariant, getUrgencyBadgeVariant } from '@/components/ui/Badge';
import { getDamageTypeLabel, getUrgencyLabel, formatCostRange } from '@/lib/actions/damage';

interface DamageItemProps {
  item: DamageItemType;
  onPress?: () => void;
  showPhoto?: boolean;
}

export function DamageItemCard({ item, onPress, showPhoto = true }: DamageItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      style={styles.container}
    >
      {/* Severity accent bar */}
      <View style={[styles.accentBar, getSeverityAccentStyle(item.severity)]} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AlertTriangle size={14} color={getSeverityIconColor(item.severity)} />
            <Text style={styles.component}>{item.component}</Text>
          </View>
          <Badge
            label={item.severity.replace('_', ' ')}
            variant={getSeverityBadgeVariant(item.severity)}
          />
        </View>

        {/* Type and Description */}
        <Text style={styles.damageType}>{getDamageTypeLabel(item.damage_type)}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        {/* Photo if available */}
        {showPhoto && item.photo_url && (
          <Image
            source={{ uri: item.photo_url }}
            style={styles.photo}
            resizeMode="cover"
          />
        )}

        {/* Footer: cost and urgency */}
        <View style={styles.footer}>
          <View style={styles.costRow}>
            <DollarSign size={12} color="#dc2626" />
            <Text style={styles.costText}>
              {formatCostRange(item.estimated_cost_min, item.estimated_cost_max)}
            </Text>
          </View>
          <View style={styles.urgencyRow}>
            <Clock size={12} color="#71717a" />
            <Text style={styles.urgencyText}>{getUrgencyLabel(item.urgency)}</Text>
          </View>
        </View>

        <View style={styles.urgencyBadgeRow}>
          <Badge
            label={getUrgencyLabel(item.urgency)}
            variant={getUrgencyBadgeVariant(item.urgency)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getSeverityAccentStyle(severity: string) {
  const colors: Record<string, string> = {
    minor: '#16a34a',
    moderate: '#d97706',
    severe: '#ea580c',
    total_loss: '#dc2626',
  };
  return { backgroundColor: colors[severity] ?? '#52525b' };
}

function getSeverityIconColor(severity: string): string {
  const colors: Record<string, string> = {
    minor: '#16a34a',
    moderate: '#d97706',
    severe: '#ea580c',
    total_loss: '#dc2626',
  };
  return colors[severity] ?? '#52525b';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 8,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  component: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  damageType: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: '#a1a1aa',
    lineHeight: 18,
  },
  photo: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
  },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgencyText: {
    fontSize: 12,
    color: '#71717a',
  },
  urgencyBadgeRow: {
    flexDirection: 'row',
  },
});
