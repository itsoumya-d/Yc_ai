import { notFound } from 'next/navigation';
import { getBoardMember } from '@/lib/actions/board-members';
import { MemberDetail } from '@/components/board-members/member-detail';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getBoardMember(id);
  return { title: data?.full_name ?? 'Board Member' };
}

export default async function BoardMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: member, error } = await getBoardMember(id);
  if (error || !member) notFound();
  return <MemberDetail member={member} />;
}
