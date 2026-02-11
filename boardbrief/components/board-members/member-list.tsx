import { MemberCard } from './member-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';
import type { BoardMember } from '@/types/database';

interface MemberListProps {
  members: BoardMember[];
}

export function MemberList({ members }: MemberListProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No board members yet"
        description="Add your first board member to begin tracking your governance team."
        action={{ label: 'Add Member', href: '/board-members/new' }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}
