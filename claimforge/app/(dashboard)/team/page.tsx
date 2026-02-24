import { getTeamMembers } from '@/lib/actions/team';
import { TeamClient } from './team-client';

export default async function TeamPage() {
  const result = await getTeamMembers();
  const members = result.data ?? [];

  return <TeamClient members={members} />;
}
