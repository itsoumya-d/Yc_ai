import Link from 'next/link';
import { getResolutions } from '@/lib/actions/resolutions';
import { PageHeader } from '@/components/layout/page-header';
import { ResolutionList } from '@/components/resolutions/resolution-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ResolutionsPage() {
  const { data: resolutions } = await getResolutions();
  return (
    <div className="space-y-6">
      <PageHeader title="Resolutions" description="Manage board resolutions and votes." actions={<Link href="/resolutions/new"><Button><Plus className="w-4 h-4 mr-1" />New Resolution</Button></Link>} />
      <ResolutionList resolutions={resolutions ?? []} />
    </div>
  );
}
