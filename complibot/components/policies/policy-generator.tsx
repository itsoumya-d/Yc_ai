'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { generateAndSavePolicy } from '@/lib/actions/policies';
import { FRAMEWORK_LABELS, type FrameworkType } from '@/types/database';
import { Sparkles, Loader2, FileText } from 'lucide-react';

interface PolicyGeneratorProps {
  onGenerated?: () => void;
}

const POLICY_TYPES = [
  { value: 'Information Security', category: 'Security', frameworks: ['soc2', 'iso27001', 'hipaa'] },
  { value: 'Access Control', category: 'Security', frameworks: ['soc2', 'iso27001', 'hipaa', 'gdpr'] },
  { value: 'Data Privacy', category: 'Privacy', frameworks: ['gdpr', 'hipaa', 'soc2'] },
  { value: 'Incident Response', category: 'Security', frameworks: ['soc2', 'iso27001', 'hipaa', 'gdpr'] },
  { value: 'Business Continuity', category: 'Operations', frameworks: ['soc2', 'iso27001'] },
  { value: 'Vendor Management', category: 'Governance', frameworks: ['soc2', 'iso27001', 'gdpr'] },
  { value: 'Change Management', category: 'Operations', frameworks: ['soc2', 'iso27001'] },
  { value: 'Acceptable Use', category: 'HR', frameworks: ['soc2', 'iso27001'] },
  { value: 'Data Retention', category: 'Privacy', frameworks: ['gdpr', 'hipaa', 'soc2'] },
  { value: 'Cryptography', category: 'Security', frameworks: ['iso27001', 'soc2', 'hipaa'] },
];

const FRAMEWORKS: FrameworkType[] = ['soc2', 'gdpr', 'hipaa', 'iso27001'];

export function PolicyGenerator({ onGenerated }: PolicyGeneratorProps) {
  const [policyType, setPolicyType] = useState('');
  const [frameworkType, setFrameworkType] = useState<FrameworkType>('soc2');
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleGenerate = () => {
    if (!policyType) {
      showToast('Select a policy type first', 'error');
      return;
    }

    startTransition(async () => {
      const result = await generateAndSavePolicy({
        policyType,
        frameworkType,
        category: POLICY_TYPES.find((p) => p.value === policyType)?.category ?? 'General',
      });

      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast(`${policyType} Policy generated!`, 'success');
        onGenerated?.();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Generate Policy with AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Policy Type</label>
            <select
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select a policy type...</option>
              {POLICY_TYPES.map((p) => (
                <option key={p.value} value={p.value}>{p.value} Policy</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Framework</label>
            <select
              value={frameworkType}
              onChange={(e) => setFrameworkType(e.target.value as FrameworkType)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {FRAMEWORKS.map((fw) => (
                <option key={fw} value={fw}>{FRAMEWORK_LABELS[fw]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-700">
            AI will generate a comprehensive, framework-aligned policy document including purpose, scope,
            roles & responsibilities, procedures, and review schedule.
            <strong className="ml-1">Generation takes ~15-30 seconds.</strong>
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!policyType || isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isPending ? 'Generating Policy...' : 'Generate Policy'}
        </Button>
      </CardContent>
    </Card>
  );
}
