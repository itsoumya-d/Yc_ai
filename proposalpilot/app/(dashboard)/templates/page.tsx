import { getTemplates, seedDefaultTemplates } from '@/lib/actions/templates';
import { PageHeader } from '@/components/layout/page-header';
import { EnhancedTemplateList } from '@/components/templates/enhanced-template-list';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  // Seed default templates if none exist
  await seedDefaultTemplates();

  const { data: templates } = await getTemplates();

  const systemTemplates = (templates ?? []).filter((t) => t.is_default);
  const customTemplates = (templates ?? []).filter((t) => !t.is_default);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Library"
        description="Use industry-proven templates or save your own from existing proposals."
      />
      <EnhancedTemplateList
        systemTemplates={systemTemplates}
        customTemplates={customTemplates}
      />
    </div>
  );
}
