import { getTemplates } from '@/lib/actions/templates';
import { PageHeader } from '@/components/layout/page-header';
import { TemplateList } from '@/components/templates/template-list';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const t = await getTranslations('templates');
  const { data: templates } = await getTemplates();

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <TemplateList templates={templates ?? []} />
    </div>
  );
}
