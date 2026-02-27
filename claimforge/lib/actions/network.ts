'use server';

import { createClient } from '@/lib/supabase/server';
import type { NetworkNode, NetworkEdge, EntityType } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function getNetworkData(
  caseId?: string,
): Promise<ActionResult<{ nodes: NetworkNode[]; edges: NetworkEdge[] }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Fetch top entities by mention count
  let entityQuery = supabase
    .from('entities')
    .select('id, name, entity_type, confidence, mention_count, document_id, case_id')
    .order('mention_count', { ascending: false })
    .limit(45);

  if (caseId) entityQuery = entityQuery.eq('case_id', caseId);

  const { data: entities, error: entError } = await entityQuery;
  if (entError) return { error: entError.message };
  if (!entities?.length) return { data: { nodes: [], edges: [] } };

  const nodes: NetworkNode[] = entities.map(e => ({
    id: e.id,
    label: e.name,
    type: e.entity_type as EntityType,
    // Larger size for entities with more mentions
    size: Math.max(14, Math.min(30, 14 + Math.round((e.mention_count ?? 0) * 1.5))),
    // Flag high-confidence entities (AI is very sure they're relevant to fraud)
    flagged: (e.confidence ?? 0) >= 0.9,
  }));

  const entityIds = entities.map(e => e.id);

  // Try entity_relationships table first
  let edges: NetworkEdge[] = [];
  const { data: relationships } = await supabase
    .from('entity_relationships')
    .select('id, source_entity_id, target_entity_id, relationship_type, strength')
    .in('source_entity_id', entityIds)
    .in('target_entity_id', entityIds)
    .limit(80);

  if (relationships?.length) {
    edges = relationships.map(r => ({
      id: r.id,
      source: r.source_entity_id,
      target: r.target_entity_id,
      label: r.relationship_type ?? '',
      strength: r.strength ?? 0.5,
    }));
  } else {
    // Fallback: co-occurrence — entities that appear in the same document
    const docMap: Record<string, string[]> = {};
    for (const e of entities) {
      if (!e.document_id) continue;
      if (!docMap[e.document_id]) docMap[e.document_id] = [];
      docMap[e.document_id].push(e.id);
    }

    const seen = new Set<string>();
    for (const group of Object.values(docMap)) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const key = [group[i], group[j]].sort().join('::');
          if (seen.has(key)) continue;
          seen.add(key);
          edges.push({
            id: key,
            source: group[i],
            target: group[j],
            label: 'co-occurs',
            strength: 0.5,
          });
        }
      }
    }
  }

  return { data: { nodes, edges } };
}
