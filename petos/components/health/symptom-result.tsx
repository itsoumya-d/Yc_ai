import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Symptom } from '@/types/database';

interface SymptomResultProps {
  symptom: Symptom;
  className?: string;
}

export function SymptomResult({ symptom, className }: SymptomResultProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">AI Analysis</CardTitle>
          <Badge variant={symptom.severity as 'mild' | 'moderate' | 'severe' | 'emergency'}>
            {symptom.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-[var(--foreground)]">Symptoms Described</h4>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{symptom.description}</p>
        </div>

        {symptom.ai_analysis && (
          <div>
            <h4 className="text-sm font-medium text-[var(--foreground)]">Analysis</h4>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{symptom.ai_analysis}</p>
          </div>
        )}

        {symptom.ai_recommendation && (
          <div>
            <h4 className="text-sm font-medium text-[var(--foreground)]">Recommendation</h4>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{symptom.ai_recommendation}</p>
          </div>
        )}

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs text-amber-800">
            <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and does not replace professional veterinary advice. Please consult your veterinarian for proper diagnosis and treatment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
