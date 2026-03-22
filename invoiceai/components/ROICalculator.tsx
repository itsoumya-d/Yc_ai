'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, TrendingUp, FileText, Zap } from 'lucide-react';

const SUBSCRIPTION_MONTHLY = 49;
const SUBSCRIPTION_ANNUAL = SUBSCRIPTION_MONTHLY * 12; // $588/yr
const DAYS_TO_PAYMENT_REDUCTION = 15;
const COST_OF_CAPITAL = 0.08;
const ADMIN_RATE = 75;
const TIME_AUTOMATION_RATE = 0.6;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ROICalculator() {
  const [invoicesPerMonth, setInvoicesPerMonth] = useState(50);
  const [avgInvoiceValue, setAvgInvoiceValue] = useState(2500);
  const [daysToPayment, setDaysToPayment] = useState(45);
  const [hoursPerMonth, setHoursPerMonth] = useState(12);

  // Calculations
  // Cash flow improvement: InvoiceAI reduces payment time by 15 days
  const cashFlowMonthly =
    invoicesPerMonth * avgInvoiceValue * (DAYS_TO_PAYMENT_REDUCTION / 365) * COST_OF_CAPITAL;
  const cashFlowAnnual = Math.round(cashFlowMonthly * 12);

  // Time saved: 60% of hours automated, valued at $75/hr admin rate
  const hoursSavedPerMonth = hoursPerMonth * TIME_AUTOMATION_RATE;
  const timeSavedAnnual = Math.round(hoursSavedPerMonth * 12 * ADMIN_RATE);

  const totalAnnualValue = cashFlowAnnual + timeSavedAnnual;
  const netValue = totalAnnualValue - SUBSCRIPTION_ANNUAL;
  const roiPct = Math.round((netValue / SUBSCRIPTION_ANNUAL) * 100);
  const isHighROI = roiPct > 300;

  // For display: current days vs improved days
  const improvedDays = Math.max(daysToPayment - DAYS_TO_PAYMENT_REDUCTION, 7);

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : `$${Math.abs(n).toFixed(0)}`;

  return (
    <section className="py-20 px-6 bg-blue-950">
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
            className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-500/30 px-4 py-1.5 text-sm font-semibold text-blue-400 mb-4"
          >
            <TrendingUp className="h-4 w-4" />
            ROI Calculator
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl font-extrabold text-white mb-3">
            Calculate Your Invoicing ROI
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-300 max-w-xl mx-auto">
            See exactly how much faster cash flow and time savings InvoiceAI delivers for your business every year.
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
              <FileText className="h-5 w-5 text-blue-400" />
              Your Billing Profile
            </h3>

            {/* Invoices per month */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Invoices sent per month</label>
                <span className="text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                  {invoicesPerMonth}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={invoicesPerMonth}
                onChange={(e) => setInvoicesPerMonth(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5</span>
                <span>500</span>
              </div>
            </div>

            {/* Average invoice value */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Average invoice value</label>
                <span className="text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                  ${avgInvoiceValue.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={avgInvoiceValue}
                onChange={(e) => setAvgInvoiceValue(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$100</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Current days to payment */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Current days to payment</label>
                <span className="text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                  {daysToPayment} days
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                step={5}
                value={daysToPayment}
                onChange={(e) => setDaysToPayment(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>30 days</span>
                <span>90 days</span>
              </div>
            </div>

            {/* Hours on invoicing per month */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-200">Hours spent on invoicing / month</label>
                <span className="text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                  {hoursPerMonth}h
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={40}
                step={1}
                value={hoursPerMonth}
                onChange={(e) => setHoursPerMonth(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>2h</span>
                <span>40h</span>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            className="space-y-4"
            key={`${invoicesPerMonth}-${avgInvoiceValue}-${daysToPayment}-${hoursPerMonth}`}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Payment speed improvement */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-blue-400" />
                <div className="text-xs text-slate-400">Payment Speed — Days to Payment</div>
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-extrabold text-slate-400 line-through decoration-red-400">
                  {daysToPayment}d
                </div>
                <div className="text-2xl font-extrabold text-blue-400">
                  ~{improvedDays}d
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {DAYS_TO_PAYMENT_REDUCTION}-day reduction — automated reminders + frictionless payment links
              </div>
            </div>

            {/* Cash flow improvement */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-cyan-400" />
                <div className="text-xs text-slate-400">Annual Cash Flow Improvement</div>
              </div>
              <div className="text-2xl font-extrabold text-cyan-400">{fmt(cashFlowAnnual)}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {invoicesPerMonth} invoices/mo × ${avgInvoiceValue.toLocaleString()} × {DAYS_TO_PAYMENT_REDUCTION}d earlier at 8% cost of capital
              </div>
            </div>

            {/* Time saved */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-violet-400" />
                <div className="text-xs text-slate-400">Time Savings Value (Annual)</div>
              </div>
              <div className="text-2xl font-extrabold text-violet-400">{fmt(timeSavedAnnual)}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {Math.round(hoursSavedPerMonth)}h saved/mo × 12 months × ${ADMIN_RATE}/hr admin rate
              </div>
            </div>

            {/* Net value */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <div className="text-xs text-slate-300">Net Annual Value After Subscription</div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {netValue >= 0 ? fmt(netValue) : `-${fmt(Math.abs(netValue))}`}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                after ${SUBSCRIPTION_ANNUAL.toLocaleString()}/yr InvoiceAI Pro subscription
              </div>
            </div>

            {/* ROI badge */}
            <div className="rounded-xl bg-blue-900/60 dark:bg-black/30 text-white p-5 text-center border border-white/10">
              <div
                className={`text-4xl font-extrabold mb-1 ${
                  isHighROI ? 'text-cyan-400' : 'text-blue-400'
                }`}
              >
                {roiPct}%
              </div>
              <div className="text-xs text-slate-400">Annual ROI</div>
              {isHighROI && (
                <div className="mt-2 inline-block text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full">
                  Exceptional ROI
                </div>
              )}
            </div>

            <p className="text-xs text-center text-slate-500 pt-1">
              * Based on 15-day payment reduction and 60% invoicing automation — InvoiceAI industry benchmark.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
