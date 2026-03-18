import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/layout/page-header';
import { MeetingForm } from '@/components/meetings/meeting-form';

export const dynamic = 'force-dynamic';

export default async function NewMeetingPage() {
  const t = await getTranslations('meetings');
  return (
    <div className="space-y-6">
      <PageHeader title={t('new')} description={t('newDescription')} />
      <MeetingForm />
    </div>
  );
}
