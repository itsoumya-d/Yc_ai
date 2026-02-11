import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getGenreLabel(genre: string): string {
  const map: Record<string, string> = {
    fantasy: 'Fantasy',
    sci_fi: 'Science Fiction',
    romance: 'Romance',
    mystery: 'Mystery',
    horror: 'Horror',
    literary: 'Literary Fiction',
    thriller: 'Thriller',
    historical: 'Historical Fiction',
    adventure: 'Adventure',
    comedy: 'Comedy',
    drama: 'Drama',
    other: 'Other',
  };
  return map[genre] ?? genre;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    in_progress: 'In Progress',
    completed: 'Completed',
    published: 'Published',
    archived: 'Archived',
  };
  return map[status] ?? status;
}

export function getGenreEmoji(genre: string): string {
  const map: Record<string, string> = {
    fantasy: '\u2728',
    sci_fi: '\uD83D\uDE80',
    romance: '\u2764\uFE0F',
    mystery: '\uD83D\uDD0D',
    horror: '\uD83D\uDC7B',
    literary: '\uD83D\uDCDA',
    thriller: '\uD83D\uDDE1\uFE0F',
    historical: '\uD83C\uDFF0',
    adventure: '\uD83C\uDF0D',
    comedy: '\uD83D\uDE04',
    drama: '\uD83C\uDFAD',
    other: '\uD83D\uDCDD',
  };
  return map[genre] ?? '\uD83D\uDCDD';
}
