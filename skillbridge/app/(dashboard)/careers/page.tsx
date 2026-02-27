'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { CareerCard } from '@/components/careers/career-card';
import { useToast } from '@/components/ui/toast';
import { getCareerMatches, generateAndSaveCareerMatches } from '@/lib/actions/careers';
import { createLearningPlan } from '@/lib/actions/learning';
import { Loader2, RefreshCw, Target } from 'lucide-react';
import type { CareerMatch } from '@/types/database';

export default function CareersPage() {
  const [careers, setCareers] = useState<CareerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    getCareerMatches().then(({ data }) => {
      setCareers(data ?? []);
      setLoading(false);
    });
  }, []);

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateAndSaveCareerMatches();
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        setCareers(result.data ?? []);
        showToast('Career matches generated!', 'success');
      }
    });
  };

  const handleCreatePlan = async (career: CareerMatch) => {
    showToast('Creating learning plan...', 'info');
    const result = await createLearningPlan(career.id, career.career_title);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Learning plan created!', 'success');
      router.push('/learning-plan');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Path Explorer"
        description="AI-powered career matches based on your skills and experience."
        action={
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isPending ? 'Generating...' : careers.length > 0 ? 'Regenerate' : 'Generate Matches'}
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : careers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {careers.map((career) => (
            <CareerCard key={career.id} career={career} onCreatePlan={handleCreatePlan} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No career matches yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            Complete your skills assessment first, then click Generate Matches to see AI-powered career recommendations.
          </p>
          <Button onClick={handleGenerate} disabled={isPending} className="mt-4">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Generate Matches
          </Button>
        </div>
      )}
    </div>
  );
}
