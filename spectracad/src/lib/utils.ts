import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { PCBLayer, ComponentCategory, DRCViolationSeverity } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function formatQuantity(qty: number): string {
  if (qty >= 1_000_000) return `${(qty / 1_000_000).toFixed(1)}M`;
  if (qty >= 1_000) return `${(qty / 1_000).toFixed(0)}K+`;
  return qty.toLocaleString();
}

export function formatDimension(mm: number): string {
  return `${mm.toFixed(1)}mm`;
}

export function formatCoordinate(x: number, y: number): string {
  return `(${x.toFixed(1)}mm, ${y.toFixed(1)}mm)`;
}

const layerColors: Record<PCBLayer, string> = {
  'F.Cu': '#EF4444',
  'B.Cu': '#3B82F6',
  'In1.Cu': '#A855F7',
  'In2.Cu': '#14B8A6',
  'F.Silkscreen': '#FFFFFF',
  'B.Silkscreen': '#9CA3AF',
  'F.Mask': '#22C55E',
  'B.Mask': '#22C55E',
  'Edge.Cuts': '#F59E0B',
  'Drill': '#06B6D4',
  'Courtyard': '#EC4899',
  'Fabrication': '#9CA3AF',
};

export function getLayerColor(layer: PCBLayer): string {
  return layerColors[layer];
}

export function getLayerLabel(layer: PCBLayer): string {
  const labels: Record<PCBLayer, string> = {
    'F.Cu': 'Top Copper',
    'B.Cu': 'Bottom Copper',
    'In1.Cu': 'Inner Layer 1',
    'In2.Cu': 'Inner Layer 2',
    'F.Silkscreen': 'Front Silkscreen',
    'B.Silkscreen': 'Back Silkscreen',
    'F.Mask': 'Front Solder Mask',
    'B.Mask': 'Back Solder Mask',
    'Edge.Cuts': 'Board Outline',
    'Drill': 'Drill Holes',
    'Courtyard': 'Courtyard',
    'Fabrication': 'Fabrication',
  };
  return labels[layer];
}

const categoryLabels: Record<ComponentCategory, string> = {
  resistor: 'Resistors',
  capacitor: 'Capacitors',
  inductor: 'Inductors',
  ic: 'ICs',
  connector: 'Connectors',
  discrete: 'Discrete',
  sensor: 'Sensors',
  power: 'Power',
  module: 'Modules',
  crystal: 'Crystals',
};

export function getCategoryLabel(category: ComponentCategory): string {
  return categoryLabels[category];
}

export function getDRCSeverityColor(severity: DRCViolationSeverity): string {
  const colors: Record<DRCViolationSeverity, string> = {
    error: '#F85149',
    warning: '#D29922',
    info: '#58A6FF',
  };
  return colors[severity];
}

export function getDRCSeverityBadge(severity: DRCViolationSeverity): string {
  const badges: Record<DRCViolationSeverity, string> = {
    error: 'bg-error/10 text-error border-error/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    info: 'bg-info/10 text-info border-info/30',
  };
  return badges[severity];
}

export function getStockBadge(stock: number | null): { label: string; className: string } {
  if (stock === null) return { label: 'Unknown', className: 'bg-bg-surface-hover text-text-tertiary' };
  if (stock > 1000) return { label: `${formatQuantity(stock)}`, className: 'bg-success/10 text-success' };
  if (stock > 100) return { label: `${stock}`, className: 'bg-warning/10 text-warning' };
  return { label: stock > 0 ? `${stock}` : 'Out of Stock', className: 'bg-error/10 text-error' };
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}
