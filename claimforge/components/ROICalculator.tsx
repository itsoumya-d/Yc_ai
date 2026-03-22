'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Scale, TrendingUp, Clock } from 'lucide-react';

export function ROICalculator() {
  const [casesPerMonth, setCasesPerMonth] = useState(10);
  const [avgCaseValue, setAvgCaseValue] = useState(50_000);
  const [currentSettlementRate, setCurrentSettlementRate] = useState(35);
  const [hoursPerCase, setHoursPerCase] = useState(12);

  const PARALEGAL_RATE = 150; // $/hr
  const SETTLEMENT_IMPROVEMENT = 12; // percentage points
  const ADMIN_REDUCTION = 0.6; // 60% reduction

  const improvedSettlementRate = Math.min(currentSettlementRate + SETTLEMENT_IMPROVEMENT, 100);
  const additionalSettlements = casesPerMonth * 12 * ((improvedSettlementRate - currentSettlementRate) / 100);
  const additionalRecoveries = additionalSettlements * avgCaseValue;

  const adminHrsPerYear = casesPerMonth * 12 * hoursPerCase;
  const hrsSaved = adminHrsPerYear * ADMIN_REDUCTION;
  const adminSavings = hrsSaved * PARALEGAL_RATE;

  const totalValue = additionalRecoveries + adminSavings;
  const subscriptionCost = 199 * 12;
  const netValue = totalValue - subscriptionCost;
  const roi = ((netValue / subscriptionCost) * 100).toFixed(0);
  const hrsSavedPerCase = (hoursPerCase * ADMIN_REDUCTION).toFixed(1);

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : `$${n.toFixed(0)}`;

  return (
    <section className="py-20 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 px-4 py-1.5 text-sm font-semibold text-purple-700 dark:text-purple-300 mb-4">
            <BarChart3 className="h-4 w-4" />
            ROI Calculator
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            Calculate Your Case Recovery Impact
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            See how ClaimForge&apos;s AI evidence analysis drives more settlements and cuts admin overhead.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 p-7 space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Scale className="h-5 w-5 text-purple-600" />
              Your Practice Profile
            </h3>

            {/* Cases per month */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cases per month
                </label>
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {casesPerMonth}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={casesPerMonth}
                onChange={(e) => setCasesPerMonth(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1</span>
                <span>100</span>
              </div>
            </div>

            {/* Avg case value */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Average case value
                </label>
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {fmt(avgCaseValue)}
                </span>
              </div>
              <input
                type="range"
                min={1_000}
                max={2_000_000}
                step={1_000}
                value={avgCaseValue}
                onChange={(e) => setAvgCaseValue(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$1K</span>
                <span>$2M</span>
              </div>
            </div>

            {/* Settlement rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Current settlement rate
                </label>
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {currentSettlementRate}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                value={currentSettlementRate}
                onChange={(e) => setCurrentSettlementRate(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>10%</span>
                <span>80%</span>
              </div>
            </div>

            {/* Hours per case */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Admin hours per case
                </label>
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {hoursPerCase}h
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={40}
                value={hoursPerCase}
                onChange={(e) => setHoursPerCase(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>2h</span>
                <span>40h</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <motion.div
            className="space-y-4"
            key={`${casesPerMonth}-${avgCaseValue}-${currentSettlementRate}-${hoursPerCase}`}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div className="text-xs text-slate-500 dark:text-slate-400">Additional Recoveries (Year 1)</div>
              </div>
              <div className="text-2xl font-extrabold text-green-600">{fmt(additionalRecoveries)}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                settlement rate {currentSettlementRate}% → {improvedSettlementRate}% (+{SETTLEMENT_IMPROVEMENT}pp via AI evidence analysis)
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <div className="text-xs text-slate-500 dark:text-slate-400">Admin Cost Saved (Year 1)</div>
              </div>
              <div className="text-2xl font-extrabold text-purple-600">{fmt(adminSavings)}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {hrsSavedPerCase}h saved/case · {Math.round(hrsSaved).toLocaleString()} hrs/yr @ $150/hr paralegal
              </div>
            </div>

            <div className="rounded-xl border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950 p-5">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Net Value Generated</div>
              <div className="text-3xl font-extrabold text-purple-700 dark:text-purple-300">{fmt(netValue)}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                after ${subscriptionCost.toLocaleString()}/yr ClaimForge subscription
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-900 dark:bg-gray-800 text-white p-5 text-center border border-slate-700">
                <div className="text-3xl font-extrabold text-purple-400">{roi}%</div>
                <div className="text-xs text-slate-400 mt-1">Annual ROI</div>
              </div>
              <div className="rounded-xl bg-slate-900 dark:bg-gray-800 text-white p-5 text-center border border-slate-700">
                <div className="text-3xl font-extrabold text-purple-400">+{SETTLEMENT_IMPROVEMENT}pp</div>
                <div className="text-xs text-slate-400 mt-1">Settlement Rate Lift</div>
              </div>
            </div>

            <p className="text-xs text-center text-slate-400 dark:text-slate-500 pt-1">
              * Based on 12pp settlement improvement from AI evidence analysis and 60% admin time reduction.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
