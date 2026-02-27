'use client';
import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Wand2, Copy, Download, CheckCircle, RefreshCw, Lightbulb } from 'lucide-react';

const ORIGINAL_SUMMARY = `Quality Control Supervisor with 18 years of experience in manufacturing. Managed quality control processes on the production floor. Led a team of 8 inspectors. Reduced defects by 34% through process improvements. Familiar with Six Sigma methodologies.`;

const AI_REWRITTEN_SUMMARIES: Record<string, string> = {
  'Data Quality Analyst': `Data-driven quality professional with 18 years of experience designing and optimizing quality management systems. Led cross-functional teams of 8 to implement systematic defect detection processes, achieving 34% reduction in error rates through statistical analysis and root cause investigation. Experienced in Six Sigma methodologies and quantitative process improvement — translating directly to data quality roles that require anomaly detection, process documentation, and analytical rigor.`,
  'Compliance Specialist': `Detail-oriented compliance professional with 18 years ensuring adherence to quality standards, regulatory requirements, and documented procedures in high-stakes manufacturing environments. Led audit teams, maintained comprehensive compliance documentation, and developed corrective action plans that reduced non-conformance rates by 34%. Strong foundation in risk assessment, process controls, and regulatory frameworks — directly applicable to compliance roles in financial services and healthcare.`,
  'Operations Analyst': `Operations leader with 18 years of experience optimizing manufacturing processes, managing cross-functional teams, and driving measurable performance improvements. Applied data analysis and Six Sigma methodologies to reduce defects by 34% and streamline documentation workflows. Proven ability to translate complex operational data into actionable insights, manage multiple stakeholders, and implement sustainable process changes — core competencies for operations analyst roles.`,
};

export default function ResumePage() {
  const { user, paths, activePathId } = useAppStore();
  const activePath = paths.find((p) => p.id === activePathId);
  const [selectedTarget, setSelectedTarget] = useState(activePath?.title || paths[0]?.title || '');
  const [copied, setCopied] = useState(false);

  const rewritten = AI_REWRITTEN_SUMMARIES[selectedTarget] || AI_REWRITTEN_SUMMARIES[paths[0]?.title || ''];

  const handleCopy = () => {
    navigator.clipboard.writeText(rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI Resume Rewriter</h1>
        <p className="text-sm text-text-secondary mt-1">Reframe your experience for your target industry — without exaggerating</p>
      </div>

      {/* Target selector */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="block text-sm font-medium text-text-primary mb-2">Rewrite for career path:</label>
        <div className="flex flex-wrap gap-2">
          {paths.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedTarget(p.title)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${selectedTarget === p.title ? 'bg-primary text-white' : 'border border-border text-text-secondary hover:border-primary/30 hover:bg-surface'}`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Side by side comparison */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">Original Summary</h3>
            <span className="text-xs text-text-tertiary bg-surface px-2 py-1 rounded-full">Before</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{ORIGINAL_SUMMARY}</p>
          <div className="mt-3 flex gap-1 flex-wrap">
            {['QC Inspector', 'Manufacturing', 'Defect Reduction'].map((t) => (
              <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-tertiary">{t}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">AI-Rewritten Summary</h3>
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
                <Wand2 className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-medium text-primary">AI</span>
              </div>
            </div>
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">For {selectedTarget}</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{rewritten}</p>
          <div className="mt-3 flex gap-1 flex-wrap">
            {['Transferable', 'Industry-targeted', 'Achievement-focused'].map((t) => (
              <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AI tips */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
        <div className="flex gap-3">
          <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">What the AI changed</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Replaced manufacturing-specific language with transferable equivalents</li>
              <li>• Emphasized analytical and quantitative achievements (34% reduction)</li>
              <li>• Highlighted skills that directly map to {selectedTarget} requirements</li>
              <li>• Added industry-relevant framing without overstating experience</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleCopy} className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${copied ? 'bg-green-600 text-white' : 'btn-primary'}`}>
          {copied ? <><CheckCircle className="h-4 w-4" />Copied!</> : <><Copy className="h-4 w-4" />Copy Rewritten Summary</>}
        </button>
        <button className="btn-outline text-sm">
          <RefreshCw className="h-4 w-4" />Regenerate
        </button>
        <button className="btn-outline text-sm">
          <Download className="h-4 w-4" />Download Full Resume
        </button>
      </div>
    </div>
  );
}
