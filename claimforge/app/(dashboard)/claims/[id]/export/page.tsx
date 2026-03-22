import { getClaim } from '@/lib/actions/claims';
import { ExportWizardClient } from './export-wizard-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExportPage({ params }: Props) {
  const { id } = await params;
  const { data: claim, error } = await getClaim(id);

  return <ExportWizardClient claim={claim ?? null} error={error} />;
}
