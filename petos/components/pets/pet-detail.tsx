'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, calculateAge, getSpeciesEmoji, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { deletePet } from '@/lib/actions/pets';
import { VaccinationSchedule } from '@/components/health/vaccination-schedule';
import type { Pet, HealthRecord, Medication, Appointment, VaccinationStatus } from '@/types/database';

interface PetDetailProps {
  pet: Pet;
  healthRecords: HealthRecord[];
  medications: Medication[];
  appointments: Appointment[];
  vaccinationStatuses?: VaccinationStatus[];
}

export function PetDetail({ pet, healthRecords, medications, appointments, vaccinationStatuses = [] }: PetDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const emoji = getSpeciesEmoji(pet.species);
  const age = pet.date_of_birth ? calculateAge(pet.date_of_birth) : null;

  async function handleDelete() {
    if (!confirm('Are you sure you want to remove this pet? This cannot be undone.')) return;
    setDeleting(true);
    const result = await deletePet(pet.id);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setDeleting(false);
      return;
    }
    toast({ title: 'Pet removed', variant: 'success' });
    router.push('/pets');
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {pet.photo_url ? (
            <img src={pet.photo_url} alt={pet.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-4xl">
              {emoji}
            </div>
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{pet.name}</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {pet.breed || pet.species}
              {age && ` · ${age}`}
              {pet.weight && ` · ${pet.weight} ${pet.weight_unit}`}
            </p>
            <div className="mt-2 flex gap-2">
              <Badge variant={pet.species as 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'small_mammal'}>{pet.species}</Badge>
              {pet.gender && <Badge>{pet.gender === 'male' ? '♂ Male' : '♀ Female'}</Badge>}
              {pet.is_neutered && <Badge variant="healthy">Neutered</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/pets/${pet.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="health" className="mt-8">
        <TabsList>
          <TabsTrigger value="health">Health Records ({healthRecords.length})</TabsTrigger>
          <TabsTrigger value="vaccinations">
            Vaccinations
            {vaccinationStatuses.filter((v) => v.status === 'overdue').length > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">
                {vaccinationStatuses.filter((v) => v.status === 'overdue').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="medications">Medications ({medications.length})</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          {healthRecords.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">No health records yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {healthRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{record.title}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                        {record.type} · {formatDate(record.date)}
                        {record.vet_name && ` · Dr. ${record.vet_name}`}
                      </p>
                    </div>
                    {record.cost && (
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        ${record.cost.toFixed(2)}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vaccinations">
          <div className="mt-4">
            <VaccinationSchedule petId={pet.id} petName={pet.name} />
          </div>
        </TabsContent>

        <TabsContent value="medications">
          {medications.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">No medications tracked.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {medications.map((med) => (
                <Card key={med.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[var(--foreground)]">{med.name}</p>
                        <Badge variant={med.is_active ? 'healthy' : 'default'}>
                          {med.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                        {med.dosage && `${med.dosage}`}
                        {med.frequency && ` · ${med.frequency}`}
                      </p>
                    </div>
                    {med.refill_date && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        Refill: {formatDate(med.refill_date)}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="appointments">
          {appointments.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">No appointments scheduled.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {appointments.map((appt) => (
                <Card key={appt.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {appt.type} {appt.vet_name && `with Dr. ${appt.vet_name}`}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                        {formatDate(appt.date)}
                        {appt.time && ` at ${appt.time}`}
                        {appt.clinic_name && ` · ${appt.clinic_name}`}
                      </p>
                    </div>
                    <Badge variant={appt.status as 'scheduled' | 'completed' | 'cancelled' | 'missed'}>
                      {appt.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
