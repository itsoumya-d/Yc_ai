import { getPets } from '@/lib/actions/pets';
import { getSymptoms } from '@/lib/actions/symptoms';
import { PageHeader } from '@/components/layout/page-header';
import { SymptomForm } from '@/components/health/symptom-form';
import { SymptomResult } from '@/components/health/symptom-result';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Symptom Check',
};

export default async function SymptomCheckPage() {
  const [petsResult, symptomsResult] = await Promise.all([
    getPets(),
    getSymptoms(),
  ]);

  const pets = petsResult.data || [];
  const symptoms = symptomsResult.data || [];
  const recentSymptoms = symptoms.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="AI Symptom Checker"
        description="Describe your pet's symptoms and get AI-powered health insights."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Describe Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <SymptomForm pets={pets} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Recent Checks</h3>
          {recentSymptoms.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No symptom checks yet. Submit one to get started.</p>
          ) : (
            recentSymptoms.map((symptom) => (
              <SymptomResult key={symptom.id} symptom={symptom} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
