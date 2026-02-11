import { getEmergencyData } from '@/lib/actions/emergency';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Pill,
  Syringe,
  Calendar,
  Phone,
  Tag,
  Weight,
  Heart,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Emergency Info',
};

function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years > 0) return `${years}y ${months >= 0 ? months : 12 + months}m`;
  return `${months >= 0 ? months : 12 + months}m`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function EmergencyPage() {
  const { data: emergencyData, error } = await getEmergencyData();

  if (error || !emergencyData) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Failed to load emergency data'}</p>
      </div>
    );
  }

  if (emergencyData.length === 0) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
        <h1 className="text-xl font-bold text-[var(--foreground)]">No Pets Found</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Add a pet first to see emergency info.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
        <div>
          <h1 className="text-lg font-bold text-red-900">Emergency Pet Info</h1>
          <p className="text-sm text-red-700">Critical information for veterinary emergencies. Show this screen to your vet.</p>
        </div>
      </div>

      {emergencyData.map((data) => (
        <Card key={data.pet.id} className="overflow-hidden">
          {/* Pet Header - High contrast */}
          <div className="bg-[var(--foreground)] text-[var(--background)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{data.pet.name}</h2>
                <p className="text-sm opacity-80">
                  {data.pet.species.charAt(0).toUpperCase() + data.pet.species.slice(1)}
                  {data.pet.breed ? ` · ${data.pet.breed}` : ''}
                  {data.pet.gender !== 'unknown' ? ` · ${data.pet.gender}` : ''}
                  {data.pet.is_neutered ? ' · Neutered' : ''}
                </p>
              </div>
              <div className="text-right">
                {data.pet.date_of_birth && (
                  <p className="text-sm font-medium">Age: {calculateAge(data.pet.date_of_birth)}</p>
                )}
                {data.pet.weight && (
                  <p className="text-sm opacity-80">{data.pet.weight} {data.pet.weight_unit}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Key Identifiers */}
            <div className="grid grid-cols-2 gap-3">
              {data.pet.microchip_id && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="text-[var(--muted-foreground)]">Microchip:</span>
                  <span className="font-mono font-medium text-[var(--foreground)]">{data.pet.microchip_id}</span>
                </div>
              )}
              {data.pet.color && (
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="text-[var(--muted-foreground)]">Color:</span>
                  <span className="font-medium text-[var(--foreground)]">{data.pet.color}</span>
                </div>
              )}
            </div>

            {/* Allergies & Conditions - HIGH PRIORITY */}
            {(data.allergies.length > 0 || data.conditions.length > 0) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h3 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Allergies & Conditions
                </h3>
                {data.allergies.map((allergy, i) => (
                  <p key={i} className="text-sm text-red-700 font-medium">Allergy: {allergy}</p>
                ))}
                {data.conditions.map((condition, i) => (
                  <p key={i} className="text-sm text-red-700">Condition: {condition}</p>
                ))}
              </div>
            )}

            {/* Active Medications */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2 flex items-center gap-1">
                <Pill className="w-4 h-4 text-blue-600" /> Active Medications ({data.activeMedications.length})
              </h3>
              {data.activeMedications.length > 0 ? (
                <div className="space-y-1.5">
                  {data.activeMedications.map((med) => (
                    <div key={med.id} className="flex items-center justify-between text-sm bg-blue-50 rounded px-3 py-2">
                      <div>
                        <span className="font-medium text-[var(--foreground)]">{med.name}</span>
                        {med.dosage && <span className="text-[var(--muted-foreground)]"> — {med.dosage}</span>}
                      </div>
                      {med.frequency && (
                        <Badge variant="info">{med.frequency}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">No active medications</p>
              )}
            </div>

            {/* Recent Vaccinations */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2 flex items-center gap-1">
                <Syringe className="w-4 h-4 text-green-600" /> Recent Vaccinations
              </h3>
              {data.recentVaccinations.length > 0 ? (
                <div className="space-y-1">
                  {data.recentVaccinations.map((vax) => (
                    <div key={vax.id} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--foreground)]">{vax.title}</span>
                      <span className="text-[var(--muted-foreground)]">{formatDate(vax.date)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-amber-600 font-medium">No vaccination records found</p>
              )}
            </div>

            {/* Next Appointment */}
            {data.nextAppointment && (
              <div className="flex items-center gap-2 text-sm bg-amber-50 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800">
                  Next: {data.nextAppointment.type} on {formatDate(data.nextAppointment.date)}
                  {data.nextAppointment.clinic_name && ` at ${data.nextAppointment.clinic_name}`}
                </span>
              </div>
            )}

            {/* Notes */}
            {data.pet.notes && (
              <div className="text-sm text-[var(--muted-foreground)] border-t border-[var(--border)] pt-3">
                <p className="font-medium text-[var(--foreground)] mb-1">Notes</p>
                <p className="whitespace-pre-wrap">{data.pet.notes}</p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
