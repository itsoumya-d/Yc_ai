'use server';

import { createClient } from '@/lib/supabase/server';
import type { FraudPatternType, Entity, EntityRelationship } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export interface FraudSummaryItem {
  type: FraudPatternType;
  count: number;
  total_amount: number;
  avg_confidence: number;
}

export interface EntityNetworkNode {
  id: string;
  label: string;
  type: Entity['entity_type'];
  connections: number;
  flagged: boolean;
}

export async function getFraudSummary(): Promise<ActionResult<FraudSummaryItem[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('fraud_patterns')
    .select('pattern_type, confidence, affected_amount')
    .eq('false_positive', false);

  if (error) return { error: error.message };
  if (!data || data.length === 0) return { data: [] };

  // Aggregate by pattern type
  const groups = new Map<FraudPatternType, { count: number; total_amount: number; confidence_sum: number }>();

  for (const row of data) {
    const existing = groups.get(row.pattern_type as FraudPatternType);
    if (existing) {
      existing.count += 1;
      existing.total_amount += row.affected_amount || 0;
      existing.confidence_sum += row.confidence || 0;
    } else {
      groups.set(row.pattern_type as FraudPatternType, {
        count: 1,
        total_amount: row.affected_amount || 0,
        confidence_sum: row.confidence || 0,
      });
    }
  }

  const result: FraudSummaryItem[] = Array.from(groups.entries())
    .map(([type, agg]) => ({
      type,
      count: agg.count,
      total_amount: agg.total_amount,
      avg_confidence: agg.confidence_sum / agg.count,
    }))
    .sort((a, b) => b.total_amount - a.total_amount);

  return { data: result };
}

export async function getEntityNetwork(): Promise<ActionResult<EntityNetworkNode[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get top entities by mention count
  const { data: entities, error } = await supabase
    .from('entities')
    .select('id, name, entity_type, mention_count, confidence')
    .order('mention_count', { ascending: false })
    .limit(20);

  if (error) return { error: error.message };
  if (!entities || entities.length === 0) return { data: [] };

  // Get relationship counts per entity
  const entityIds = entities.map((e) => e.id);
  const { data: rels } = await supabase
    .from('entity_relationships')
    .select('source_entity_id, target_entity_id')
    .or(`source_entity_id.in.(${entityIds.join(',')}),target_entity_id.in.(${entityIds.join(',')})`);

  const connectionCounts = new Map<string, number>();
  for (const r of rels || []) {
    connectionCounts.set(r.source_entity_id, (connectionCounts.get(r.source_entity_id) || 0) + 1);
    connectionCounts.set(r.target_entity_id, (connectionCounts.get(r.target_entity_id) || 0) + 1);
  }

  const nodes: EntityNetworkNode[] = entities.map((e) => ({
    id: e.id,
    label: e.name,
    type: e.entity_type as Entity['entity_type'],
    connections: connectionCounts.get(e.id) || 0,
    flagged: (e.confidence || 0) > 0.8,
  }));

  return { data: nodes };
}
