import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface StatCard {
  label: string
  value: string
  prevValue: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: string
}

interface WinLossReason {
  reason: string
  percent: number
  count: number
}

interface StageConversion {
  from: string
  to: string
  rate: number
  deals: string
}

const statCards: StatCard[] = [
  { label: 'Win Rate', value: '34%', prevValue: '29%', change: '+5%', changeType: 'positive', icon: '🏆' },
  { label: 'Avg Cycle Time', value: '42 days', prevValue: '48 days', change: '-6 days', changeType: 'positive', icon: '⏱' },
  { label: 'Avg Deal Size', value: '$68K', prevValue: '$54K', change: '+$14K', changeType: 'positive', icon: '💰' },
  { label: 'Activity / Day', value: '15.2', prevValue: '16.8', change: '-1.6', changeType: 'negative', icon: '📊' },
]

const winLossReasons: WinLossReason[] = [
  { reason: 'No Decision', percent: 32, count: 14 },
  { reason: 'Lost to Competitor', percent: 26, count: 11 },
  { reason: 'Budget', percent: 20, count: 9 },
  { reason: 'Timing', percent: 14, count: 6 },
  { reason: 'Champion Left', percent: 8, count: 3 },
]

const stageConversions: StageConversion[] = [
  { from: 'Prospect', to: 'Qualification', rate: 62, deals: '87 / 140' },
  { from: 'Qualification', to: 'Proposal', rate: 48, deals: '42 / 87' },
  { from: 'Proposal', to: 'Negotiation', rate: 55, deals: '23 / 42' },
  { from: 'Negotiation', to: 'Won', rate: 61, deals: '14 / 23' },
]

const activityBreakdown = [
  { type: 'Emails Sent', count: 342, percent: 38 },
  { type: 'Calls Made', count: 156, percent: 17 },
  { type: 'Meetings Held', count: 89, percent: 10 },
  { type: 'Notes Added', count: 214, percent: 24 },
  { type: 'Tasks Completed', count: 98, percent: 11 },
]

function changeColor(type: 'positive' | 'negative' | 'neutral'): string {
  switch (type) {
    case 'positive': return 'text-success-600'
    case 'negative': return 'text-danger-600'
    case 'neutral': return 'text-text-muted'
  }
}

function conversionBarColor(rate: number): string {
  if (rate >= 55) return 'bg-success-400'
  if (rate >= 40) return 'bg-warn-400'
  return 'bg-danger-400'
}

function reasonBarColor(index: number): string {
  const colors = ['bg-danger-400', 'bg-danger-300', 'bg-warn-400', 'bg-warn-300', 'bg-brand-300']
  return colors[index] || 'bg-brand-200'
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary mt-1">Comprehensive performance metrics and trend analysis.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-surface border-border shadow-xs rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-2xl font-mono font-bold text-text-primary">{stat.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-mono font-semibold ${changeColor(stat.changeType)}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-text-muted">vs prev period ({stat.prevValue})</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win/Loss Reasons */}
        <Card className="bg-surface border-border shadow-xs rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold text-text-primary">
              Win/Loss Reasons
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <p className="text-xs text-text-muted mb-4">Based on closed-lost deals in the selected period</p>
            <div className="space-y-4">
              {winLossReasons.map((reason, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-text-primary">{reason.reason}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">
                        <span className="font-mono">{reason.count}</span> deals
                      </span>
                      <span className="font-mono text-sm font-semibold text-text-primary">{reason.percent}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${reasonBarColor(index)} rounded-full transition-all`}
                      style={{ width: `${reason.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Stage Conversion Rates */}
        <Card className="bg-surface border-border shadow-xs rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold text-text-primary">
              Stage Conversion Rates
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <p className="text-xs text-text-muted mb-4">Conversion rates between pipeline stages</p>
            <div className="space-y-5">
              {stageConversions.map((conversion, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-text-primary">
                      {conversion.from} → {conversion.to}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted font-mono">{conversion.deals}</span>
                      <span className="font-mono text-sm font-semibold text-text-primary">{conversion.rate}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${conversionBarColor(conversion.rate)} rounded-full transition-all`}
                      style={{ width: `${conversion.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Funnel Summary */}
            <div className="mt-6 p-3 bg-surface-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Overall Pipeline-to-Win</span>
                <span className="font-mono text-lg font-bold text-text-primary">10%</span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                <span className="font-mono">14</span> wins from <span className="font-mono">140</span> prospects
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <Card className="bg-surface border-border shadow-xs rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold text-text-primary">
            Activity Breakdown
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <p className="text-xs text-text-muted mb-4">Distribution of sales activities in the selected period</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {activityBreakdown.map((activity, index) => (
              <div
                key={index}
                className="p-4 bg-surface-secondary rounded-lg text-center"
              >
                <p className="text-xs font-medium text-text-muted mb-2">{activity.type}</p>
                <p className="text-2xl font-mono font-bold text-text-primary">{activity.count}</p>
                <p className="text-xs text-text-muted mt-1">
                  <span className="font-mono">{activity.percent}%</span> of total
                </p>
              </div>
            ))}
          </div>

          {/* Combined Bar */}
          <div className="mt-4 w-full h-4 bg-surface-secondary rounded-full overflow-hidden flex">
            {activityBreakdown.map((activity, index) => {
              const colors = ['bg-brand-500', 'bg-brand-400', 'bg-brand-300', 'bg-brand-200', 'bg-brand-100']
              return (
                <div
                  key={index}
                  className={`h-full ${colors[index]} transition-all`}
                  style={{ width: `${activity.percent}%` }}
                  title={`${activity.type}: ${activity.percent}%`}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            {activityBreakdown.map((activity, index) => {
              const colors = ['bg-brand-500', 'bg-brand-400', 'bg-brand-300', 'bg-brand-200', 'bg-brand-100']
              return (
                <div key={index} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${colors[index]}`} />
                  <span className="text-xs text-text-muted">{activity.type}</span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
