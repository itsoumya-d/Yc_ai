import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ---- Types matching Supabase schema ----

export interface Organization {
  id: string;
  name: string;
  license_number: string | null;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface Property {
  id: string;
  org_id: string;
  address: string;
  property_type: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface InspectionRow {
  id: string;
  org_id: string;
  property_id: string;
  inspector_id: string;
  claim_number: string;
  insured_name: string;
  status: 'in_progress' | 'review' | 'submitted';
  overall_score: number | null;
  created_at: string;
  updated_at: string;
  properties?: Property;
}

export interface InspectionPhotoRow {
  id: string;
  inspection_id: string;
  area: string;
  storage_url: string | null;
  damage_type: string | null;
  severity: string | null;
  assessment: Record<string, unknown> | null;
  upload_status: 'pending' | 'uploaded' | 'failed';
  captured_at: string;
}

export interface ReportRow {
  id: string;
  inspection_id: string;
  report_html: string;
  pdf_url: string | null;
  submitted_at: string | null;
  created_at: string;
}

// ---- Data access helpers ----

export async function fetchInspections(orgId: string): Promise<InspectionRow[]> {
  const { data, error } = await supabase
    .from('inspections')
    .select('*, properties(address, property_type)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as InspectionRow[];
}

export async function fetchInspectionPhotos(inspectionId: string): Promise<InspectionPhotoRow[]> {
  const { data, error } = await supabase
    .from('inspection_photos')
    .select('*')
    .eq('inspection_id', inspectionId)
    .order('captured_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as InspectionPhotoRow[];
}

export async function upsertInspection(
  inspection: Partial<InspectionRow> & { id: string }
): Promise<InspectionRow> {
  const { data, error } = await supabase
    .from('inspections')
    .upsert(inspection)
    .select()
    .single();

  if (error) throw error;
  return data as InspectionRow;
}

export async function uploadPhoto(
  inspectionId: string,
  photoId: string,
  base64: string
): Promise<string> {
  const path = `inspections/${inspectionId}/${photoId}.jpg`;
  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }

  const { error } = await supabase.storage
    .from('inspection-photos')
    .upload(path, byteArray, { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('inspection-photos').getPublicUrl(path);
  return data.publicUrl;
}

export async function insertPhotoRecord(photo: Partial<InspectionPhotoRow> & { id: string; inspection_id: string }): Promise<void> {
  const { error } = await supabase.from('inspection_photos').upsert(photo);
  if (error) throw error;
}

export async function saveReport(report: Partial<ReportRow> & { inspection_id: string; report_html: string }): Promise<ReportRow> {
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single();

  if (error) throw error;
  return data as ReportRow;
}

export async function fetchReports(orgId: string): Promise<ReportRow[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*, inspections!inner(org_id, claim_number, insured_name)')
    .eq('inspections.org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReportRow[];
}
