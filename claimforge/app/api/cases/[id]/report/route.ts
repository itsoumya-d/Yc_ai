import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFraudPatternLabel, formatCurrency } from '@/lib/utils';
import { computeFraudScore, benfordAnalysis } from '@/lib/fraud/scorer';
import type { FraudPattern } from '@/types/database';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const HR = '─'.repeat(72);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();

  if (caseError || !caseData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  const [docsResult, patternsResult, entitiesResult] = await Promise.all([
    supabase.from('documents').select('*').eq('case_id', id).order('created_at'),
    supabase
      .from('fraud_patterns')
      .select('*')
      .eq('case_id', id)
      .order('confidence', { ascending: false }),
    supabase
      .from('entities')
      .select('*')
      .eq('case_id', id)
      .order('mention_count', { ascending: false })
      .limit(20),
  ]);

  const documents = docsResult.data ?? [];
  const patterns: FraudPattern[] = patternsResult.data ?? [];
  const entities = entitiesResult.data ?? [];
  const fraudScore = computeFraudScore(patterns);

  const lines: string[] = [];

  lines.push('CLAIMFORGE INVESTIGATION REPORT');
  lines.push(HR);
  lines.push(`Case Number:      ${caseData.case_number}`);
  lines.push(`Title:            ${caseData.title}`);
  lines.push(`Status:           ${caseData.status.toUpperCase()}`);
  lines.push(
    `Defendant:        ${caseData.defendant_name} (${caseData.defendant_type.replace(/_/g, ' ')})`
  );
  lines.push(`Jurisdiction:     ${caseData.jurisdiction}`);
  lines.push(`Est. Fraud:       ${formatCurrency(caseData.estimated_fraud_amount)}`);
  lines.push(`Fraud Risk Score: ${fraudScore}/100`);
  lines.push(`Report Generated: ${formatDate(new Date().toISOString())}`);
  lines.push('');

  lines.push('EXECUTIVE SUMMARY');
  lines.push(HR);
  lines.push(caseData.description || 'No description provided.');
  lines.push('');
  lines.push(
    `This investigation analyzed ${documents.length} document(s) and identified ${patterns.length} fraud pattern(s).`
  );
  if (caseData.estimated_fraud_amount > 0) {
    lines.push(
      `Estimated fraudulent activity: ${formatCurrency(caseData.estimated_fraud_amount)}`
    );
  }
  lines.push('');

  if (patterns.length > 0) {
    lines.push('FRAUD PATTERNS DETECTED');
    lines.push(HR);
    for (const p of patterns) {
      lines.push(`[${p.confidence_level.toUpperCase()}] ${getFraudPatternLabel(p.pattern_type)}`);
      lines.push(`  Confidence:      ${(p.confidence * 100).toFixed(0)}%`);
      lines.push(`  Affected Amount: ${formatCurrency(p.affected_amount)}`);
      lines.push(`  Detection:       ${p.detection_method.replace(/_/g, ' ')}`);
      lines.push(`  Description:     ${p.description}`);
      lines.push(`  Evidence:        ${p.evidence_summary}`);
      lines.push('');
    }
  }

  if (entities.length > 0) {
    lines.push('KEY ENTITIES');
    lines.push(HR);
    for (const e of entities) {
      lines.push(
        `  ${e.entity_type.toUpperCase().padEnd(14)} ${e.name}  ` +
          `(confidence: ${(e.confidence * 100).toFixed(0)}%, mentions: ${e.mention_count})`
      );
    }
    lines.push('');
  }

  if (documents.length > 0) {
    lines.push('EVIDENCE INVENTORY');
    lines.push(HR);
    for (const d of documents) {
      const status = d.processed ? (d.flagged ? '[FLAGGED]  ' : '[PROCESSED]') : '[PENDING]  ';
      const size = `${(d.file_size / 1024).toFixed(1)} KB`;
      lines.push(`  ${status} ${d.title} (${d.document_type}, ${size})`);
      if (d.entity_count > 0) {
        lines.push(`             Entities extracted: ${d.entity_count}`);
      }
    }
    lines.push('');
  }

  lines.push("STATISTICAL ANALYSIS — BENFORD'S LAW");
  lines.push(HR);
  const amounts = patterns.filter((p) => p.affected_amount > 0).map((p) => p.affected_amount);
  if (amounts.length >= 5) {
    const benford = benfordAnalysis(amounts);
    const suspicious = benford.filter((b) => b.suspicious);
    if (suspicious.length > 0) {
      lines.push(`Analysis of ${amounts.length} data points:`);
      lines.push(
        `  Suspicious digit distribution for leading digits: ${suspicious.map((b) => b.digit).join(', ')}`
      );
      lines.push('  This may indicate fabricated or manipulated financial data.');
      lines.push('');
      lines.push('  Digit | Expected | Actual | Deviation');
      for (const b of benford) {
        const flag = b.suspicious ? ' ← ANOMALOUS' : '';
        lines.push(
          `    ${b.digit}   |  ${String(b.expected_frequency).padStart(5)}%  | ${String(b.actual_frequency).padStart(5)}% | ${b.deviation > 0 ? '+' : ''}${b.deviation}%${flag}`
        );
      }
    } else {
      lines.push(`Analysis of ${amounts.length} data points: distribution within normal parameters.`);
    }
  } else {
    lines.push(
      `Insufficient data for Benford's Law analysis (${amounts.length} point(s); need ≥5).`
    );
  }
  lines.push('');

  lines.push(HR);
  lines.push('CONFIDENTIAL — ATTORNEY-CLIENT PRIVILEGED');
  lines.push('Generated by ClaimForge Investigation Platform');
  lines.push(new Date().toISOString());

  const reportText = lines.join('\n');
  const filename = `${caseData.case_number}-investigation-report.txt`;

  return new NextResponse(reportText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
