import { getCases } from '@/lib/actions/cases';
import { CasesView } from '@/components/cases/cases-view';

export const dynamic = 'force-dynamic';

export default async function CasesPage() {
  const result = await getCases();
  return <CasesView cases={result.data ?? []} />;
}
