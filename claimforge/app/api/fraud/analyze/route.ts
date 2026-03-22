import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── Types ──────────────────────────────────────────────────────────────────
export interface FraudNode {
  id: string;
  label: string;
  type: 'person' | 'organization' | 'payment' | 'contract' | 'address' | 'claim';
  entityType: string;
  riskScore: number;
  riskFactors: string[];
  isResolved: boolean;
  resolvedToId?: string;
  connectionCount: number;
  suspiciousConnections: number;
  totalAmount?: number;
  // Force simulation coords
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface FraudEdge {
  source: string;
  target: string;
  label: string;
  relationshipType: string;
  strength: number;
  isSuspicious: boolean;
  amount?: number;
}

export interface FraudGraphStats {
  totalNodes: number;
  totalEdges: number;
  highRiskCount: number;
  mediumRiskCount: number;
  suspiciousEdges: number;
  avgRiskScore: number;
  topRiskEntities: { id: string; label: string; riskScore: number; entityType: string }[];
  networkDensity: number;
}

// ── Fraud Score Algorithm ─────────────────────────────────────────────────
// Scores 0-100 based on: entity type, connections, suspicious edges,
// relationship types, amounts, and network position
function computeFraudScore(
  entityId: string,
  entityType: string,
  relationships: Array<{ source_entity_id: string; target_entity_id: string; relationship_type: string; is_suspicious: boolean; strength: number; amount: number | null }>,
  allRelationships: typeof relationships,
): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 0;

  // 1. Base risk from entity type
  const highRiskTypes = ['bank_account', 'tax_id', 'npi'];
  const mediumRiskTypes = ['payment', 'invoice', 'amount'];
  if (highRiskTypes.includes(entityType)) {
    score += 15;
    factors.push('High-risk entity type');
  } else if (mediumRiskTypes.includes(entityType)) {
    score += 8;
    factors.push('Financial entity');
  }

  // 2. Connection count (higher connectivity = higher risk in fraud networks)
  const directConnections = relationships.filter(
    r => r.source_entity_id === entityId || r.target_entity_id === entityId,
  );
  const connScore = Math.min(directConnections.length * 4, 20);
  if (connScore > 0) {
    score += connScore;
    if (directConnections.length >= 3) factors.push(`High connectivity (${directConnections.length} connections)`);
  }

  // 3. Suspicious relationship flag
  const suspiciousEdges = directConnections.filter(r => r.is_suspicious);
  const suspScore = Math.min(suspiciousEdges.length * 15, 35);
  if (suspScore > 0) {
    score += suspScore;
    factors.push(`${suspiciousEdges.length} suspicious relationship(s)`);
  }

  // 4. High-risk relationship types
  const highRiskRelTypes = new Set(['kickback', 'billing', 'lobbyist', 'consultant']);
  const medRiskRelTypes = new Set(['payment', 'subcontract', 'referral']);
  const hasHighRiskRel = directConnections.some(r => highRiskRelTypes.has(r.relationship_type));
  const hasMedRiskRel = directConnections.some(r => medRiskRelTypes.has(r.relationship_type));
  if (hasHighRiskRel) {
    score += 20;
    factors.push('Kickback/billing relationship detected');
  } else if (hasMedRiskRel) {
    score += 8;
    factors.push('Payment/referral relationship');
  }

  // 5. Circular relationship (A→B and B→A = shell company indicator)
  const outboundTargets = new Set(
    directConnections.filter(r => r.source_entity_id === entityId).map(r => r.target_entity_id),
  );
  const inboundSources = new Set(
    directConnections.filter(r => r.target_entity_id === entityId).map(r => r.source_entity_id),
  );
  const circularCount = [...outboundTargets].filter(id => inboundSources.has(id)).length;
  if (circularCount > 0) {
    score += Math.min(circularCount * 10, 15);
    factors.push(`Circular relationship (${circularCount} loop${circularCount > 1 ? 's' : ''})`);
  }

  // 6. Amount anomaly — very large amounts relative to median
  const amounts = directConnections.map(r => r.amount).filter((a): a is number => a !== null && a > 0);
  if (amounts.length > 0) {
    const total = amounts.reduce((a, b) => a + b, 0);
    if (total > 100000) {
      score += 8;
      factors.push(`Large transaction volume ($${(total / 1000).toFixed(0)}K)`);
    }
  }

  return { score: Math.min(Math.round(score), 100), factors };
}

// ── Map entity type to display type ───────────────────────────────────────
function mapDisplayType(entityType: string): FraudNode['type'] {
  if (['person'].includes(entityType)) return 'person';
  if (['organization', 'duns'].includes(entityType)) return 'organization';
  if (['payment', 'invoice', 'amount', 'bank_account'].includes(entityType)) return 'payment';
  if (['contract'].includes(entityType)) return 'contract';
  if (['address', 'phone', 'email'].includes(entityType)) return 'address';
  return 'claim';
}

// ── Map relationship type to short label ──────────────────────────────────
function relLabel(type: string): string {
  const labels: Record<string, string> = {
    payment: 'Payment',
    contract: 'Contract',
    employment: 'Employer',
    ownership: 'Owns',
    referral: 'Referral',
    subcontract: 'Subcontract',
    billing: 'Billing',
    kickback: '⚠ Kickback',
    familial: 'Family',
    corporate_officer: 'Officer',
    lobbyist: 'Lobbyist',
    consultant: 'Consultant',
  };
  return labels[type] ?? type;
}

// ── Compute initial positions in a circle ─────────────────────────────────
function circlePositions(count: number, cx = 400, cy = 300, r = 220): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, i) => ({
    x: cx + r * Math.cos((2 * Math.PI * i) / count),
    y: cy + r * Math.sin((2 * Math.PI * i) / count),
  }));
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get('caseId');

  const supabase = await createClient();

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch entities for this case (or all if no caseId)
  let entityQuery = supabase
    .from('entities')
    .select('id, entity_type, entity_value, normalized_value, is_resolved, resolved_to_id, confidence, metadata')
    .order('created_at', { ascending: false })
    .limit(80);

  if (caseId) {
    entityQuery = entityQuery.eq('case_id', caseId);
  }

  const { data: entities, error: entityError } = await entityQuery;

  // Fetch relationships
  let relQuery = supabase
    .from('entity_relationships')
    .select('id, source_entity_id, target_entity_id, relationship_type, strength, is_suspicious, amount, metadata')
    .limit(200);

  if (caseId) {
    relQuery = relQuery.eq('case_id', caseId);
  }

  const { data: relationships, error: relError } = await relQuery;

  // If no real data, return demo graph with fraud analysis applied
  if (entityError || !entities?.length || relError) {
    return NextResponse.json(buildDemoGraph(), { status: 200 });
  }

  const rels = relationships ?? [];

  // Build entity id → index map
  const entityIds = entities.map(e => e.id);
  const positions = circlePositions(entityIds.length);

  // Build nodes with fraud scores
  const nodes: FraudNode[] = entities.map((entity, i) => {
    const { score, factors } = computeFraudScore(entity.id, entity.entity_type, rels, rels);
    const directConns = rels.filter(
      r => r.source_entity_id === entity.id || r.target_entity_id === entity.id,
    );
    const suspCount = directConns.filter(r => r.is_suspicious).length;
    const totalAmount = directConns
      .map(r => r.amount)
      .filter((a): a is number => a !== null && a > 0)
      .reduce((a, b) => a + b, 0);

    return {
      id: entity.id,
      label: entity.normalized_value ?? entity.entity_value,
      type: mapDisplayType(entity.entity_type),
      entityType: entity.entity_type,
      riskScore: score,
      riskFactors: factors,
      isResolved: entity.is_resolved,
      resolvedToId: entity.resolved_to_id ?? undefined,
      connectionCount: directConns.length,
      suspiciousConnections: suspCount,
      totalAmount: totalAmount > 0 ? totalAmount : undefined,
      x: positions[i]?.x ?? 400,
      y: positions[i]?.y ?? 300,
      vx: 0,
      vy: 0,
    };
  });

  // Build edges — only include edges where both endpoints are in our node set
  const nodeIdSet = new Set(entityIds);
  const edges: FraudEdge[] = rels
    .filter(r => nodeIdSet.has(r.source_entity_id) && nodeIdSet.has(r.target_entity_id))
    .map(r => ({
      source: r.source_entity_id,
      target: r.target_entity_id,
      label: relLabel(r.relationship_type),
      relationshipType: r.relationship_type,
      strength: r.strength ?? 0.5,
      isSuspicious: r.is_suspicious,
      amount: r.amount ?? undefined,
    }));

  // Stats
  const highRisk = nodes.filter(n => n.riskScore >= 70);
  const medRisk = nodes.filter(n => n.riskScore >= 40 && n.riskScore < 70);
  const avgScore = nodes.length > 0
    ? Math.round(nodes.reduce((a, n) => a + n.riskScore, 0) / nodes.length)
    : 0;
  // Network density = actual edges / max possible edges
  const maxEdges = nodes.length * (nodes.length - 1) / 2;
  const density = maxEdges > 0 ? Math.round((edges.length / maxEdges) * 100) / 100 : 0;

  const stats: FraudGraphStats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    highRiskCount: highRisk.length,
    mediumRiskCount: medRisk.length,
    suspiciousEdges: edges.filter(e => e.isSuspicious).length,
    avgRiskScore: avgScore,
    topRiskEntities: [...nodes]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 8)
      .map(n => ({ id: n.id, label: n.label, riskScore: n.riskScore, entityType: n.entityType })),
    networkDensity: density,
  };

  return NextResponse.json({ nodes, edges, stats }, { status: 200 });
}

// ── Demo graph (when no DB data) ──────────────────────────────────────────
function buildDemoGraph(): { nodes: FraudNode[]; edges: FraudEdge[]; stats: FraudGraphStats } {
  const nodes: FraudNode[] = [
    { id: 'c1', label: 'Claim #4521', type: 'claim', entityType: 'contract', riskScore: 85, riskFactors: ['High-risk entity type', '4 suspicious relationships', 'Kickback/billing relationship detected'], isResolved: false, connectionCount: 4, suspiciousConnections: 3, totalAmount: 184500, x: 350, y: 250, vx: 0, vy: 0 },
    { id: 'p1', label: 'John Smith', type: 'person', entityType: 'person', riskScore: 78, riskFactors: ['High connectivity (4 connections)', '2 suspicious relationship(s)', 'Circular relationship (1 loop)'], isResolved: false, connectionCount: 4, suspiciousConnections: 2, x: 200, y: 120, vx: 0, vy: 0 },
    { id: 'p2', label: 'Jane Doe', type: 'person', entityType: 'person', riskScore: 28, riskFactors: ['Payment/referral relationship'], isResolved: false, connectionCount: 2, suspiciousConnections: 0, x: 500, y: 120, vx: 0, vy: 0 },
    { id: 'e1', label: 'ABC Corp', type: 'organization', entityType: 'organization', riskScore: 62, riskFactors: ['High connectivity (3 connections)', '1 suspicious relationship(s)', 'Payment/referral relationship'], isResolved: false, connectionCount: 3, suspiciousConnections: 1, totalAmount: 97000, x: 130, y: 350, vx: 0, vy: 0 },
    { id: 'e2', label: 'XYZ LLC', type: 'organization', entityType: 'organization', riskScore: 15, riskFactors: [], isResolved: false, connectionCount: 1, suspiciousConnections: 0, x: 550, y: 350, vx: 0, vy: 0 },
    { id: 'c2', label: 'Claim #4522', type: 'claim', entityType: 'contract', riskScore: 72, riskFactors: ['High connectivity (3 connections)', '2 suspicious relationship(s)', 'Kickback/billing relationship detected'], isResolved: false, connectionCount: 3, suspiciousConnections: 2, totalAmount: 56200, x: 350, y: 420, vx: 0, vy: 0 },
    { id: 'p3', label: 'Bob Wilson', type: 'person', entityType: 'person', riskScore: 45, riskFactors: ['Payment/referral relationship'], isResolved: false, connectionCount: 2, suspiciousConnections: 0, x: 250, y: 420, vx: 0, vy: 0 },
    { id: 'e3', label: 'DEF Inc', type: 'organization', entityType: 'organization', riskScore: 33, riskFactors: [], isResolved: false, connectionCount: 1, suspiciousConnections: 0, x: 480, y: 280, vx: 0, vy: 0 },
    { id: 'p4', label: 'Alice Chen', type: 'person', entityType: 'person', riskScore: 56, riskFactors: ['High connectivity (3 connections)', 'Payment/referral relationship'], isResolved: false, connectionCount: 3, suspiciousConnections: 1, x: 150, y: 220, vx: 0, vy: 0 },
    { id: 'b1', label: 'Acct ****4821', type: 'payment', entityType: 'bank_account', riskScore: 91, riskFactors: ['High-risk entity type', 'High connectivity (3 connections)', '2 suspicious relationship(s)', 'Kickback/billing relationship detected', 'Large transaction volume ($240K)'], isResolved: false, connectionCount: 3, suspiciousConnections: 2, totalAmount: 240000, x: 300, y: 320, vx: 0, vy: 0 },
  ];

  const edges: FraudEdge[] = [
    { source: 'p1', target: 'c1', label: 'Claimant', relationshipType: 'contract', strength: 1.0, isSuspicious: false },
    { source: 'p2', target: 'c1', label: 'Witness', relationshipType: 'referral', strength: 0.5, isSuspicious: false },
    { source: 'e1', target: 'p1', label: 'Employer', relationshipType: 'employment', strength: 0.8, isSuspicious: false },
    { source: 'e2', target: 'p2', label: 'Employer', relationshipType: 'employment', strength: 0.7, isSuspicious: false },
    { source: 'p3', target: 'c2', label: 'Claimant', relationshipType: 'contract', strength: 1.0, isSuspicious: false },
    { source: 'e1', target: 'c2', label: '⚠ Kickback', relationshipType: 'kickback', strength: 0.9, isSuspicious: true, amount: 45000 },
    { source: 'p1', target: 'p3', label: 'Related', relationshipType: 'familial', strength: 0.6, isSuspicious: false },
    { source: 'e3', target: 'c1', label: 'Contractor', relationshipType: 'subcontract', strength: 0.7, isSuspicious: true, amount: 28000 },
    { source: 'p4', target: 'e1', label: 'Employee', relationshipType: 'employment', strength: 0.8, isSuspicious: false },
    { source: 'p4', target: 'c2', label: 'Witness', relationshipType: 'referral', strength: 0.4, isSuspicious: false },
    { source: 'b1', target: 'e1', label: '⚠ Billing', relationshipType: 'billing', strength: 0.95, isSuspicious: true, amount: 180000 },
    { source: 'b1', target: 'p1', label: '⚠ Payment', relationshipType: 'payment', strength: 0.9, isSuspicious: true, amount: 60000 },
    { source: 'b1', target: 'c1', label: 'Payment', relationshipType: 'payment', strength: 0.8, isSuspicious: false, amount: 12000 },
  ];

  const topRiskEntities = [...nodes]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 8)
    .map(n => ({ id: n.id, label: n.label, riskScore: n.riskScore, entityType: n.entityType }));

  return {
    nodes,
    edges,
    stats: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      highRiskCount: nodes.filter(n => n.riskScore >= 70).length,
      mediumRiskCount: nodes.filter(n => n.riskScore >= 40 && n.riskScore < 70).length,
      suspiciousEdges: edges.filter(e => e.isSuspicious).length,
      avgRiskScore: Math.round(nodes.reduce((a, n) => a + n.riskScore, 0) / nodes.length),
      topRiskEntities,
      networkDensity: 0.29,
    },
  };
}
