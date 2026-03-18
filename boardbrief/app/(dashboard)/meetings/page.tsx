import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getMeetings } from '@/lib/actions/meetings';
import { PageHeader } from '@/components/layout/page-header';
import { MeetingList } from '@/components/meetings/meeting-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MeetingsPage() {
  const t = await getTranslations('meetings');
  const { data: meetings } = await getMeetings();
  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} actions={<Link href="/meetings/new"><Button><Plus className="w-4 h-4 mr-1" />{t('new')}</Button></Link>} />
      <MeetingList meetings={meetings ?? []} />
    </div>
  );
}
