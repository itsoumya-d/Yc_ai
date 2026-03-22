'use client';

import { useState } from 'react';
import { reconcilePayments, ReconciliationResult, ReconciliationMatch } from '@/lib/actions/reconciliation';
import {
  CheckCircle2, XCircle, AlertCircle, Loader2,
  Upload, TrendingUp, ArrowRight, Info
} from 'lucide-react';

export function ReconciliationPanel() {
  const [statement, setStatement] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [error, setError] = useState('');

  const handleReconcile = async () => {
    if (!statement.trim() || !dateFrom || !dateTo) return;
    setLoading(true);
    setError('');

    const res = await reconcilePayments(statement, { from: dateFrom, to: dateTo });
    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setError(res.error ?? 'Reconciliation failed');
    }
  };

  const matchTypeConfig = {
    exact: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Exact Match' },
    partial: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Partial' },
    possible: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Possible' },
    unmatched: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Unmatched' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          AI Payment Reconciliation
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Paste your bank statement and let AI match payments to invoices automatically
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Bank Statement (paste CSV or transaction text)
          </label>
          <textarea
            value={statement}
            onChange={e => setStatement(e.target.value)}
            placeholder={`Date, Description, Amount\n2026-03-10, ACME CORP PAYMENT, 1500.00\n2026-03-12, GLOBEX WIRE TRANSFER, 2400.00`}
            rows={6}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleReconcile}
          disabled={loading || !statement.trim() || !dateFrom || !dateTo}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is matching payments...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Reconcile Payments
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Invoiced', value: `$${result.summary.totalInvoiced.toLocaleString()}`, color: 'text-gray-900 dark:text-white' },
              { label: 'Received', value: `$${result.summary.totalReceived.toLocaleString()}`, color: 'text-green-600 dark:text-green-400' },
              { label: 'Outstanding', value: `$${result.summary.outstanding.toLocaleString()}`, color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Match Rate', value: `${Math.round(result.summary.reconciliationRate * 100)}%`, color: 'text-blue-600 dark:text-blue-400' },
            ].map((card) => (
              <div key={card.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          {result.summary.aiInsights?.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">AI Insights</p>
              <ul className="space-y-1">
                {result.summary.aiInsights.map((insight, i) => (
                  <li key={i} className="text-sm text-blue-800 dark:text-blue-400 flex gap-2">
                    <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Match List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {result.matched.length} Matches Found
            </h4>
            {result.matched.map((match, i) => {
              const config = matchTypeConfig[match.matchType];
              const Icon = config.icon;
              return (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${config.bg} rounded-xl`}>
                  <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {match.invoiceNumber}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{match.suggestedAction}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ${match.paymentAmount.toLocaleString()}
                    </p>
                    {match.discrepancy !== 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {match.discrepancy > 0 ? '+' : ''}{match.discrepancy.toFixed(2)} diff
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unmatched */}
          {result.unmatched.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {result.unmatched.length} Unmatched
              </h4>
              {result.unmatched.map((match, i) => {
                const config = matchTypeConfig['unmatched'];
                const Icon = config.icon;
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 ${config.bg} rounded-xl`}>
                    <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {match.invoiceNumber}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{match.suggestedAction}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${match.invoiceAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
