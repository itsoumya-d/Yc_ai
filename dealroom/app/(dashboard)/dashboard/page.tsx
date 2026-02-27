import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const priorities = [
  { company: 'Acme Corp', deal: 'Enterprise License', amount: 120000, score: 92, health: 'strong' },
  { company: 'TechFlow Inc', deal: 'Platform Migration', amount: 85000, score: 78, health: 'medium' },
  { company: 'GlobalSync', deal: 'Annual Renewal', amount: 64000, score: 65, health: 'at-risk' },
  { company: 'DataVault', deal: 'Data Suite Upsell', amount: 45000, score: 54, health: 'at-risk' },
  { company: 'NovaBridge', deal: 'Pilot Program', amount: 32000, score: 88, health: 'strong' },
]

const pipelineStages = [
  { name: 'Prospecting', deals: 14, value: 420000, percent: 18 },
  { name: 'Qualification', deals: 11, value: 580000, percent: 24 },
  { name: 'Proposal', deals: 8, value: 640000, percent: 27 },
  { name: 'Negotiation', deals: 5, value: 480000, percent: 20 },
  { name: 'Closed Won', deals: 3, value: 270000, percent: 11 },
]

const activities = [
  { type: 'email', icon: '✉', description: 'Email sent to Sarah Chen at Acme Corp', time: '12 min ago' },
  { type: 'call', icon: '📞', description: 'Call completed with TechFlow Inc (32 min)', time: '1 hr ago' },
  { type: 'deal', icon: '📋', description: 'Deal stage moved: GlobalSync to Negotiation', time: '2 hrs ago' },
  { type: 'note', icon: '📝', description: 'Note added on DataVault renewal risk', time: '3 hrs ago' },
  { type: 'meeting', icon: '📅', description: 'Meeting scheduled with NovaBridge for Friday', time: '4 hrs ago' },
  { type: 'ai', icon: '🤖', description: 'AI flagged 2 deals with declining engagement', time: '5 hrs ago' },
]

const aiInsights = [
  'Acme Corp engagement is 40% above average -- high likelihood of close this month.',
  'TechFlow Inc has not responded in 5 days. Consider a follow-up call.',
  '3 deals in Negotiation have stalled beyond the average cycle time.',
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

function healthColor(health: string): string {
  switch (health) {
    case 'strong': return 'bg-success-100 text-success-700'
    case 'medium': return 'bg-warn-100 text-warn-700'
    case 'at-risk': return 'bg-danger-100 text-danger-700'
    default: return 'bg-surface-secondary text-text-secondary'
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return 'bg-success-100 text-success-700'
  if (score >= 60) return 'bg-warn-100 text-warn-700'
  return 'bg-danger-100 text-danger-700'
}

function stageBarColor(index: number): string {
  const colors = ['bg-brand-200', 'bg-brand-300', 'bg-brand-400', 'bg-brand-500', 'bg-success-400']
  return colors[index] || 'bg-brand-300'
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">Welcome back. Here is your sales overview for today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Pipeline */}
        <Card className="bg-surface border-border shadow-xs rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Pipeline</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <p className="text-3xl font-mono font-bold text-text-primary">$2.4M</p>
            <p className="text-sm text-text-muted mt-1">
              <span className="font-mono">41</span> active deals
            </p>
          </div>
        </Card>

        {/* Forecast Q1 */}
        <Card className="bg-surface border-border shadow-xs rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Forecast Q1</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <p className="text-3xl font-mono font-bold text-text-primary">$890K</p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-muted">
                  <span className="font-mono">74%</span> of quota
                </span>
                <span className="font-mono text-text-secondary">$1.2M</span>
              </div>
              <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: '74%' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Deals at Risk */}
        <Card className="bg-surface border-border shadow-xs rounded-lg border-l-4 border-l-danger-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Deals at Risk</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <p className="text-3xl font-mono font-bold text-danger-600">7</p>
            <p className="text-sm text-text-muted mt-1">
              <span className="font-mono text-danger-600">$340K</span> at risk
            </p>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Priorities + Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Priorities */}
          <Card className="bg-surface border-border shadow-xs rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-heading font-semibold text-text-primary">
                  Today&apos;s Priorities
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-brand-600 text-sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                {priorities.map((deal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg hover:bg-brand-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-heading font-semibold text-sm">
                        {deal.company.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{deal.company}</p>
                        <p className="text-xs text-text-muted truncate">{deal.deal}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-mono text-sm font-medium text-text-primary">
                        {formatCurrency(deal.amount)}
                      </span>
                      <Badge className={`${scoreColor(deal.score)} text-xs font-mono px-2 py-0.5`}>
                        {deal.score}
                      </Badge>
                      <Badge className={`${healthColor(deal.health)} text-xs px-2 py-0.5`}>
                        {deal.health === 'at-risk' ? 'At Risk' : deal.health.charAt(0).toUpperCase() + deal.health.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Pipeline by Stage */}
          <Card className="bg-surface border-border shadow-xs rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-heading font-semibold text-text-primary">
                Pipeline by Stage
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-4">
                {pipelineStages.map((stage, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-text-primary">{stage.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted">
                          <span className="font-mono">{stage.deals}</span> deals
                        </span>
                        <span className="font-mono text-sm font-semibold text-text-primary">
                          {formatCurrency(stage.value)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stageBarColor(index)} rounded-full transition-all`}
                        style={{ width: `${stage.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Activity + AI Insights */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="bg-surface border-border shadow-xs rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-heading font-semibold text-text-primary">
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-brand-600 text-sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center text-sm">
                      {activity.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary leading-snug">{activity.description}</p>
                      <p className="text-xs text-text-muted mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="bg-ai-50 border-ai-200 shadow-xs rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <CardTitle className="text-lg font-heading font-semibold text-ai-800">
                    AI Insights
                  </CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-ai-600 text-xs hover:text-ai-800">
                  Dismiss
                </Button>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/60 rounded-lg border border-ai-100"
                  >
                    <p className="text-sm text-ai-900 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" className="mt-4 w-full border-ai-200 text-ai-700 hover:bg-ai-100">
                View All Insights
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
