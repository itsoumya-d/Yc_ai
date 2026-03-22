import { getClaim } from '@/lib/actions/claims';
import { ClaimDetailClient } from './claim-detail-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClaimDetailPage({ params }: Props) {
  const { id } = await params;
  const { data: claim, error } = await getClaim(id);

  return <ClaimDetailClient claim={claim ?? null} error={error} />;
}
