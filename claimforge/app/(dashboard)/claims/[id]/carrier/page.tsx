import { getClaim } from '@/lib/actions/claims';
import { getCarrierClaimStatus, getCarrierCommunications, getCarrierConnections } from '@/lib/actions/carriers';
import { CarrierClaimClient } from './carrier-claim-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CarrierClaimPage({ params }: Props) {
  const { id } = await params;
  const [claimResult, statusResult, commsResult, carriersResult] = await Promise.all([
    getClaim(id),
    getCarrierClaimStatus(id),
    getCarrierCommunications(id),
    getCarrierConnections(),
  ]);

  return (
    <CarrierClaimClient
      claim={claimResult.data ?? null}
      claimError={claimResult.error}
      carrierStatus={statusResult.data ?? null}
      communications={commsResult.data ?? []}
      availableCarriers={carriersResult.data ?? []}
    />
  );
}
