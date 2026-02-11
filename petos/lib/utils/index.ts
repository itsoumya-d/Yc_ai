import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculateAge(dateOfBirth: string): string {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();

  if (years > 0) {
    return months < 0
      ? `${years - 1} yr${years - 1 !== 1 ? 's' : ''}`
      : `${years} yr${years !== 1 ? 's' : ''}`;
  }
  const totalMonths = months < 0 ? 12 + months : months;
  return `${totalMonths} mo${totalMonths !== 1 ? 's' : ''}`;
}

export function getSpeciesEmoji(species: string): string {
  const map: Record<string, string> = {
    dog: '🐕',
    cat: '🐈',
    bird: '🐦',
    fish: '🐠',
    reptile: '🦎',
    small_mammal: '🐹',
    other: '🐾',
  };
  return map[species] ?? '🐾';
}
