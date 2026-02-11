import Link from 'next/link';
import { getBoardMembers } from '@/lib/actions/board-members';
import { PageHeader } from '@/components/layout/page-header';
import { MemberList } from '@/components/board-members/member-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BoardMembersPage() {
  const { data: members } = await getBoardMembers();
  return (
    <div className="space-y-6">
      <PageHeader title="Board Members" description="Manage your board of directors." actions={<Link href="/board-members/new"><Button><Plus className="w-4 h-4 mr-1" />Add Member</Button></Link>} />
      <MemberList members={members ?? []} />
    </div>
  );
}
