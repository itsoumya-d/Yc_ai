import type { Inspection, Violation, CorrectiveAction } from '@/types/database';
import { getViolationBreakdown, sortViolationsBySeverity } from '@/lib/actions/violations';

export interface Report {
  id: string;
  title: string;
  inspection: Inspection;
  violations: Violation[];
  correctiveActions: CorrectiveAction[];
  score: number;
  generated_at: string;
  status: 'draft' | 'final';
}

export interface ReportSummary {
  total_violations: number;
  critical: number;
  major: number;
  minor: number;
  observation: number;
  compliance_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export function generateReportSummary(
  violations: Violation[],
  score: number,
): ReportSummary {
  const breakdown = getViolationBreakdown(violations);
  const riskLevel: ReportSummary['risk_level'] =
    breakdown.critical > 0 ? 'critical' :
    breakdown.major > 2 ? 'high' :
    breakdown.major > 0 || breakdown.minor > 3 ? 'medium' : 'low';

  const recommendations: string[] = [];

  if (breakdown.critical > 0) {
    recommendations.push(`Address ${breakdown.critical} critical violation(s) immediately to prevent serious injury`);
  }
  if (breakdown.major > 0) {
    recommendations.push(`Resolve ${breakdown.major} major violation(s) within 30 days`);
  }
  if (score < 70) {
    recommendations.push('Schedule follow-up inspection within 60 days');
  }
  if (breakdown.minor > 0) {
    recommendations.push(`Plan corrective actions for ${breakdown.minor} minor violation(s)`);
  }
  if (breakdown.observation > 0) {
    recommendations.push(`Review ${breakdown.observation} observation(s) for potential improvements`);
  }

  return {
    total_violations: violations.filter((v) => v.status !== 'completed').length,
    ...breakdown,
    compliance_score: score,
    risk_level: riskLevel,
    recommendations,
  };
}

export function formatReportAsText(report: Report): string {
  const summary = generateReportSummary(report.violations, report.score);
  const sortedViolations = sortViolationsBySeverity(report.violations);
  const date = new Date(report.generated_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lines: string[] = [
    '==============================',
    'SAFETY COMPLIANCE INSPECTION REPORT',
    '==============================',
    '',
    `Report Title: ${report.title}`,
    `Generated: ${date}`,
    `Status: ${report.status.toUpperCase()}`,
    '',
    '--- INSPECTION DETAILS ---',
    `Facility: ${report.inspection.facility}`,
    `Type: ${report.inspection.type}`,
    `Inspector: ${report.inspection.inspector}`,
    `Date: ${new Date(report.inspection.date).toLocaleDateString()}`,
    `Compliance Score: ${report.score}/100`,
    '',
    '--- EXECUTIVE SUMMARY ---',
    `Risk Level: ${summary.risk_level.toUpperCase()}`,
    `Total Open Violations: ${summary.total_violations}`,
    `  Critical: ${summary.critical}`,
    `  Major: ${summary.major}`,
    `  Minor: ${summary.minor}`,
    `  Observations: ${summary.observation}`,
    '',
    '--- RECOMMENDATIONS ---',
    ...summary.recommendations.map((r, i) => `${i + 1}. ${r}`),
    '',
    '--- VIOLATIONS FOUND ---',
    ...sortedViolations.map((v, i) => [
      `${i + 1}. [${v.severity.toUpperCase()}] ${v.title}`,
      `   Regulation: ${v.regulation}`,
      `   Location: ${v.location}`,
      `   Status: ${v.status}`,
      '',
    ].join('\n')),
    '--- CORRECTIVE ACTIONS ---',
    ...(report.correctiveActions.length === 0
      ? ['No corrective actions assigned.']
      : report.correctiveActions.map((a, i) => [
          `${i + 1}. ${a.violation_title}`,
          `   Assigned to: ${a.assigned_to}`,
          `   Due: ${a.due_date}`,
          `   Status: ${a.status}`,
          '',
        ].join('\n'))
    ),
    '==============================',
    'END OF REPORT',
    '==============================',
  ];

  return lines.join('\n');
}

export function createReport(params: {
  inspection: Inspection;
  violations: Violation[];
  correctiveActions: CorrectiveAction[];
}): Report {
  return {
    id: `report-${Date.now()}`,
    title: `${params.inspection.facility} — ${params.inspection.type}`,
    inspection: params.inspection,
    violations: params.violations,
    correctiveActions: params.correctiveActions,
    score: params.inspection.score,
    generated_at: new Date().toISOString(),
    status: 'draft',
  };
}

export function getRiskLevelColor(level: ReportSummary['risk_level']): string {
  switch (level) {
    case 'critical': return 'text-severity-critical';
    case 'high': return 'text-severity-major';
    case 'medium': return 'text-severity-minor';
    case 'low': return 'text-compliant';
  }
}

export function getRiskLevelBg(level: ReportSummary['risk_level']): string {
  switch (level) {
    case 'critical': return 'bg-severity-critical-bg border-severity-critical/30';
    case 'high': return 'bg-severity-major-bg border-severity-major/30';
    case 'medium': return 'bg-severity-minor-bg border-severity-minor/30';
    case 'low': return 'bg-compliant-bg border-compliant/30';
  }
}
