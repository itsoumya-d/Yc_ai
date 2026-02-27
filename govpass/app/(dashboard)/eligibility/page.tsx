import { Search, Shield, ArrowRight, Bookmark, Info, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchEligibilityResults, fetchBenefitPrograms, fetchSavedBenefits } from '@/lib/actions/eligibility';
import { formatCurrency, getEligibilityStatusColor, getEligibilityStatusLabel, getBenefitCategoryColor, getBenefitCategoryLabel, getConfidenceLabel } from '@/lib/utils';

const categories = [
  { value: 'all', label: 'All Programs' },
  { value: 'food', label: 'Food' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'housing', label: 'Housing' },
  { value: 'cash', label: 'Cash Aid' },
  { value: 'tax_credit', label: 'Tax Credits' },
  { value: 'childcare', label: 'Childcare' },
  { value: 'education', label: 'Education' },
  { value: 'disability', label: 'Disability' },
  { value: 'energy', label: 'Energy' },
];

export default async function EligibilityPage() {
  const [resultsRes, programsRes, savedRes] = await Promise.all([
    fetchEligibilityResults(),
    fetchBenefitPrograms(),
    fetchSavedBenefits(),
  ]);

  const results = resultsRes.success ? resultsRes.data : [];
  const programs = programsRes.success ? programsRes.data : [];
  const saved = savedRes.success ? savedRes.data : [];
  const savedIds = new Set(saved.map((s) => s.program_id));

  const eligible = results.filter((r) => r.is_eligible);
  const totalMonthly = eligible.reduce((sum, r) => sum + (r.estimated_monthly_value ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Eligibility</h1>
          <p className="text-sm text-text-secondary mt-1">Discover benefits you qualify for</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-trust-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-trust-700 transition-colors">
          <Search className="h-4 w-4" />
          Run Check
        </button>
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-civic-50 border-civic-200">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-civic-600" />
              <div>
                <p className="text-xs text-civic-700 uppercase tracking-wide">Eligible Programs</p>
                <p className="text-2xl font-bold text-civic-800 font-heading">{eligible.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-approval-50 border-approval-200">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-approval-600" />
              <div>
                <p className="text-xs text-approval-700 uppercase tracking-wide">Est. Monthly</p>
                <p className="text-2xl font-bold text-approval-800 font-heading">{formatCurrency(totalMonthly)}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-notice-50 border-notice-200">
            <div className="flex items-center gap-3">
              <Bookmark className="h-8 w-8 text-notice-600" />
              <div>
                <p className="text-xs text-notice-700 uppercase tracking-wide">Saved</p>
                <p className="text-2xl font-bold text-notice-800 font-heading">{saved.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border border-border text-text-secondary hover:bg-trust-50 hover:text-trust-600 hover:border-trust-300 transition-colors"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary font-heading">Your Results</h2>
          <div className="grid gap-4">
            {results.map((result) => (
              <Card key={result.id} padding="lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {result.program?.program_name ?? 'Program'}
                      </h3>
                      <Badge variant={getEligibilityStatusColor(result.eligibility_status) as 'green' | 'red' | 'amber' | 'blue' | 'gray'}>
                        {getEligibilityStatusLabel(result.eligibility_status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                      {result.program?.short_description ?? ''}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      {result.program?.category && (
                        <Badge variant={getBenefitCategoryColor(result.program.category) as 'green' | 'red' | 'amber' | 'blue' | 'gray'}>
                          {getBenefitCategoryLabel(result.program.category)}
                        </Badge>
                      )}
                      <span>{getConfidenceLabel(result.confidence)} confidence</span>
                      {result.estimated_monthly_value && (
                        <span className="font-medium text-approval-600">
                          ~{formatCurrency(result.estimated_monthly_value)}/mo
                        </span>
                      )}
                    </div>
                    {result.missing_information.length > 0 && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-deadline-600">
                        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>Missing: {result.missing_information.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {savedIds.has(result.program_id) && (
                      <Bookmark className="h-4 w-4 text-trust-600 fill-trust-600" />
                    )}
                    <Link
                      href={`/applications?program=${result.program_id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-trust-600 hover:text-trust-700"
                    >
                      Apply <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card padding="lg">
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-text-primary font-heading mb-1">
              Check Your Eligibility
            </h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto mb-4">
              We&apos;ll scan {programs.length} benefit programs and show you which ones you qualify for.
            </p>
            <button className="inline-flex items-center gap-2 bg-trust-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-trust-700 transition-colors">
              <Search className="h-4 w-4" />
              Run Eligibility Check
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
