'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpen, DollarSign, TrendingUp, Clock } from 'lucide-react';

const SUBSCRIPTION_MONTHLY = 29;
const SUBSCRIPTION_ANNUAL = SUBSCRIPTION_MONTHLY * 12; // $348/yr

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  icon: Icon,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  icon: React.ElementType;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-purple-200">{label}</span>
        </div>
        <span className="text-sm font-bold text-white bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-500/30">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-amber-500"
        style={{
          background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${((value - min) / (max - min)) * 100}%, #3B1D6E ${((value - min) / (max - min)) * 100}%, #3B1D6E 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-purple-500 mt-1">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

export function ROICalculator() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  const [storiesPerMonth, setStoriesPerMonth] = useState(8);
  const [revenuePerStory, setRevenuePerStory] = useState(30);
  const [hoursSaved, setHoursSaved] = useState(6);
  const [hourlyRate, setHourlyRate] = useState(50);

  // Calculations (annualized)
  const annualStories = storiesPerMonth * 12;
  const annualStoryRevenue = annualStories * revenuePerStory;
  const annualTimeSaved = annualStories * hoursSaved * hourlyRate;
  const totalAnnualValue = annualStoryRevenue + annualTimeSaved;
  const netValue = totalAnnualValue - SUBSCRIPTION_ANNUAL;
  const roiPercent = Math.round((netValue / SUBSCRIPTION_ANNUAL) * 100);
  const paybackDays = Math.round((SUBSCRIPTION_ANNUAL / totalAnnualValue) * 365);

  const resultCards = [
    {
      label: 'Story Revenue (Annual)',
      value: formatCurrency(annualStoryRevenue),
      sublabel: `${annualStories} stories/yr × $${revenuePerStory} avg. revenue`,
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
      textColor: 'text-amber-300',
    },
    {
      label: 'Time Value Saved (Annual)',
      value: formatCurrency(annualTimeSaved),
      sublabel: `${annualStories} stories × ${hoursSaved}h saved × $${hourlyRate}/hr`,
      color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
      textColor: 'text-orange-300',
    },
    {
      label: 'Total Annual Value',
      value: formatCurrency(totalAnnualValue),
      sublabel: 'Revenue + time savings combined',
      color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
      textColor: 'text-rose-300',
    },
    {
      label: 'Net Value After Subscription',
      value: formatCurrency(netValue),
      sublabel: `After $${SUBSCRIPTION_MONTHLY}/mo × 12 = ${formatCurrency(SUBSCRIPTION_ANNUAL)}/yr`,
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
      textColor: 'text-emerald-300',
    },
  ];

  return (
    <section className="py-24 bg-purple-950 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-amber-500" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl bg-purple-400" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-5 blur-3xl bg-orange-400" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="h-3.5 w-3.5" />
              ROI Calculator
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              How much is your writing worth?
            </h2>
            <p className="text-lg text-purple-300 max-w-2xl mx-auto">
              Calculate the real value of faster, smarter storytelling — from revenue earned to hours reclaimed with AI assistance.
            </p>
          </motion.div>

          {/* Calculator grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left: Sliders */}
            <div className="rounded-2xl border border-purple-700/50 bg-purple-900/50 backdrop-blur-sm p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold border border-amber-500/30">1</span>
                Your writing output
              </h3>

              <SliderRow
                label="Stories published per month"
                value={storiesPerMonth}
                min={1}
                max={50}
                step={1}
                onChange={setStoriesPerMonth}
                display={`${storiesPerMonth} stories/mo`}
                icon={BookOpen}
              />

              <SliderRow
                label="Avg. revenue per story (monetization)"
                value={revenuePerStory}
                min={5}
                max={200}
                step={5}
                onChange={setRevenuePerStory}
                display={`$${revenuePerStory}`}
                icon={DollarSign}
              />

              <SliderRow
                label="Hours saved per story with AI assistance"
                value={hoursSaved}
                min={1}
                max={20}
                step={1}
                onChange={setHoursSaved}
                display={`${hoursSaved}h saved`}
                icon={Clock}
              />

              <SliderRow
                label="Your hourly writing rate"
                value={hourlyRate}
                min={20}
                max={150}
                step={5}
                onChange={setHourlyRate}
                display={`$${hourlyRate}/hr`}
                icon={TrendingUp}
              />

              <div className="mt-4 p-4 rounded-xl bg-purple-800/40 border border-purple-700/30">
                <p className="text-xs text-purple-500 leading-relaxed">
                  <span className="text-purple-400 font-medium">Assumptions:</span> Story revenue from direct monetization, licensing, or platform payouts. Time value = hours saved with AI writing assistance × your hourly rate, annualized. StoryThread Studio plan at $29/mo.
                </p>
              </div>
            </div>

            {/* Right: Results */}
            <div className="space-y-4">
              {/* Big ROI number */}
              <motion.div
                key={roiPercent}
                initial={{ scale: 0.96, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-8 text-center"
              >
                <div className="text-6xl font-extrabold text-white mb-1">
                  {roiPercent.toLocaleString()}%
                </div>
                <div className="text-amber-400 font-semibold text-lg mb-3">Annual ROI</div>
                <div className="flex items-center justify-center gap-6 text-sm text-purple-300">
                  <div>
                    <span className="block text-emerald-400 font-bold">{formatCurrency(netValue)}</span>
                    <span>net value</span>
                  </div>
                  <div className="w-px h-8 bg-purple-700" />
                  <div>
                    <span className="block text-amber-400 font-bold">{paybackDays} days</span>
                    <span>payback period</span>
                  </div>
                  <div className="w-px h-8 bg-purple-700" />
                  <div>
                    <span className="block text-purple-300 font-bold">{formatCurrency(SUBSCRIPTION_ANNUAL)}</span>
                    <span>annual cost</span>
                  </div>
                </div>
              </motion.div>

              {/* Breakdown cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resultCards.map((card) => (
                  <motion.div
                    key={card.label}
                    className={`rounded-xl border bg-gradient-to-br p-4 ${card.color}`}
                    initial={{ scale: 0.98 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className={`text-xl font-extrabold mb-1 ${card.textColor}`}>
                      {card.value}
                    </div>
                    <div className="text-xs font-semibold text-purple-200 mb-1">{card.label}</div>
                    <div className="text-xs text-purple-500">{card.sublabel}</div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">Ready to write smarter?</div>
                  <div className="text-xs text-purple-400">Start free — no credit card required</div>
                </div>
                <a
                  href="/signup"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-purple-950 bg-amber-400 hover:bg-amber-300 transition-colors whitespace-nowrap shadow-lg shadow-amber-900/30"
                >
                  Start Writing Free
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
