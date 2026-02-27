import { supabase } from '@/lib/supabase';
import type { Inspection, InspectionPhoto, DamageItem, Property, InspectionStatus } from '@/types';

export async function getInspections(userId: string): Promise<Inspection[]> {
  const { data, error } = await supabase
    .from('inspections')
    .select('*, damage_items(*), photos:inspection_photos(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Inspection[];
}

export async function getInspectionById(id: string): Promise<Inspection | null> {
  const { data, error } = await supabase
    .from('inspections')
    .select('*, damage_items(*), photos:inspection_photos(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as unknown as Inspection | null;
}

export async function createInspection(
  userId: string,
  property: Property
): Promise<Inspection> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('inspections')
    .insert({
      user_id: userId,
      property_name: property.name,
      property_address: property.address,
      property_type: property.type,
      owner_name: property.owner_name,
      owner_email: property.owner_email,
      owner_phone: property.owner_phone,
      insurance_policy: property.insurance_policy,
      status: 'draft' as InspectionStatus,
      total_estimate_min: 0,
      total_estimate_max: 0,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    user_id: data.user_id,
    property,
    status: data.status,
    photos: [],
    damage_items: [],
    total_estimate_min: 0,
    total_estimate_max: 0,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function updateInspectionStatus(
  id: string,
  status: InspectionStatus
): Promise<void> {
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('inspections')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function updateInspectionNotes(id: string, notes: string): Promise<void> {
  const { error } = await supabase
    .from('inspections')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function updateInspectionTotals(
  id: string,
  totalMin: number,
  totalMax: number
): Promise<void> {
  const { error } = await supabase
    .from('inspections')
    .update({
      total_estimate_min: totalMin,
      total_estimate_max: totalMax,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteInspection(id: string): Promise<void> {
  const { error } = await supabase.from('inspections').delete().eq('id', id);
  if (error) throw error;
}

export async function addPhotoToInspection(
  inspectionId: string,
  photo: InspectionPhoto
): Promise<void> {
  const { error } = await supabase.from('inspection_photos').insert({
    id: photo.id,
    inspection_id: inspectionId,
    uri: photo.uri,
    uploaded_url: photo.uploaded_url,
    analysis: photo.analysis ? JSON.stringify(photo.analysis) : null,
    analyzed_at: photo.analyzed_at,
  });

  if (error) throw error;
}

export async function addDamageItem(
  inspectionId: string,
  item: DamageItem
): Promise<void> {
  const { error } = await supabase.from('damage_items').insert({
    id: item.id,
    inspection_id: inspectionId,
    damage_type: item.damage_type,
    severity: item.severity,
    urgency: item.urgency,
    component: item.component,
    description: item.description,
    estimated_cost_min: item.estimated_cost_min,
    estimated_cost_max: item.estimated_cost_max,
    photo_url: item.photo_url,
    created_at: item.created_at,
  });

  if (error) throw error;
}

export async function getDashboardStats(userId: string) {
  const { data: inspections, error } = await supabase
    .from('inspections')
    .select('id, total_estimate_min, total_estimate_max, property_type')
    .eq('user_id', userId);

  if (error) throw error;

  const { data: reports } = await supabase
    .from('reports')
    .select('status')
    .eq('user_id', userId);

  const totalInspections = inspections?.length ?? 0;
  const totalMin = inspections?.reduce((s, i) => s + (i.total_estimate_min ?? 0), 0) ?? 0;
  const totalMax = inspections?.reduce((s, i) => s + (i.total_estimate_max ?? 0), 0) ?? 0;
  const avgCost = totalInspections > 0 ? Math.round((totalMin + totalMax) / 2 / totalInspections) : 0;
  const uniqueProperties = new Set(inspections?.map((i) => i.property_type) ?? []).size;
  const pendingReports = reports?.filter((r) => r.status === 'submitted').length ?? 0;
  const approvedReports = reports?.filter((r) => r.status === 'approved').length ?? 0;

  return {
    total_inspections: totalInspections,
    total_claims_value: Math.round((totalMin + totalMax) / 2),
    avg_damage_cost: avgCost,
    properties_inspected: uniqueProperties,
    pending_reports: pendingReports,
    approved_reports: approvedReports,
  };
}
