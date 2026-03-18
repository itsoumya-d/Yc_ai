'use client';

import Link from 'next/link';
import { cn, calculateAge, getSpeciesEmoji } from '@/lib/utils';
import type { Pet } from '@/types/database';

type HealthStatus = 'healthy' | 'due' | 'overdue';

interface PetCardProps {
  pet: Pet;
  className?: string;
  /** Health score 0–100. If omitted, the ring is not rendered. */
  healthScore?: number;
  /** How many days since the last checkup/vet visit. */
  lastCheckupDaysAgo?: number | null;
  /** Overall health status for the colored dot indicator. */
  healthStatus?: HealthStatus;
}

const STATUS_COLORS: Record<HealthStatus, { dot: string; label: string; text: string }> = {
  healthy: { dot: 'bg-green-500', label: 'Healthy', text: 'text-green-600' },
  due: { dot: 'bg-amber-400', label: 'Due for checkup', text: 'text-amber-600' },
  overdue: { dot: 'bg-red-500', label: 'Overdue', text: 'text-red-600' },
};

/** CSS-only circular progress ring using SVG. */
function HealthRing({ score }: { score: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const ringColor =
    clampedScore >= 75 ? '#16a34a' : clampedScore >= 50 ? '#eab308' : '#dc2626';

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg
        className="-rotate-90"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        aria-label={`Health score: ${clampedScore}%`}
      >
        {/* Background track */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="4"
        />
        {/* Progress arc */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* Score label in center */}
      <span
        className="absolute text-[11px] font-bold"
        style={{ color: ringColor }}
      >
        {clampedScore}
      </span>
    </div>
  );
}

export function PetCard({
  pet,
  className,
  healthScore,
  lastCheckupDaysAgo,
  healthStatus,
}: PetCardProps) {
  const emoji = getSpeciesEmoji(pet.species);
  const age = pet.date_of_birth ? calculateAge(pet.date_of_birth) : null;
  const showRing = healthScore != null;
  const statusInfo = healthStatus ? STATUS_COLORS[healthStatus] : null;

  const lastCheckupLabel =
    lastCheckupDaysAgo == null
      ? 'No checkup on record'
      : lastCheckupDaysAgo === 0
      ? 'Last checkup: today'
      : lastCheckupDaysAgo === 1
      ? 'Last checkup: yesterday'
      : `Last checkup: ${lastCheckupDaysAgo}d ago`;

  return (
    <Link href={`/pets/${pet.id}`}>
      <div
        className={cn(
          'group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-brand-200',
          className
        )}
      >
        <div className="flex items-start gap-4">
          {/* Avatar or health ring wrapping avatar */}
          {showRing ? (
            <div className="relative shrink-0">
              <HealthRing score={healthScore!} />
              {/* Pet photo/emoji inside the ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                {pet.photo_url ? (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl">{emoji}</span>
                )}
              </div>
            </div>
          ) : pet.photo_url ? (
            <img
              src={pet.photo_url}
              alt={pet.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-2xl">
              {emoji}
            </div>
          )}

          {/* Name / breed / status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-heading text-base font-semibold text-[var(--foreground)] group-hover:text-brand-600 transition-colors">
                {pet.name}
              </h3>
              {/* Status dot */}
              {statusInfo && (
                <span
                  className={cn(
                    'inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white',
                    statusInfo.dot
                  )}
                  title={statusInfo.label}
                />
              )}
            </div>
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
              {pet.breed || pet.species}
              {age && ` · ${age}`}
            </p>
            {/* Last checkup line */}
            {(lastCheckupDaysAgo != null || healthStatus) && (
              <p
                className={cn(
                  'mt-1 text-xs',
                  statusInfo ? statusInfo.text : 'text-[var(--muted-foreground)]'
                )}
              >
                {lastCheckupLabel}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          {pet.weight && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97Z" />
              </svg>
              {pet.weight} {pet.weight_unit}
            </span>
          )}
          {pet.gender && (
            <span>{pet.gender === 'male' ? '♂ Male' : pet.gender === 'female' ? '♀ Female' : pet.gender}</span>
          )}
          {pet.is_neutered && (
            <span className="rounded bg-green-50 px-1.5 py-0.5 text-green-700">Neutered</span>
          )}
        </div>
      </div>
    </Link>
  );
}
