import { TemplateCard } from './template-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';
import type { Template } from '@/types/database';

interface TemplateListProps {
  templates: Template[];
}

export function TemplateList({ templates }: TemplateListProps) {
  if (templates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No templates yet"
        description="Templates will help you create proposals faster."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
