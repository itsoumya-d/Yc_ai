'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Clock, DollarSign, TrendingUp } from 'lucide-react';

const SUBSCRIPTION_MONTHLY = 19;
const SUBSCRIPTION_ANNUAL = SUBSCRIPTION_MONTHLY * 12; // $228/yr

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ROICalculator() {
  const [numPets, setNumPets] = useState(2);
  const [visitsAvoided, setVisitsAvoided] = useState(3);
  const [avgVisitCost, setAvgVisitCost] = useState(150);
  const [hoursPerMonth, setHoursPerMonth] = useState(5);

  // Calculations
  const vetCostSavings = numPets * visitsAvoided * avgVisitCost;
  const timeValueSaved = hoursPerMonth * 12 * 25; // $25/hr owner time
  const earlyDetectionValue = numPets * 200; // $200/pet/yr
  const totalAnnualValue = vetCostSavings + timeValueSaved + earlyDetectionValue;
  const netValue = totalAnnualValue - SUBSCRIPTION_ANNUAL;
  const roiPct = Math.round((netValue / SUBSCRIPTION_ANNUAL) * 100);
  const isHighROI = roiPct > 200;

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${Math.abs(n).toFixed(0)}`;

  return (
    <section className="py-20 px-6 bg-slate-900">
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
            className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-500/30 px-4 py-1.5 text-sm font-semibold text-teal-400 mb-4"
          >
            <TrendingUp className="h-4 w-4" />
            ROI Calculator
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl font-extrabold text-white mb-3">
            See How Much PetOS Saves You
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-300 max-w-xl mx-auto">
            Between telehealth consults, early detection, and time saved — see exactly what PetOS is worth for your household.
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
              <Heart className="h-5 w-5 text-teal-400" />
              Your Pet Household
            </h3>

            {/* Number of pets */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Number of pets</label>
                <span className="text-sm font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md">
                  {numPets}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={numPets}
                onChange={(e) => setNumPets(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            {/* Vet visits avoided per pet per year */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">In-person vet visits avoided per pet/yr via telehealth</label>
                <span className="text-sm font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md">
                  {visitsAvoided}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={visitsAvoided}
                onChange={(e) => setVisitsAvoided(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1</span>
                <span>6</span>
              </div>
            </div>

            {/* Avg vet visit cost */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Avg. in-person vet visit cost</label>
                <span className="text-sm font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md">
                  ${avgVisitCost}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={avgVisitCost}
                onChange={(e) => setAvgVisitCost(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$50</span>
                <span>$500</span>
              </div>
            </div>

            {/* Hours saved on pet health management per month */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Hours saved on pet health management per month</label>
                <span className="text-sm font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md">
                  {hoursPerMonth}h
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={hoursPerMonth}
                onChange={(e) => setHoursPerMonth(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1h</span>
                <span>20h</span>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            className="space-y-4"
            key={`${numPets}-${visitsAvoided}-${avgVisitCost}-${hoursPerMonth}`}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Vet cost savings */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-teal-400" />
                <div className="text-xs text-slate-400">Vet Visit Cost Savings Annually</div>
              </div>
              <div className="text-2xl font-extrabold text-teal-400">
                {fmt(vetCostSavings)}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {numPets} pet{numPets !== 1 ? 's' : ''} × {visitsAvoided} avoided visit{visitsAvoided !== 1 ? 's' : ''} × ${avgVisitCost}/visit
              </div>
            </div>

            {/* Time value saved */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-cyan-400" />
                <div className="text-xs text-slate-400">Owner Time Value Saved</div>
              </div>
              <div className="text-2xl font-extrabold text-cyan-400">{fmt(timeValueSaved)}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {hoursPerMonth}h/mo × 12 months × $25/hr
              </div>
            </div>

            {/* Early detection value */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-emerald-400" />
                <div className="text-xs text-slate-400">Early Disease Detection Value</div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">{fmt(earlyDetectionValue)}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {numPets} pet{numPets !== 1 ? 's' : ''} × $200/yr avg. early detection savings
              </div>
            </div>

            {/* Net value */}
            <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-teal-400" />
                <div className="text-xs text-slate-300">Net Annual Value After Subscription</div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {netValue >= 0 ? fmt(netValue) : `-${fmt(Math.abs(netValue))}`}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                after ${SUBSCRIPTION_ANNUAL}/yr PetOS Family plan subscription
              </div>
            </div>

            {/* ROI badge */}
            <div className="rounded-xl bg-slate-800 text-white p-5 text-center border border-white/10">
              <div
                className={`text-4xl font-extrabold mb-1 ${
                  isHighROI ? 'text-emerald-400' : 'text-teal-400'
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
              * Estimates based on U.S. national averages for veterinary costs and telehealth adoption data.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
