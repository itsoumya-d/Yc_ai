'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTemplate } from '@/lib/actions/templates';
import { LayoutTemplate, Star, Trash2, Plus, ArrowRight, Globe } from 'lucide-react';
import type { Template } from '@/types/database';

interface EnhancedTemplateListProps {
  systemTemplates: Template[];
  customTemplates: Template[];
}

const CATEGORY_COLORS: Record<string, string> = {
  development: 'bg-blue-100 text-blue-700',
  marketing: 'bg-green-100 text-green-700',
  design: 'bg-purple-100 text-purple-700',
  consulting: 'bg-amber-100 text-amber-700',
  web: 'bg-indigo-100 text-indigo-700',
  custom: 'bg-gray-100 text-gray-700',
};

const INDUSTRY_EMOJI: Record<string, string> = {
  Technology: '💻',
  Marketing: '📢',
  Design: '🎨',
  Consulting: '📊',
  'Web Design': '🌐',
  Other: '📄',
};

function TemplateCard({
  template,
  onDelete,
  isSystem,
}: {
  template: Template;
  onDelete?: (id: string) => void;
  isSystem: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const categoryClass = CATEGORY_COLORS[template.category ?? 'custom'] ?? CATEGORY_COLORS.custom;
  const emoji = INDUSTRY_EMOJI[template.industry ?? 'Other'] ?? '📄';

  const handleDelete = () => {
    if (!confirm('Delete this template?')) return;
    startTransition(async () => {
      await deleteTemplate(template.id);
      onDelete?.(template.id);
    });
  };

  const handleUse = () => {
    router.push(`/proposals/new?template_id=${template.id}`);
  };

  return (
    <div className="group relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:shadow-md transition-all hover:border-brand-200">
      {isSystem && (
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            Featured
          </span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0 pr-16">
          <h3 className="font-semibold text-[var(--foreground)] truncate">{template.name}</h3>
          {template.industry && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{template.industry}</p>
          )}
        </div>
      </div>

      {template.description && (
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4 flex-1">
          {template.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${categoryClass}`}>
          {template.category ?? 'Custom'}
        </span>
        <div className="flex items-center gap-2">
          {!isSystem && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete template"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleUse}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Use Template
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function EnhancedTemplateList({ systemTemplates, customTemplates }: EnhancedTemplateListProps) {
  const [custom, setCustom] = useState(customTemplates);

  return (
    <div className="space-y-8">
      {/* System Templates */}
      {systemTemplates.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-amber-600" />
            <h2 className="text-base font-semibold text-[var(--foreground)]">Industry Templates</h2>
            <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-full">
              {systemTemplates.length} templates
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {systemTemplates.map((t) => (
              <TemplateCard key={t.id} template={t} isSystem />
            ))}
          </div>
        </section>
      )}

      {/* Custom Templates */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-brand-600" />
            <h2 className="text-base font-semibold text-[var(--foreground)]">My Templates</h2>
            {custom.length > 0 && (
              <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-full">
                {custom.length} templates
              </span>
            )}
          </div>
        </div>

        {custom.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[var(--border)] p-8 text-center">
            <LayoutTemplate className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-3" />
            <h3 className="font-medium text-[var(--foreground)]">No custom templates yet</h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Open a proposal and use &ldquo;Save as Template&rdquo; to add your own.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {custom.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                isSystem={false}
                onDelete={(id) => setCustom((prev) => prev.filter((x) => x.id !== id))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
