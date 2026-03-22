'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, TrendingUp, Users } from 'lucide-react';

const SUBSCRIPTION_MONTHLY = 299;
const SUBSCRIPTION_ANNUAL = SUBSCRIPTION_MONTHLY * 12;
const AUTOMATION_SAVINGS_RATE = 0.7;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ROICalculator() {
  const [boardMembers, setBoardMembers] = useState(8);
  const [meetingsPerYear, setMeetingsPerYear] = useState(6);
  const [prepHoursPerMeeting, setPrepHoursPerMeeting] = useState(20);
  const [hourlyRate, setHourlyRate] = useState(200);

  // Calculations
  const totalPrepHours = boardMembers * prepHoursPerMeeting * meetingsPerYear;
  const hoursSavedAnnually = Math.round(totalPrepHours * AUTOMATION_SAVINGS_RATE);
  const costSaved = hoursSavedAnnually * hourlyRate;
  const netValue = costSaved - SUBSCRIPTION_ANNUAL;
  const roiPct = Math.round((netValue / SUBSCRIPTION_ANNUAL) * 100);
  const isHighROI = roiPct > 200;

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : `$${Math.abs(n).toFixed(0)}`;

  return (
    <section className="py-20 px-6 bg-[#1E3A5F] dark:bg-[#0f2340]">
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
            className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 text-sm font-semibold text-amber-400 mb-4"
          >
            <TrendingUp className="h-4 w-4" />
            ROI Calculator
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl font-extrabold text-white mb-3">
            Calculate Your Board Governance Savings
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-300 max-w-xl mx-auto">
            See exactly how much BoardBrief saves your board in time and money every year.
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
              <Users className="h-5 w-5 text-amber-400" />
              Your Board Profile
            </h3>

            {/* Board members */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Board members</label>
                <span className="text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  {boardMembers}
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={20}
                step={1}
                value={boardMembers}
                onChange={(e) => setBoardMembers(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>3</span>
                <span>20</span>
              </div>
            </div>

            {/* Meetings per year */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Board meetings per year</label>
                <span className="text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  {meetingsPerYear}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                step={1}
                value={meetingsPerYear}
                onChange={(e) => setMeetingsPerYear(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>2</span>
                <span>12</span>
              </div>
            </div>

            {/* Prep hours per meeting */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Hours spent preparing per meeting</label>
                <span className="text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  {prepHoursPerMeeting}h
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                step={5}
                value={prepHoursPerMeeting}
                onChange={(e) => setPrepHoursPerMeeting(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5h</span>
                <span>40h</span>
              </div>
            </div>

            {/* Hourly rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Avg. hourly cost of board members</label>
                <span className="text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  ${hourlyRate}/hr
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={500}
                step={50}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$100</span>
                <span>$500</span>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            className="space-y-4"
            key={`${boardMembers}-${meetingsPerYear}-${prepHoursPerMeeting}-${hourlyRate}`}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Hours saved */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-amber-400" />
                <div className="text-xs text-slate-400">Board Prep Hours Saved Annually</div>
              </div>
              <div className="text-2xl font-extrabold text-amber-400">
                {hoursSavedAnnually.toLocaleString()} hrs
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {AUTOMATION_SAVINGS_RATE * 100}% automation savings — {boardMembers} members × {prepHoursPerMeeting}h × {meetingsPerYear} meetings
              </div>
            </div>

            {/* Cost saved */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <div className="text-xs text-slate-400">Money Saved on Board Prep</div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">{fmt(costSaved)}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {hoursSavedAnnually.toLocaleString()} hours × ${hourlyRate}/hr
              </div>
            </div>

            {/* Net value */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <div className="text-xs text-slate-300">Net Annual Value After Subscription</div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {netValue >= 0 ? fmt(netValue) : `-${fmt(Math.abs(netValue))}`}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                after ${SUBSCRIPTION_ANNUAL.toLocaleString()}/yr BoardBrief Pro subscription
              </div>
            </div>

            {/* ROI badge */}
            <div className="rounded-xl bg-[#0f2340] dark:bg-black/30 text-white p-5 text-center border border-white/10">
              <div
                className={`text-4xl font-extrabold mb-1 ${
                  isHighROI ? 'text-emerald-400' : 'text-amber-400'
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
              * Based on 70% meeting prep automation savings — BoardBrief industry benchmark.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
