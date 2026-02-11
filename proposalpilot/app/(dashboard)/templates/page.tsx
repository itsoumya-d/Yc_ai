import { getTemplates } from '@/lib/actions/templates';
import { PageHeader } from '@/components/layout/page-header';
import { TemplateList } from '@/components/templates/template-list';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const { data: templates } = await getTemplates();

  return (
    <div className="space-y-6">
      <PageHeader title="Templates" description="Browse proposal templates to get started quickly." />
      <TemplateList templates={templates ?? []} />
    </div>
  );
}
