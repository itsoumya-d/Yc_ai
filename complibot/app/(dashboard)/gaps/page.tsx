import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getGaps } from '@/lib/actions/gaps';
import { ResolveGapButton } from './resolve-gap-button';
import type { GapSeverity } from '@/types/database';

const SEVERITY_CONFIG: Record<GapSeverity, { label: string; variant: 'critical' | 'high' | 'medium' | 'low'; color: string }> = {
  critical: { label: 'Critical', variant: 'critical', color: 'text-red-600' },
  high: { label: 'High', variant: 'high', color: 'text-orange-600' },
  medium: { label: 'Medium', variant: 'medium', color: 'text-amber-600' },
  low: { label: 'Low', variant: 'low', color: 'text-gray-500' },
};

interface GapsPageProps {
  searchParams: Promise<{ show?: string }>;
}

export default async function GapsPage({ searchParams }: GapsPageProps) {
  const params = await searchParams;
  const showResolved = params.show === 'resolved';

  const gaps = await getGaps({ resolved: showResolved });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Gaps</h1>
          <p className="text-sm text-gray-500 mt-1">
            {showResolved ? 'Resolved gaps' : 'Open gaps requiring remediation'}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/gaps"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !showResolved
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Open
          </a>
          <a
            href="/gaps?show=resolved"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showResolved
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Resolved
          </a>
        </div>
      </div>

      {gaps.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            {showResolved ? (
              <>
                <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No resolved gaps yet</p>
                <p className="text-sm text-gray-400 mt-1">Resolved gaps will appear here</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="text-gray-700 font-semibold">No open gaps!</p>
                <p className="text-sm text-gray-400 mt-1">Your compliance is looking great</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {gaps.map(gap => {
            const config = SEVERITY_CONFIG[gap.severity];
            return (
              <Card key={gap.id} className={gap.severity === 'critical' ? 'border-red-200' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <AlertTriangle className={`w-4.5 h-4.5 mt-0.5 shrink-0 ${config.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant={config.variant}>{config.label}</Badge>
                          <h3 className="font-semibold text-gray-900 text-sm">{gap.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{gap.description}</p>

                        {gap.remediation_steps && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Remediation Steps</p>
                            <p className="text-xs text-gray-500 whitespace-pre-line">{gap.remediation_steps}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {gap.estimated_hours}h estimated
                          </span>
                          <span>
                            Added {new Date(gap.created_at).toLocaleDateString()}
                          </span>
                          {gap.resolved && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!gap.resolved && (
                      <div className="shrink-0">
                        <ResolveGapButton gapId={gap.id} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {!showResolved && gaps.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold text-red-600">{gaps.filter(g => g.severity === 'critical').length}</span>
                <span className="text-gray-500 ml-1">Critical</span>
              </div>
              <div>
                <span className="font-semibold text-orange-600">{gaps.filter(g => g.severity === 'high').length}</span>
                <span className="text-gray-500 ml-1">High</span>
              </div>
              <div>
                <span className="font-semibold text-amber-600">{gaps.filter(g => g.severity === 'medium').length}</span>
                <span className="text-gray-500 ml-1">Medium</span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">{gaps.filter(g => g.severity === 'low').length}</span>
                <span className="text-gray-500 ml-1">Low</span>
              </div>
              <div className="ml-auto">
                <span className="font-semibold text-gray-700">{gaps.reduce((s, g) => s + g.estimated_hours, 0)}h</span>
                <span className="text-gray-500 ml-1">total estimated</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
