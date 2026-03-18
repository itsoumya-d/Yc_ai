import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/layout/page-header';
import { MemberForm } from '@/components/board-members/member-form';

export const dynamic = 'force-dynamic';

export default async function NewBoardMemberPage() {
  const t = await getTranslations('boardMembers');
  return (
    <div className="space-y-6">
      <PageHeader title={t('add')} description={t('addDescription')} />
      <MemberForm />
    </div>
  );
}
