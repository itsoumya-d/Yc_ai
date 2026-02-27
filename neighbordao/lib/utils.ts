import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  // Simple class merge without tailwind-merge since Tailwind v4 handles deduplication
  return clsx(inputs);
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    ...opts,
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function formatCurrency(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function truncate(str: string, max = 120): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '…';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    general:        '#78716C',
    event:          '#7C3AED',
    alert:          '#DC2626',
    question:       '#2563EB',
    recommendation: '#16A34A',
    marketplace:    '#A16207',
    lost_found:     '#F59E0B',
    safety:         '#DC2626',
  };
  return map[category] ?? '#78716C';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    open:      '#16A34A',
    locked:    '#F59E0B',
    ordered:   '#2563EB',
    delivered: '#7C3AED',
    completed: '#78716C',
    cancelled: '#DC2626',
  };
  return map[status] ?? '#78716C';
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
