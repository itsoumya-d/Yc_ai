import { PageHeader } from '@/components/layout/page-header';
import { ResolutionForm } from '@/components/resolutions/resolution-form';

export const dynamic = 'force-dynamic';

export default function NewResolutionPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Resolution" description="Draft a new board resolution." />
      <ResolutionForm />
    </div>
  );
}
