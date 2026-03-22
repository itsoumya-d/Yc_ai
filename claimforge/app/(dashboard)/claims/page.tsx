import { getClaims } from '@/lib/actions/claims';
import { ClaimsPageClient } from './claims-page-client';

export default async function ClaimsPage() {
  const { data: claims, error } = await getClaims();

  return <ClaimsPageClient claims={claims ?? []} error={error} />;
}
