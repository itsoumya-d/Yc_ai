import { BookOpen, Clock, Wrench, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchGuides } from '@/lib/actions/tasks';
import { getTradeLabel, getSkillLevelLabel, getDuration } from '@/lib/utils';

export default async function GuidesPage() {
  const guidesResult = await fetchGuides();
  const guides = guidesResult.success ? guidesResult.data : [];

  // If no specific guide selected, show list
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tasks" className="text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Guides</h1>
          <p className="text-sm text-text-secondary mt-1">Step-by-step trade instructions</p>
        </div>
      </div>

      {guides.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <BookOpen className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No guides available</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {guides.map((guide) => (
            <Card key={guide.id} padding="lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-safety-500" />
                  <CardTitle>{guide.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant="blue">{getTradeLabel(guide.trade)}</Badge>
                  <Badge variant={
                    guide.difficulty === 'beginner' ? 'green' :
                    guide.difficulty === 'intermediate' ? 'blue' :
                    guide.difficulty === 'advanced' ? 'orange' : 'red'
                  }>
                    {getSkillLevelLabel(guide.difficulty)}
                  </Badge>
                </div>
              </CardHeader>

              <p className="text-sm text-text-secondary mb-4">{guide.description}</p>

              <div className="flex flex-wrap gap-4 text-xs text-text-muted mb-4">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {getDuration(guide.estimated_minutes)}
                </span>
                {guide.tools_needed.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Wrench className="h-3.5 w-3.5" />
                    {guide.tools_needed.join(', ')}
                  </span>
                )}
              </div>

              {guide.safety_warnings.length > 0 && (
                <div className="bg-warning-500/10 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-1.5 text-warning-500 text-xs font-medium mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Safety Warnings
                  </div>
                  <ul className="text-xs text-text-secondary space-y-1">
                    {guide.safety_warnings.map((warning, i) => (
                      <li key={i}>- {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="prose prose-sm prose-invert max-w-none text-sm text-text-secondary whitespace-pre-wrap">
                {guide.content}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
