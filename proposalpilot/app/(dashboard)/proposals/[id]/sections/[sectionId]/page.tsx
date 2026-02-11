import { notFound } from 'next/navigation';
import { getProposalSection } from '@/lib/actions/proposal-sections';
import { PageHeader } from '@/components/layout/page-header';
import { ProposalSectionEditor } from '@/components/proposals/proposal-section-editor';

export const dynamic = 'force-dynamic';

export default async function EditSectionPage({ params }: { params: Promise<{ id: string; sectionId: string }> }) {
  const { id, sectionId } = await params;
  const { data: section, error } = await getProposalSection(sectionId);
  if (error || !section) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Section" description={`Editing "${section.title}"`} />
      <ProposalSectionEditor section={section} proposalId={id} />
    </div>
  );
}
