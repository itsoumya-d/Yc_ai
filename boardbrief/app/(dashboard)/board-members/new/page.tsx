import { PageHeader } from '@/components/layout/page-header';
import { MemberForm } from '@/components/board-members/member-form';

export const dynamic = 'force-dynamic';

export default function NewBoardMemberPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Board Member" description="Add a new member to your board." />
      <MemberForm />
    </div>
  );
}
