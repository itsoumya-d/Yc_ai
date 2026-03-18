import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getResolutions } from '@/lib/actions/resolutions';
import { getBoardMembers } from '@/lib/actions/board-members';
import { PageHeader } from '@/components/layout/page-header';
import { ResolutionList } from '@/components/resolutions/resolution-list';
import { QuorumChecker } from '@/components/resolutions/quorum-checker';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ResolutionsPage() {
  const t = await getTranslations('resolutions');
  const [{ data: resolutions }, { data: boardMembers }] = await Promise.all([
    getResolutions(),
    getBoardMembers(),
  ]);

  // Count only active members who can vote
  const votingMembers = (boardMembers ?? []).filter((m) => m.is_active && m.can_vote);
  const boardMemberCount = votingMembers.length > 0 ? votingMembers.length : 9;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Link href="/resolutions/new">
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              {t('new')}
            </Button>
          </Link>
        }
      />
      <QuorumChecker
        totalBoardMembers={boardMemberCount}
        resolutionCount={(resolutions ?? []).length}
      />
      <ResolutionList
        resolutions={resolutions ?? []}
        boardMemberCount={boardMemberCount}
      />
    </div>
  );
}
