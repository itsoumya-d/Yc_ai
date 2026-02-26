import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { Case, Entity, FraudPattern } from '@/types/database';

const ENTITY_COLORS: Record<string, string> = {
  person: '#3B82F6',
  organization: '#B45309',
  payment: '#059669',
  contract: '#6B7280',
  location: '#8B5CF6',
  date: '#EC4899',
};

const PATTERN_LABELS: Record<string, string> = {
  overbilling: 'Overbilling',
  duplicate_billing: 'Duplicate Billing',
  phantom_vendor: 'Phantom Vendor',
  quality_substitution: 'Quality Substitution',
  unbundling: 'Unbundling',
  upcoding: 'Upcoding',
  round_number: 'Round Number',
  time_anomaly: 'Time Anomaly',
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatDateStr(s: string) {
  return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function buildHtmlReport(
  caseInfo: Case,
  entities: Entity[],
  patterns: FraudPattern[],
): string {
  const totalFraud = patterns.reduce((s, p) => s + (p.affected_amount || 0), 0);
  const highConfidence = patterns.filter(p => p.confidence >= 0.8).length;
  const criticalPatterns = patterns.filter(p => p.confidence_level === 'critical' || p.confidence_level === 'high');

  const patternRows = patterns.map(p => `
    <tr class="${p.confidence >= 0.8 ? 'high-conf' : ''}">
      <td>${PATTERN_LABELS[p.pattern_type] ?? p.pattern_type}</td>
      <td>${p.description}</td>
      <td class="number ${p.confidence_level === 'critical' || p.confidence_level === 'high' ? 'fraud-red' : ''}">${formatCurrency(p.affected_amount || 0)}</td>
      <td class="center">${(p.confidence * 100).toFixed(0)}%</td>
      <td class="center conf-badge conf-${p.confidence_level}">${p.confidence_level.toUpperCase()}</td>
    </tr>
  `).join('');

  const entityRows = entities.slice(0, 20).map(e => `
    <tr>
      <td>
        <span class="entity-dot" style="background:${ENTITY_COLORS[e.entity_type] ?? '#6B7280'}"></span>
        ${e.name}
      </td>
      <td>${e.entity_type.charAt(0).toUpperCase() + e.entity_type.slice(1)}</td>
      <td class="center">${e.mention_count ?? 0}</td>
      <td class="center">${(e.confidence * 100).toFixed(0)}%</td>
    </tr>
  `).join('');

  const criticalItems = criticalPatterns.slice(0, 5).map(p => `
    <li><strong>${PATTERN_LABELS[p.pattern_type] ?? p.pattern_type}</strong> — ${p.evidence_summary ?? p.description} (${formatCurrency(p.affected_amount || 0)})</li>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Investigation Report — ${caseInfo.case_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,300;0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; color: #1a1a1a; background: white; line-height: 1.55; }

    .page { max-width: 820px; margin: 0 auto; padding: 60px 72px; }

    /* ── Header ── */
    .report-header { border-bottom: 3px solid #1E40AF; padding-bottom: 24px; margin-bottom: 32px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { font-size: 10pt; font-family: 'JetBrains Mono', monospace; color: #1E40AF; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
    .confidential { font-size: 8pt; font-family: 'JetBrains Mono', monospace; color: #DC2626; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; border: 1.5px solid #DC2626; padding: 2px 8px; }
    .report-title { margin-top: 20px; }
    .case-number { font-family: 'JetBrains Mono', monospace; font-size: 10pt; color: #6B7280; margin-bottom: 6px; }
    h1.report-name { font-size: 22pt; font-weight: 700; color: #0F172A; line-height: 1.25; margin-bottom: 8px; }
    .report-meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 20px; }
    .meta-item { }
    .meta-label { font-size: 8pt; font-family: 'JetBrains Mono', monospace; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em; }
    .meta-value { font-size: 10pt; font-weight: 600; color: #1E293B; margin-top: 2px; }

    /* ── Summary Stats ── */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 28px 0; }
    .stat-card { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; }
    .stat-label { font-size: 8pt; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em; }
    .stat-value { font-family: 'JetBrains Mono', monospace; font-size: 16pt; font-weight: 700; margin-top: 4px; }
    .stat-value.fraud { color: #DC2626; }
    .stat-value.blue { color: #1E40AF; }

    /* ── Sections ── */
    .section { margin: 32px 0; }
    h2.section-title { font-size: 13pt; font-weight: 700; color: #1E40AF; border-bottom: 1.5px solid #BFDBFE; padding-bottom: 6px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.04em; }
    h3.subsection { font-size: 11pt; font-weight: 600; color: #1E293B; margin: 16px 0 8px; }
    p { margin-bottom: 10px; }

    /* ── Tables ── */
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; }
    th { background: #1E40AF; color: white; padding: 8px 10px; text-align: left; font-size: 8.5pt; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
    td { padding: 7px 10px; border-bottom: 1px solid #E2E8F0; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr.high-conf td { background: #FEF2F2; }
    tr:hover td { background: #F8FAFC; }
    td.number { font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
    td.center { text-align: center; }
    td.fraud-red { color: #DC2626; font-weight: 600; }

    /* Confidence badges */
    .conf-badge { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 7.5pt; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
    .conf-critical { background: #FEE2E2; color: #DC2626; }
    .conf-high { background: #FEF3C7; color: #92400E; }
    .conf-medium { background: #DBEAFE; color: #1E40AF; }
    .conf-low { background: #F1F5F9; color: #64748B; }

    /* Entity dot */
    .entity-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }

    /* ── Footer ── */
    .report-footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; font-size: 8pt; color: #6B7280; }

    /* ── Print styles ── */
    @media print {
      body { font-size: 10pt; }
      .page { padding: 40px 52px; }
      .no-print { display: none !important; }
      h2.section-title { page-break-after: avoid; }
      table { page-break-inside: avoid; }
      .stats-grid { page-break-inside: avoid; }
    }

    /* ── Print button (screen only) ── */
    .print-bar { position: fixed; top: 16px; right: 16px; display: flex; gap: 8px; z-index: 100; }
    @media print { .print-bar { display: none; } }
    .btn { font-family: sans-serif; font-size: 12px; font-weight: 600; padding: 8px 18px; border: none; border-radius: 6px; cursor: pointer; }
    .btn-primary { background: #1E40AF; color: white; }
    .btn-secondary { background: #F1F5F9; color: #334155; }
    .btn:hover { opacity: 0.88; }
  </style>
</head>
<body>

<!-- Print bar (screen only) -->
<div class="print-bar no-print">
  <button class="btn btn-secondary" onclick="window.close()">Close</button>
  <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF</button>
</div>

<div class="page">

  <!-- ── Header ───────────────────────────────────────────────────────── -->
  <div class="report-header">
    <div class="header-top">
      <div class="brand">ClaimForge ✦ Investigation Report</div>
      <div class="confidential">Confidential — Attorney Work Product</div>
    </div>
    <div class="report-title">
      <div class="case-number">${caseInfo.case_number}</div>
      <h1 class="report-name">${caseInfo.title}</h1>
    </div>
    <div class="report-meta">
      <div class="meta-item">
        <div class="meta-label">Defendant</div>
        <div class="meta-value">${caseInfo.defendant_name}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Jurisdiction</div>
        <div class="meta-value">${caseInfo.jurisdiction}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Generated</div>
        <div class="meta-value">${formatDateStr(new Date().toISOString())}</div>
      </div>
    </div>
  </div>

  <!-- ── Summary Statistics ────────────────────────────────────────────── -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Estimated Fraud</div>
      <div class="stat-value fraud">${formatCurrency(caseInfo.estimated_fraud_amount)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Fraud Patterns</div>
      <div class="stat-value blue">${patterns.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Entities Identified</div>
      <div class="stat-value blue">${entities.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">High-Confidence Patterns</div>
      <div class="stat-value fraud">${highConfidence}</div>
    </div>
  </div>

  <!-- ── Case Overview ─────────────────────────────────────────────────── -->
  <div class="section">
    <h2 class="section-title">I. Case Overview</h2>
    <p>${caseInfo.description}</p>
    <p>The defendant, <strong>${caseInfo.defendant_name}</strong> (${caseInfo.defendant_type.replace(/_/g, ' ')}), is under investigation for alleged False Claims Act violations in the jurisdiction of <strong>${caseInfo.jurisdiction}</strong>. This case was opened with an estimated fraud exposure of <strong>${formatCurrency(caseInfo.estimated_fraud_amount)}</strong>.</p>
    <p>Current investigation status: <strong>${caseInfo.status.toUpperCase().replace(/_/g, ' ')}</strong>. ${caseInfo.statute_of_limitations ? `Statute of limitations: ${formatDateStr(caseInfo.statute_of_limitations)}.` : ''}</p>
  </div>

  <!-- ── Critical Findings ─────────────────────────────────────────────── -->
  ${criticalItems ? `
  <div class="section">
    <h2 class="section-title">II. Critical Findings</h2>
    <p>The following high-confidence fraud patterns were identified through AI-assisted document analysis and require immediate attention:</p>
    <ul style="margin: 12px 0 0 20px; line-height: 1.7;">
      ${criticalItems}
    </ul>
  </div>
  ` : ''}

  <!-- ── Fraud Pattern Analysis ─────────────────────────────────────────── -->
  <div class="section">
    <h2 class="section-title">${criticalItems ? 'III' : 'II'}. Fraud Pattern Analysis</h2>
    <p>AI-powered analysis identified <strong>${patterns.length} distinct fraud patterns</strong> with a combined estimated exposure of <strong style="color:#DC2626">${formatCurrency(totalFraud)}</strong>. Patterns highlighted in red indicate high confidence (≥80%).</p>
    ${patterns.length > 0 ? `
    <table>
      <thead><tr><th>Pattern Type</th><th>Description</th><th>Amount</th><th>Confidence</th><th>Level</th></tr></thead>
      <tbody>${patternRows}</tbody>
    </table>
    ` : '<p><em>No fraud patterns identified in the current dataset.</em></p>'}
  </div>

  <!-- ── Entity Network ─────────────────────────────────────────────────── -->
  <div class="section">
    <h2 class="section-title">${criticalItems ? 'IV' : 'III'}. Entity Network</h2>
    <p>Document analysis extracted <strong>${entities.length} entities</strong> relevant to this investigation. Top entities by frequency of mention:</p>
    ${entities.length > 0 ? `
    <table>
      <thead><tr><th>Entity</th><th>Type</th><th>Mentions</th><th>AI Confidence</th></tr></thead>
      <tbody>${entityRows}</tbody>
    </table>
    ` : '<p><em>No entities extracted. Analyze documents to populate the entity network.</em></p>'}
  </div>

  <!-- ── Investigative Methodology ─────────────────────────────────────── -->
  <div class="section">
    <h2 class="section-title">${criticalItems ? 'V' : 'IV'}. Investigative Methodology</h2>
    <p>All evidence was processed using ClaimForge's AI-assisted investigation platform, which employs GPT-4o for entity extraction, fraud pattern detection, and document analysis. The following methodology was applied:</p>
    <ul style="margin: 12px 0 0 20px; line-height: 1.8;">
      <li><strong>Document OCR & Extraction:</strong> All submitted documents were processed for full-text extraction and entity identification.</li>
      <li><strong>AI Pattern Detection:</strong> Machine learning models analyzed document content against ${Object.keys(PATTERN_LABELS).length} known fraud pattern types.</li>
      <li><strong>Statistical Analysis:</strong> Benford's Law analysis was applied to monetary amounts to detect statistically anomalous distributions.</li>
      <li><strong>Entity Network Mapping:</strong> Co-occurrence analysis and relationship extraction mapped connections between identified entities.</li>
    </ul>
  </div>

  <!-- ── Footer ────────────────────────────────────────────────────────── -->
  <div class="report-footer">
    <div>
      <div>ClaimForge Intelligence Platform</div>
      <div style="margin-top:2px">Generated ${new Date().toLocaleString('en-US')} UTC</div>
    </div>
    <div style="text-align:right">
      <div>Case: ${caseInfo.case_number}</div>
      <div style="margin-top:2px">This report is privileged and confidential</div>
    </div>
  </div>

</div>
</body>
</html>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [caseRes, entitiesRes, patternsRes] = await Promise.all([
    supabase.from('cases').select('*').eq('id', id).single(),
    supabase.from('entities').select('*').eq('case_id', id).order('mention_count', { ascending: false }).limit(30),
    supabase.from('fraud_patterns').select('*').eq('case_id', id).order('confidence', { ascending: false }),
  ]);

  if (caseRes.error || !caseRes.data) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  const html = buildHtmlReport(
    caseRes.data as Case,
    (entitiesRes.data ?? []) as Entity[],
    (patternsRes.data ?? []) as FraudPattern[],
  );

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
