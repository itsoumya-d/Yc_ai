import { notFound } from 'next/navigation';
import { getResolution } from '@/lib/actions/resolutions';
import { getBoardMembers } from '@/lib/actions/board-members';
import { ResolutionDetail } from '@/components/resolutions/resolution-detail';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getResolution(id);
  return { title: data?.title ?? 'Resolution' };
}

export default async function ResolutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [resolutionResult, membersResult] = await Promise.all([
    getResolution(id),
    getBoardMembers(),
  ]);
  if (resolutionResult.error || !resolutionResult.data) notFound();
  return (
    <ResolutionDetail
      resolution={resolutionResult.data}
      boardMembers={membersResult.data ?? []}
    />
  );
}
