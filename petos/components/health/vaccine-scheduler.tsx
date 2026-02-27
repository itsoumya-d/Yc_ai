'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

// Common vaccine schedules by species
const VACCINE_SCHEDULES: Record<string, { name: string; intervalMonths: number; notes: string }[]> = {
  dog: [
    { name: 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)', intervalMonths: 12, notes: 'Core vaccine — annual booster' },
    { name: 'Rabies', intervalMonths: 36, notes: 'Core vaccine — every 1-3 years depending on jurisdiction' },
    { name: 'Bordetella (Kennel Cough)', intervalMonths: 12, notes: 'Recommended for social dogs' },
    { name: 'Leptospirosis', intervalMonths: 12, notes: 'Recommended for outdoor dogs' },
    { name: 'Canine Influenza', intervalMonths: 12, notes: 'Recommended for boarding/dog parks' },
    { name: 'Lyme Disease', intervalMonths: 12, notes: 'Recommended in tick-endemic areas' },
  ],
  cat: [
    { name: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)', intervalMonths: 12, notes: 'Core vaccine — annual booster' },
    { name: 'Rabies', intervalMonths: 12, notes: 'Core vaccine — annual or 3-year depending on product' },
    { name: 'FeLV (Feline Leukemia)', intervalMonths: 12, notes: 'Recommended for outdoor cats' },
    { name: 'FIV (Feline Immunodeficiency Virus)', intervalMonths: 12, notes: 'Recommended for outdoor cats' },
  ],
  bird: [
    { name: 'Pacheco\'s Disease Virus', intervalMonths: 12, notes: 'Recommended for parrots' },
    { name: 'Polyomavirus', intervalMonths: 12, notes: 'Recommended for young birds' },
  ],
};

interface Pet {
  id: string;
  name: string;
  species: string;
  date_of_birth?: string | null;
}

interface Vaccination {
  id: string;
  pet_id: string;
  title: string;
  date: string;
  notes?: string | null;
  vet_name?: string | null;
  pet?: { id: string; name: string; species: string } | null;
}

interface VaccineSchedulerProps {
  pets: Pet[];
  vaccinations: Vaccination[];
}

export function VaccineScheduler({ pets, vaccinations }: VaccineSchedulerProps) {
  const { toast } = useToast();
  const [selectedPet, setSelectedPet] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Calculate upcoming vaccines based on last vaccination dates
  const upcomingVaccines = pets.flatMap((pet) => {
    const schedules = VACCINE_SCHEDULES[pet.species] ?? VACCINE_SCHEDULES['dog'];
    return schedules.map((schedule) => {
      const lastVaccine = vaccinations
        .filter((v) => v.pet_id === pet.id && v.title.toLowerCase().includes(schedule.name.split(' ')[0].toLowerCase()))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      const dueDate = lastVaccine
        ? new Date(new Date(lastVaccine.date).getTime() + schedule.intervalMonths * 30 * 24 * 60 * 60 * 1000)
        : null;

      const now = new Date();
      const isOverdue = dueDate && dueDate < now;
      const isDueSoon = dueDate && !isOverdue && dueDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const isNeverGiven = !lastVaccine;

      return {
        pet,
        vaccineName: schedule.name,
        notes: schedule.notes,
        lastGiven: lastVaccine?.date ?? null,
        dueDate,
        isOverdue,
        isDueSoon,
        isNeverGiven,
        status: isOverdue ? 'overdue' : isDueSoon ? 'due_soon' : isNeverGiven ? 'never_given' : 'up_to_date',
      };
    });
  });

  const filteredVaccines = selectedPet === 'all'
    ? upcomingVaccines
    : upcomingVaccines.filter((v) => v.pet.id === selectedPet);

  const overdueCount = filteredVaccines.filter((v) => v.status === 'overdue').length;
  const dueSoonCount = filteredVaccines.filter((v) => v.status === 'due_soon').length;
  const upToDateCount = filteredVaccines.filter((v) => v.status === 'up_to_date').length;

  const sortedVaccines = [...filteredVaccines].sort((a, b) => {
    const order = { overdue: 0, never_given: 1, due_soon: 2, up_to_date: 3 };
    return order[a.status as keyof typeof order] - order[b.status as keyof typeof order];
  });

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
            Vaccine Schedule
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Track and manage vaccination schedules for your pets.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Log Vaccination
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-medium uppercase text-red-600">Overdue</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{overdueCount}</p>
          <p className="text-xs text-red-600">vaccines need attention now</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium uppercase text-amber-600">Due Within 30 Days</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{dueSoonCount}</p>
          <p className="text-xs text-amber-600">vaccines coming up soon</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-medium uppercase text-green-600">Up to Date</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{upToDateCount}</p>
          <p className="text-xs text-green-600">vaccines current</p>
        </div>
      </div>

      {/* Pet Filter */}
      {pets.length > 1 && (
        <div className="mt-6 flex gap-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-1 w-fit">
          <button
            onClick={() => setSelectedPet('all')}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedPet === 'all'
                ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            All Pets
          </button>
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => setSelectedPet(pet.id)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedPet === pet.id
                  ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {pet.name}
            </button>
          ))}
        </div>
      )}

      {/* Vaccine List */}
      <div className="mt-6 space-y-3">
        {pets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)] text-2xl">
                🐾
              </div>
              <h3 className="mt-4 font-medium text-[var(--foreground)]">No pets found</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Add a pet first to see their vaccine schedule.
              </p>
              <Button className="mt-4" onClick={() => window.location.href = '/pets/new'}>
                Add Your First Pet
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedVaccines.map((item, index) => (
            <div
              key={`${item.pet.id}-${item.vaccineName}-${index}`}
              className={`rounded-lg border p-4 transition-colors ${
                item.status === 'overdue'
                  ? 'border-red-200 bg-red-50'
                  : item.status === 'due_soon'
                  ? 'border-amber-200 bg-amber-50'
                  : item.status === 'never_given'
                  ? 'border-[var(--border)] bg-[var(--card)]'
                  : 'border-[var(--border)] bg-[var(--card)]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[var(--foreground)] text-sm">
                      {item.vaccineName}
                    </span>
                    {selectedPet === 'all' && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        · {item.pet.name}
                      </span>
                    )}
                    <VaccineStatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{item.notes}</p>
                  <div className="mt-2 flex gap-4 text-xs text-[var(--muted-foreground)]">
                    {item.lastGiven ? (
                      <span>Last given: {formatDate(item.lastGiven)}</span>
                    ) : (
                      <span>Never recorded</span>
                    )}
                    {item.dueDate && (
                      <span className={item.isOverdue ? 'font-medium text-red-600' : item.isDueSoon ? 'font-medium text-amber-600' : ''}>
                        Due: {formatDate(item.dueDate.toISOString())}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/health?pet=${item.pet.id}&type=vaccination&vaccine=${encodeURIComponent(item.vaccineName)}`}
                >
                  Log
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Past Vaccinations */}
      {vaccinations.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
            Vaccination History
          </h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">Pet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">Vaccine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--muted-foreground)]">Vet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {vaccinations
                  .filter((v) => selectedPet === 'all' || v.pet_id === selectedPet)
                  .slice(0, 10)
                  .map((vax) => (
                    <tr key={vax.id} className="hover:bg-[var(--muted)]/30">
                      <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">
                        {vax.pet?.name ?? 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">{vax.title}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {formatDate(vax.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {vax.vet_name ?? '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function VaccineStatusBadge({ status }: { status: string }) {
  const config = {
    overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700 border-red-200' },
    due_soon: { label: 'Due Soon', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    never_given: { label: 'Never Given', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    up_to_date: { label: 'Up to Date', className: 'bg-green-100 text-green-700 border-green-200' },
  }[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
