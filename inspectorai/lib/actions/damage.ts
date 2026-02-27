import * as FileSystem from 'expo-file-system';
import { analyzeDamagePhoto, estimateTotalCost } from '@/lib/actions/ai';
import { addDamageItem, updateInspectionTotals } from '@/lib/actions/inspections';
import type { AIAnalysisResult, DamageItem, InspectionPhoto } from '@/types';

export async function analyzePhoto(photoUri: string): Promise<AIAnalysisResult> {
  // Read the image as base64
  const base64 = await FileSystem.readAsStringAsync(photoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return await analyzeDamagePhoto(base64);
}

export async function processInspectionPhotos(
  inspectionId: string,
  photos: InspectionPhoto[]
): Promise<{ damageItems: DamageItem[]; totalMin: number; totalMax: number }> {
  const damageItems: DamageItem[] = [];
  const analysisResults: AIAnalysisResult[] = [];

  for (const photo of photos) {
    if (!photo.analysis) continue;

    analysisResults.push(photo.analysis);

    const item: DamageItem = {
      id: `${inspectionId}-${photo.id}`,
      damage_type: photo.analysis.damage_type,
      severity: photo.analysis.severity,
      urgency: photo.analysis.urgency,
      component: photo.analysis.affected_components[0] ?? 'Unknown',
      description: photo.analysis.description,
      estimated_cost_min: photo.analysis.estimated_cost_min,
      estimated_cost_max: photo.analysis.estimated_cost_max,
      photo_url: photo.uri,
      created_at: new Date().toISOString(),
    };

    damageItems.push(item);
    await addDamageItem(inspectionId, item);
  }

  const { total_min, total_max } = await estimateTotalCost(analysisResults);
  await updateInspectionTotals(inspectionId, total_min, total_max);

  return { damageItems, totalMin: total_min, totalMax: total_max };
}

export function formatCostRange(min: number, max: number): string {
  const formatAmount = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
  };
  return `${formatAmount(min)} – ${formatAmount(max)}`;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'minor': return '#16a34a';
    case 'moderate': return '#d97706';
    case 'severe': return '#ea580c';
    case 'total_loss': return '#dc2626';
    default: return '#6b7280';
  }
}

export function getUrgencyLabel(urgency: string): string {
  switch (urgency) {
    case 'immediate': return 'Immediate Action Required';
    case 'can_wait': return 'Can Wait';
    case 'cosmetic': return 'Cosmetic Only';
    default: return urgency;
  }
}

export function getDamageTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    water: 'Water Damage',
    fire: 'Fire Damage',
    wind: 'Wind Damage',
    structural: 'Structural Damage',
    vandalism: 'Vandalism',
    electrical: 'Electrical Damage',
    other: 'Other Damage',
  };
  return labels[type] ?? 'Unknown Damage';
}

export function calculateTotalEstimate(items: DamageItem[]): { min: number; max: number } {
  return {
    min: items.reduce((sum, i) => sum + i.estimated_cost_min, 0),
    max: items.reduce((sum, i) => sum + i.estimated_cost_max, 0),
  };
}
