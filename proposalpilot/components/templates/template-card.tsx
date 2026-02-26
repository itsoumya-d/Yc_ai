'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createProposalFromTemplate, deleteTemplate } from '@/lib/actions/templates';
import { FileText, Copy, Trash2, Loader2 } from 'lucide-react';
import type { Template } from '@/types/database';

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<'clone' | 'delete' | null>(null);

  function handleUseTemplate() {
    setAction('clone');
    startTransition(async () => {
      const result = await createProposalFromTemplate(
        template.id,
        `${template.name} — New Proposal`
      );
      if (result.error) {
        toast({ title: result.error, variant: 'destructive' });
        setAction(null);
        return;
      }
      toast({ title: 'Proposal created from template' });
      router.push(`/proposals/${result.data!.id}`);
    });
  }

  function handleDelete() {
    if (!confirm(`Delete template "${template.name}"?`)) return;
    setAction('delete');
    startTransition(async () => {
      const result = await deleteTemplate(template.id);
      if (result.error) {
        toast({ title: result.error, variant: 'destructive' });
        setAction(null);
        return;
      }
      toast({ title: 'Template deleted' });
      router.refresh();
    });
  }

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
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={handleUseTemplate} disabled={isPending}>
              {isPending && action === 'clone' ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Copy className="w-3.5 h-3.5 mr-1" />
              )}
              Use Template
            </Button>
            {!template.is_default && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending && action === 'delete' ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                )}
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
