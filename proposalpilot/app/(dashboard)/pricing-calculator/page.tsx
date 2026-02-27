import { PricingCalculator } from '@/components/proposals/pricing-calculator';
import { PageHeader } from '@/components/layout/page-header';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pricing Calculator | ProposalPilot' };

export default function PricingCalculatorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Calculator"
        description="Build and calculate project pricing interactively before adding it to a proposal."
      />
      <PricingCalculator />
    </div>
  );
}
