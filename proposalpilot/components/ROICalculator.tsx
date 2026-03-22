'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, DollarSign, Zap } from 'lucide-react';

const SUBSCRIPTION_MONTHLY = 79;
const SUBSCRIPTION_ANNUAL = SUBSCRIPTION_MONTHLY * 12; // $948/yr

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ROICalculator() {
  const [proposalsPerMonth, setProposalsPerMonth] = useState(20);
  const [avgDealValue, setAvgDealValue] = useState(8000);
  const [hoursPerProposal, setHoursPerProposal] = useState(8);
  const [winRateIncrease, setWinRateIncrease] = useState(15);

  // Calculations
  const timeSavedPerProposal = hoursPerProposal * 0.65; // 65% time reduction
  const totalTimeSavedPerYear = timeSavedPerProposal * proposalsPerMonth * 12;
  const timeValue = totalTimeSavedPerYear * 75; // $75/hr professional rate
  const revenueUplift = proposalsPerMonth * 12 * avgDealValue * (winRateIncrease / 100);
  const totalAnnualValue = timeValue + revenueUplift;
  const netValue = totalAnnualValue - SUBSCRIPTION_ANNUAL;
  const roiPct = Math.round((netValue / SUBSCRIPTION_ANNUAL) * 100);
  const isHighROI = roiPct > 200;

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : `$${Math.abs(n).toFixed(0)}`;

  const fmtHours = (h: number) =>
    h >= 1000 ? `${(h / 1000).toFixed(1)}K` : `${Math.round(h)}`;

  return (
    <section className="py-20 px-6 bg-violet-950">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10%' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 border border-violet-500/30 px-4 py-1.5 text-sm font-semibold text-violet-300 mb-4"
          >
            <TrendingUp className="h-4 w-4" />
            ROI Calculator
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl font-extrabold text-white mb-3">
            Calculate Your Proposal ROI
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-300 max-w-xl mx-auto">
            Faster proposals, higher win rates, bigger revenue — see the exact numbers for your business.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 rounded-2xl border border-white/10 p-7 space-y-6"
          >
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-400" />
              Your Business Profile
            </h3>

            {/* Proposals per month */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Proposals created per month</label>
                <span className="text-sm font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                  {proposalsPerMonth}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={proposalsPerMonth}
                onChange={(e) => setProposalsPerMonth(Number(e.target.value))}
                className="w-full accent-violet-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5</span>
                <span>100</span>
              </div>
            </div>

            {/* Average deal value */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Average deal value</label>
                <span className="text-sm font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                  ${avgDealValue.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={50000}
                step={1000}
                value={avgDealValue}
                onChange={(e) => setAvgDealValue(Number(e.target.value))}
                className="w-full accent-violet-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$1K</span>
                <span>$50K</span>
              </div>
            </div>

            {/* Hours per proposal */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Hours spent creating each proposal today</label>
                <span className="text-sm font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                  {hoursPerProposal}h
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={1}
                value={hoursPerProposal}
                onChange={(e) => setHoursPerProposal(Number(e.target.value))}
                className="w-full accent-violet-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>2h</span>
                <span>20h</span>
              </div>
            </div>

            {/* Win rate increase */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Win rate increase with AI proposals</label>
                <span className="text-sm font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                  +{winRateIncrease}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={winRateIncrease}
                onChange={(e) => setWinRateIncrease(Number(e.target.value))}
                className="w-full accent-violet-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5%</span>
                <span>30%</span>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            className="space-y-4"
            key={`${proposalsPerMonth}-${avgDealValue}-${hoursPerProposal}-${winRateIncrease}`}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Time saved */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-violet-400" />
                <div className="text-xs text-slate-400">Proposal Hours Saved Annually</div>
              </div>
              <div className="text-2xl font-extrabold text-violet-400">
                {fmtHours(totalTimeSavedPerYear)} hrs
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                65% time reduction × {proposalsPerMonth} proposals/mo × 12 months
              </div>
            </div>

            {/* Time value */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <div className="text-xs text-slate-400">Value of Time Saved</div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">{fmt(timeValue)}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {fmtHours(totalTimeSavedPerYear)} hours × $75/hr professional rate
              </div>
            </div>

            {/* Revenue uplift */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <div className="text-xs text-slate-400">Additional Revenue from Higher Win Rate</div>
              </div>
              <div className="text-2xl font-extrabold text-amber-400">{fmt(revenueUplift)}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {proposalsPerMonth} proposals/mo × {avgDealValue >= 1000 ? `$${(avgDealValue / 1000).toFixed(0)}K` : `$${avgDealValue}`} avg deal × +{winRateIncrease}% win rate × 12 months
              </div>
            </div>

            {/* Net value */}
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-5">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-violet-400" />
                <div className="text-xs text-slate-300">Net Annual Value After Subscription</div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {netValue >= 0 ? fmt(netValue) : `-${fmt(Math.abs(netValue))}`}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                after ${SUBSCRIPTION_ANNUAL.toLocaleString()}/yr ProposalPilot Pro subscription
              </div>
            </div>

            {/* ROI badge */}
            <div className="rounded-xl bg-violet-900/60 text-white p-5 text-center border border-white/10">
              <div
                className={`text-4xl font-extrabold mb-1 ${
                  isHighROI ? 'text-emerald-400' : 'text-violet-300'
                }`}
              >
                {roiPct}%
              </div>
              <div className="text-xs text-slate-400">Annual ROI</div>
              {isHighROI && (
                <div className="mt-2 inline-block text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                  Exceptional ROI
                </div>
              )}
            </div>

            <p className="text-xs text-center text-slate-500 pt-1">
              * Based on 65% average time savings and win rate data from 2,000+ ProposalPilot users.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
