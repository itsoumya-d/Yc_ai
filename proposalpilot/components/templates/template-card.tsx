import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Layers } from 'lucide-react';
import type { Template } from '@/types/database';

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[var(--foreground)] truncate">{template.name}</h3>
            {template.is_default && <Badge variant="info">Default</Badge>}
          </div>
          {template.description && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)] line-clamp-2">{template.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted-foreground)]">
            {template.industry && <span>{template.industry}</span>}
            {template.category && <span>· {template.category}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}
