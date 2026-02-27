import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type InsightType = 'strength' | 'improvement' | 'coaching-tip'

interface ScorecardMetric {
  label: string
  value: string
  teamAvg: string
  trend: 'up' | 'down' | 'flat'
  isAboveAvg: boolean
}

interface CoachingInsight {
  type: InsightType
  title: string
  description: string
  action: string
}

const reps = [
  { name: 'Sarah Chen', initials: 'SC' },
  { name: 'James Patel', initials: 'JP' },
  { name: 'Mike Torres', initials: 'MT' },
  { name: 'Lisa Wang', initials: 'LW' },
]

const scorecardMetrics: ScorecardMetric[] = [
  { label: 'Win Rate', value: '34%', teamAvg: '28%', trend: 'up', isAboveAvg: true },
  { label: 'Avg Cycle Time', value: '42 days', teamAvg: '48 days', trend: 'down', isAboveAvg: true },
  { label: 'Activity / Day', value: '18', teamAvg: '15', trend: 'up', isAboveAvg: true },
  { label: 'Multi-Thread Avg', value: '2.8', teamAvg: '3.2', trend: 'flat', isAboveAvg: false },
  { label: 'Overall Grade', value: 'B+', teamAvg: 'B', trend: 'up', isAboveAvg: true },
]

const coachingInsights: CoachingInsight[] = [
  {
    type: 'strength',
    title: 'Strong Discovery Calls',
    description: 'Sarah consistently asks 40% more qualifying questions than the team average during discovery calls. Her talk-to-listen ratio (35:65) is well within the ideal range, leading to higher conversion from Qualification to Proposal stage.',
    action: 'Share best practices with team',
  },
  {
    type: 'improvement',
    title: 'Multi-Threading Needs Attention',
    description: 'Average of 2.8 stakeholders engaged per deal, below the team average of 3.2. Deals with fewer than 3 stakeholders have a 22% lower close rate. Focus on identifying additional champions and decision makers early.',
    action: 'Create stakeholder map',
  },
  {
    type: 'coaching-tip',
    title: 'Optimize Follow-Up Cadence',
    description: 'AI analysis shows Sarah\'s best conversions happen when follow-ups are sent within 2 hours of calls. Current average follow-up time is 6 hours. Setting up automated post-call summaries could help close this gap.',
    action: 'Enable auto-summaries',
  },
  {
    type: 'strength',
    title: 'Excellent Email Engagement',
    description: 'Email response rate of 72% is significantly above the team average of 58%. Subject lines are concise and action-oriented, contributing to high open rates across all deal stages.',
    action: 'View email templates',
  },
  {
    type: 'improvement',
    title: 'Negotiation Stage Stalling',
    description: 'Deals spend an average of 18 days in Negotiation (team avg: 12 days). Consider front-loading pricing discussions earlier in the sales cycle to reduce friction at this stage.',
    action: 'Review stalled deals',
  },
]

function insightBorderColor(type: InsightType): string {
  switch (type) {
    case 'strength': return 'border-l-4 border-l-success-500'
    case 'improvement': return 'border-l-4 border-l-warn-400'
    case 'coaching-tip': return 'border-l-4 border-l-ai-500'
  }
}

function insightBadgeColor(type: InsightType): string {
  switch (type) {
    case 'strength': return 'bg-success-100 text-success-700'
    case 'improvement': return 'bg-warn-100 text-warn-700'
    case 'coaching-tip': return 'bg-ai-100 text-ai-700'
  }
}

function insightLabel(type: InsightType): string {
  switch (type) {
    case 'strength': return 'Strength'
    case 'improvement': return 'Needs Improvement'
    case 'coaching-tip': return 'AI Coaching Tip'
  }
}

function trendIcon(trend: 'up' | 'down' | 'flat'): string {
  switch (trend) {
    case 'up': return '↑'
    case 'down': return '↓'
    case 'flat': return '→'
  }
}

function trendColor(trend: 'up' | 'down' | 'flat', isAboveAvg: boolean): string {
  if (trend === 'flat') return 'text-text-muted'
  return isAboveAvg ? 'text-success-600' : 'text-danger-600'
}

export default function CoachingPage() {
  const hasData = true

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Coaching Hub</h1>
          <p className="text-text-secondary mt-1">AI-powered coaching and performance insights for your team.</p>
        </div>
      </div>

      {/* Rep Selector */}
      <Card className="bg-surface border-border shadow-xs rounded-lg">
        <div className="p-4 flex items-center gap-3">
          <label className="text-sm font-medium text-text-secondary">Select Rep:</label>
          <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300 min-w-[200px]">
            {reps.map((rep) => (
              <option key={rep.initials} value={rep.name}>{rep.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {!hasData ? (
        /* Empty State */
        <Card className="bg-surface border-border shadow-xs rounded-lg">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-1">Insufficient Data</h3>
            <p className="text-sm text-text-muted text-center max-w-md">
              We need at least 2 weeks of activity data to generate coaching insights. Keep using DealRoom and check back soon.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Scorecard */}
          <Card className="bg-surface border-border shadow-xs rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-heading font-semibold text-text-primary">
                  Performance Scorecard
                </CardTitle>
                <Badge className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5">
                  Sarah Chen
                </Badge>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {scorecardMetrics.map((metric, index) => (
                  <div
                    key={index}
                    className="p-4 bg-surface-secondary rounded-lg text-center"
                  >
                    <p className="text-xs font-medium text-text-muted mb-2">{metric.label}</p>
                    <p className="text-2xl font-mono font-bold text-text-primary">{metric.value}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className={`text-xs ${trendColor(metric.trend, metric.isAboveAvg)}`}>
                        {trendIcon(metric.trend)}
                      </span>
                      <span className="text-xs text-text-muted">
                        Team avg: <span className="font-mono">{metric.teamAvg}</span>
                      </span>
                    </div>
                    {metric.isAboveAvg ? (
                      <Badge className="bg-success-50 text-success-600 text-xs px-1.5 py-0 mt-2">Above Avg</Badge>
                    ) : (
                      <Badge className="bg-danger-50 text-danger-600 text-xs px-1.5 py-0 mt-2">Below Avg</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* AI Coaching Insights */}
          <div>
            <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
              AI Coaching Insights
            </h2>
            <div className="space-y-4">
              {coachingInsights.map((insight, index) => (
                <Card
                  key={index}
                  className={`bg-surface border-border shadow-xs rounded-lg ${insightBorderColor(insight.type)}`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${insightBadgeColor(insight.type)} text-xs px-2 py-0.5`}>
                          {insightLabel(insight.type)}
                        </Badge>
                        <h3 className="text-sm font-semibold text-text-primary">{insight.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-brand-600 text-white hover:bg-brand-700 text-xs">
                        {insight.action}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-text-muted text-xs hover:text-text-primary">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
