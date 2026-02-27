import { getTeamMembers } from '@/lib/actions/team';
import { TeamView } from '@/components/team/team-view';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const result = await getTeamMembers();
  return <TeamView initialMembers={result.data ?? []} />;
}
