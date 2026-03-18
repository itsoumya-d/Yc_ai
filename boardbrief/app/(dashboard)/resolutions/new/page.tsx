import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/layout/page-header';
import { ResolutionForm } from '@/components/resolutions/resolution-form';

export const dynamic = 'force-dynamic';

export default async function NewResolutionPage() {
  const t = await getTranslations('resolutions');
  return (
    <div className="space-y-6">
      <PageHeader title={t('new')} description={t('newDescription')} />
      <ResolutionForm />
    </div>
  );
}
