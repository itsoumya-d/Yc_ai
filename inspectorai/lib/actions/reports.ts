import { supabase } from '@/lib/supabase';
import { generateReportSummary } from '@/lib/actions/ai';
import type { Report, Inspection, ReportStatus } from '@/types';

export async function getReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*, inspection:inspections(*, damage_items(*))')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Report[];
}

export async function getReportById(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*, inspection:inspections(*, damage_items(*))')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as unknown as Report | null;
}

export async function generateReport(inspection: Inspection, userId: string): Promise<Report> {
  const summary = await generateReportSummary({
    property_type: inspection.property.type,
    damage_items: inspection.photos
      .filter((p) => p.analysis)
      .map((p) => p.analysis!),
    total_cost_min: inspection.total_estimate_min,
    total_cost_max: inspection.total_estimate_max,
  });

  const title = `${inspection.property.name} — ${new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const claimAmount = Math.round(
    (inspection.total_estimate_min + inspection.total_estimate_max) / 2
  );

  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      inspection_id: inspection.id,
      status: 'draft' as ReportStatus,
      title,
      summary,
      total_claim_amount: claimAmount,
      generated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    inspection_id: data.inspection_id,
    inspection,
    status: data.status,
    title: data.title,
    summary: data.summary,
    total_claim_amount: data.total_claim_amount,
    generated_at: data.generated_at,
  };
}

export async function submitReport(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({
      status: 'submitted' as ReportStatus,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) throw error;
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (status === 'approved') {
    updates.approved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId);

  if (error) throw error;
}

export async function deleteReport(reportId: string): Promise<void> {
  const { error } = await supabase.from('reports').delete().eq('id', reportId);
  if (error) throw error;
}

export function formatReportForPDF(report: Report): string {
  const inspection = report.inspection;
  if (!inspection) return '';

  const lines: string[] = [
    '=== PROPERTY DAMAGE INSPECTION REPORT ===',
    '',
    `Report Title: ${report.title}`,
    `Generated: ${new Date(report.generated_at).toLocaleString()}`,
    `Status: ${report.status.toUpperCase()}`,
    '',
    '--- PROPERTY INFORMATION ---',
    `Name: ${inspection.property.name}`,
    `Address: ${inspection.property.address}`,
    `Type: ${inspection.property.type}`,
    inspection.property.owner_name ? `Owner: ${inspection.property.owner_name}` : '',
    inspection.property.insurance_policy ? `Policy #: ${inspection.property.insurance_policy}` : '',
    '',
    '--- EXECUTIVE SUMMARY ---',
    report.summary,
    '',
    '--- DAMAGE ASSESSMENT ---',
    `Total Damage Items: ${inspection.damage_items.length}`,
    `Estimated Cost Range: $${inspection.total_estimate_min.toLocaleString()} – $${inspection.total_estimate_max.toLocaleString()}`,
    `Claim Amount: $${report.total_claim_amount.toLocaleString()}`,
    '',
    '--- DAMAGE ITEMS ---',
    ...inspection.damage_items.map((item, i) => [
      `${i + 1}. ${item.component.toUpperCase()}`,
      `   Type: ${item.damage_type}`,
      `   Severity: ${item.severity}`,
      `   Urgency: ${item.urgency}`,
      `   Description: ${item.description}`,
      `   Cost Estimate: $${item.estimated_cost_min.toLocaleString()} – $${item.estimated_cost_max.toLocaleString()}`,
      '',
    ].join('\n')),
    '==========================================',
  ];

  return lines.filter((l) => l !== '').join('\n');
}
