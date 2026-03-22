'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';

const BOARD_SIZES = ['1-5', '6-10', '11-15', '16+'];

export default function OnboardingStep2Page() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [boardSize, setBoardSize] = useState('');

  function handleContinue() {
    sessionStorage.setItem('onboarding_company', companyName);
    sessionStorage.setItem('onboarding_industry', industry);
    sessionStorage.setItem('onboarding_board_size', boardSize);
    router.push('/onboarding/step-3');
  }

  return (
    <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-navy-100">
        <div className="h-full bg-gold-500 transition-all duration-500" style={{ width: '66%' }} />
      </div>
      <div className="p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-400 mb-1">Step 2 of 3</p>
        <Building2 className="h-8 w-8 text-gold-500 mb-3" />
        <h1 className="font-heading text-2xl font-bold text-navy-900 mb-1">About your organisation</h1>
        <p className="text-sm text-navy-500 mb-6">Tell us about your company and board composition.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corporation Ltd"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            >
              <option value="">Select industry...</option>
              <option value="technology">Technology</option>
              <option value="financial_services">Financial Services</option>
              <option value="healthcare">Healthcare</option>
              <option value="real_estate">Real Estate</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="non_profit">Non-Profit</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Board Size</label>
            <div className="grid grid-cols-4 gap-2">
              {BOARD_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setBoardSize(size)}
                  className={`rounded-lg border-2 py-2 text-sm font-medium transition-all ${
                    boardSize === size
                      ? 'border-gold-500 bg-gold-50 text-navy-900'
                      : 'border-gray-200 text-navy-600 hover:border-navy-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/onboarding/step-1')}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
