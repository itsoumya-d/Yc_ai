import { notFound } from 'next/navigation';
import { getMeeting } from '@/lib/actions/meetings';
import { MeetingDetail } from '@/components/meetings/meeting-detail';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getMeeting(id);
  return { title: data?.title ?? 'Meeting' };
}

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: meeting, error } = await getMeeting(id);
  if (error || !meeting) notFound();
  return <MeetingDetail meeting={meeting} />;
}
