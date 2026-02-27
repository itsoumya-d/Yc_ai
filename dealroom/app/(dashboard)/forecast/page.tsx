import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ForecastCategory {
  category: string
  amount: number
  deals: number
  aiConfidence: number
  repForecast: number
}

interface TeamMember {
  name: string
  initials: string
  pipeline: number
  forecast: number
  quota: number
  attainment: number
}

const forecastCategories: ForecastCategory[] = [
  { category: 'Commit', amount: 420000, deals: 8, aiConfidence: 92, repForecast: 450000 },
  { category: 'Best Case', amount: 280000, deals: 6, aiConfidence: 74, repForecast: 310000 },
  { category: 'Pipeline', amount: 640000, deals: 14, aiConfidence: 45, repForecast: 520000 },
  { category: 'Omit', amount: 150000, deals: 5, aiConfidence: 18, repForecast: 80000 },
]

const teamMembers: TeamMember[] = [
  { name: 'Sarah Chen', initials: 'SC', pipeline: 680000, forecast: 310000, quota: 300000, attainment: 103 },
  { name: 'James Patel', initials: 'JP', pipeline: 520000, forecast: 240000, quota: 300000, attainment: 80 },
  { name: 'Mike Torres', initials: 'MT', pipeline: 440000, forecast: 195000, quota: 300000, attainment: 65 },
  { name: 'Lisa Wang', initials: 'LW', pipeline: 380000, forecast: 145000, quota: 300000, attainment: 48 },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

function confidenceColor(confidence: number): string {
  if (confidence >= 80) return 'bg-success-100 text-success-700'
  if (confidence >= 50) return 'bg-warn-100 text-warn-700'
  return 'bg-danger-100 text-danger-700'
}

function attainmentColor(attainment: number): string {
  if (attainment >= 100) return 'text-success-600'
  if (attainment >= 75) return 'text-warn-600'
  return 'text-danger-600'
}

function attainmentBarColor(attainment: number): string {
  if (attainment >= 100) return 'bg-success-500'
  if (attainment >= 75) return 'bg-warn-400'
  return 'bg-danger-400'
}

function categoryBadgeColor(category: string): string {
  switch (category) {
    case 'Commit': return 'bg-success-100 text-success-700'
    case 'Best Case': return 'bg-brand-100 text-brand-700'
    case 'Pipeline': return 'bg-warn-100 text-warn-700'
    case 'Omit': return 'bg-surface-secondary text-text-muted'
    default: return 'bg-surface-secondary text-text-secondary'
  }
}

export default function ForecastPage() {
  const totalForecast = forecastCategories.reduce((sum, c) => sum + (c.category !== 'Omit' ? c.amount : 0), 0)
  const totalRepForecast = forecastCategories.reduce((sum, c) => sum + (c.category !== 'Omit' ? c.repForecast : 0), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Forecasting</h1>
          <p className="text-text-secondary mt-1">AI-powered revenue forecasting and quota tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
            <option>Q1 2025</option>
            <option>Q2 2025</option>
            <option>Q3 2025</option>
            <option>Q4 2025</option>
          </select>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Forecast */}
        <Card className="bg-ai-50 border-ai-200 shadow-xs rounded-lg">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🤖</span>
              <span className="text-sm font-medium text-ai-700">AI Forecast</span>
            </div>
            <p className="text-3xl font-mono font-bold text-ai-900">$890K</p>
            <p className="text-xs text-ai-600 mt-1">
              Rep forecast: <span className="font-mono">{formatCurrency(totalRepForecast)}</span>
            </p>
          </div>
        </Card>

        {/* Quota */}
        <Card className="bg-surface border-border shadow-xs rounded-lg">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🎯</span>
              <span className="text-sm font-medium text-text-secondary">Quota</span>
            </div>
            <p className="text-3xl font-mono font-bold text-text-primary">$1.2M</p>
            <p className="text-xs text-text-muted mt-1">
              Gap: <span className="font-mono text-danger-600">-$310K</span>
            </p>
          </div>
        </Card>

        {/* Pipeline Coverage */}
        <Card className="bg-surface border-border shadow-xs rounded-lg">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">📊</span>
              <span className="text-sm font-medium text-text-secondary">Pipeline Coverage</span>
            </div>
            <p className="text-3xl font-mono font-bold text-text-primary">3.2x</p>
            <p className="text-xs text-text-muted mt-1">
              Target: <span className="font-mono">3.0x</span> min
            </p>
          </div>
        </Card>
      </div>

      {/* Forecast Breakdown */}
      <Card className="bg-surface border-border shadow-xs rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold text-text-primary">
            Forecast Breakdown
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider pb-3 pr-4">Category</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-4">Amount</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-4">Deals</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-4">AI Confidence</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider pb-3 pl-4">Rep Forecast</th>
                </tr>
              </thead>
              <tbody>
                {forecastCategories.map((row, index) => (
                  <tr key={index} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4">
                      <Badge className={`${categoryBadgeColor(row.category)} text-xs px-2.5 py-0.5`}>
                        {row.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-sm font-semibold text-text-primary">
                        {formatCurrency(row.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-sm text-text-secondary">{row.deals}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge className={`${confidenceColor(row.aiConfidence)} text-xs font-mono px-2 py-0.5`}>
                        {row.aiConfidence}%
                      </Badge>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <span className="font-mono text-sm text-text-secondary">
                        {formatCurrency(row.repForecast)}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-surface-secondary">
                  <td className="py-3 pr-4 font-semibold text-sm text-text-primary">Total (excl. Omit)</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-sm font-bold text-text-primary">{formatCurrency(totalForecast)}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-sm font-semibold text-text-primary">
                      {forecastCategories.filter(c => c.category !== 'Omit').reduce((s, c) => s + c.deals, 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-text-muted">--</span>
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <span className="font-mono text-sm font-bold text-text-primary">{formatCurrency(totalRepForecast)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Team Breakdown */}
      <Card className="bg-surface border-border shadow-xs rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold text-text-primary">
            Team Breakdown
          </CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider pb-3 pr-4">Rep</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-4">Pipeline</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-4">Forecast</th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-4">Quota</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider pb-3 pl-4 min-w-[200px]">Attainment</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, index) => (
                  <tr key={index} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">
                          {member.initials}
                        </div>
                        <span className="text-sm font-medium text-text-primary">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-sm text-text-secondary">{formatCurrency(member.pipeline)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-sm font-semibold text-text-primary">{formatCurrency(member.forecast)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-sm text-text-secondary">{formatCurrency(member.quota)}</span>
                    </td>
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${attainmentBarColor(member.attainment)} rounded-full transition-all`}
                            style={{ width: `${Math.min(member.attainment, 100)}%` }}
                          />
                        </div>
                        <span className={`font-mono text-sm font-semibold ${attainmentColor(member.attainment)} w-12 text-right`}>
                          {member.attainment}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
