import { notFound } from 'next/navigation';
import { getPet } from '@/lib/actions/pets';
import { getHealthRecords } from '@/lib/actions/health-records';
import { getMedications } from '@/lib/actions/medications';
import { getAppointments } from '@/lib/actions/appointments';
import { PetDetail } from '@/components/pets/pet-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: pet } = await getPet(id);
  return { title: pet?.name || 'Pet Detail' };
}

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [petResult, healthResult, medsResult, apptsResult] = await Promise.all([
    getPet(id),
    getHealthRecords(id),
    getMedications(id),
    getAppointments(id),
  ]);

  if (!petResult.data) {
    notFound();
  }

  return (
    <PetDetail
      pet={petResult.data}
      healthRecords={healthResult.data || []}
      medications={medsResult.data || []}
      appointments={apptsResult.data || []}
    />
  );
}
