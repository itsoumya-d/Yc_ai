'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  FileText,
  User,
  Building,
  DollarSign,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Link2,
  X,
} from 'lucide-react';
import type { Entity, FraudPattern, EntityRelationship } from '@/types/database';

interface EvidenceChainProps {
  entities: Entity[];
  patterns: FraudPattern[];
  relationships: EntityRelationship[];
  documentTitle?: string;
}

const entityIcons: Record<string, typeof User> = {
  person: User,
  organization: Building,
  payment: DollarSign,
  contract: FileText,
  location: MapPin,
  date: Calendar,
};

const entityColors: Record<string, string> = {
  person: 'text-blue-600 bg-blue-50',
  organization: 'text-purple-600 bg-purple-50',
  payment: 'text-green-600 bg-green-50',
  contract: 'text-amber-600 bg-amber-50',
  location: 'text-cyan-600 bg-cyan-50',
  date: 'text-gray-600 bg-gray-50',
};

export function EvidenceChain({ entities, patterns, relationships, documentTitle }: EvidenceChainProps) {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  if (entities.length === 0 && patterns.length === 0) {
    return (
      <div className="rounded-lg border border-border-default bg-bg-surface p-6 text-center">
        <Link2 className="mx-auto h-8 w-8 text-text-tertiary" />
        <p className="mt-2 text-sm text-text-secondary">No evidence chain data yet.</p>
        <p className="text-xs text-text-tertiary">Process documents to build evidence chains.</p>
      </div>
    );
  }

  // Find related entities for the selected entity
  const getRelated = (entityId: string) => {
    const related: string[] = [];
    relationships.forEach((r) => {
      if (r.source_entity_id === entityId) related.push(r.target_entity_id);
      if (r.target_entity_id === entityId) related.push(r.source_entity_id);
    });
    return related;
  };

  // Find patterns that involve a specific entity
  const getPatternsForEntity = (entityId: string) => {
    return patterns.filter((p) =>
      p.affected_entities?.includes(entityId)
    );
  };

  const selected = entities.find((e) => e.id === selectedEntity);
  const relatedIds = selectedEntity ? getRelated(selectedEntity) : [];
  const relatedEntities = entities.filter((e) => relatedIds.includes(e.id));
  const relatedPatterns = selectedEntity ? getPatternsForEntity(selectedEntity) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-text-primary">Evidence Chain</h3>
        {documentTitle && (
          <span className="text-xs text-text-tertiary">— {documentTitle}</span>
        )}
      </div>

      {/* Entity grid */}
      <div className="flex flex-wrap gap-2">
        {entities.slice(0, 30).map((entity) => {
          const Icon = entityIcons[entity.entity_type] || FileText;
          const colors = entityColors[entity.entity_type] || 'text-gray-600 bg-gray-50';
          const isSelected = entity.id === selectedEntity;
          const isRelated = relatedIds.includes(entity.id);

          return (
            <button
              key={entity.id}
              onClick={() => setSelectedEntity(isSelected ? null : entity.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
                isSelected
                  ? 'ring-2 ring-primary bg-primary-muted text-primary'
                  : isRelated
                    ? 'ring-1 ring-amber-400 bg-amber-50 text-amber-700'
                    : colors,
                'hover:shadow-sm cursor-pointer'
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="max-w-[120px] truncate">{entity.name}</span>
              {entity.confidence >= 0.9 && (
                <span className="ml-0.5 text-[10px] opacity-60">
                  {Math.round(entity.confidence * 100)}%
                </span>
              )}
            </button>
          );
        })}
        {entities.length > 30 && (
          <span className="inline-flex items-center px-3 py-1 text-xs text-text-tertiary">
            +{entities.length - 30} more
          </span>
        )}
      </div>

      {/* Selected entity detail panel */}
      {selected && (
        <div className="rounded-lg border border-primary/30 bg-primary-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => { const Icon = entityIcons[selected.entity_type] || FileText; return <Icon className="h-4 w-4 text-primary" />; })()}
              <span className="text-sm font-semibold text-text-primary">{selected.name}</span>
              <span className="rounded-md bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-secondary">
                {selected.entity_type}
              </span>
            </div>
            <button onClick={() => setSelectedEntity(null)} className="text-text-tertiary hover:text-text-secondary">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Related entities (cross-document connections) */}
          {relatedEntities.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1">
                Connected Entities ({relatedEntities.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {relatedEntities.map((r) => {
                  const Icon = entityIcons[r.entity_type] || FileText;
                  return (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700"
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {r.name}
                      {r.document_id !== selected.document_id && (
                        <ChevronRight className="h-2.5 w-2.5 text-amber-400" />
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Linked fraud patterns */}
          {relatedPatterns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1">
                Linked Fraud Patterns ({relatedPatterns.length})
              </p>
              <div className="space-y-1.5">
                {relatedPatterns.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start gap-2 rounded-md bg-fraud-red/5 border border-fraud-red/20 px-2.5 py-1.5"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-fraud-red mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-text-primary">
                        {p.pattern_type.replace(/_/g, ' ')}
                      </span>
                      <span className="ml-1.5 text-[10px] text-text-tertiary">
                        {Math.round(p.confidence * 100)}% confidence
                      </span>
                      {p.description && (
                        <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-2">{p.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {relatedEntities.length === 0 && relatedPatterns.length === 0 && (
            <p className="text-xs text-text-tertiary">
              No cross-document connections found for this entity.
            </p>
          )}
        </div>
      )}

      {/* Pattern summary */}
      {patterns.length > 0 && !selectedEntity && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-text-secondary">Fraud Patterns Detected</p>
          {patterns.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-xs',
                p.confidence_level === 'critical' ? 'bg-red-50 text-red-700' :
                p.confidence_level === 'high' ? 'bg-orange-50 text-orange-700' :
                'bg-yellow-50 text-yellow-700'
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-medium capitalize">{p.pattern_type.replace(/_/g, ' ')}</span>
              <span className="ml-auto text-[10px]">
                {Math.round(p.confidence * 100)}%
                {p.affected_amount ? ` · $${p.affected_amount.toLocaleString()}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
