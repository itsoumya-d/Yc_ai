import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type DealHealth = 'strong' | 'medium' | 'at-risk' | 'cold'

interface Deal {
  id: string
  company: string
  amount: number
  score: number
  health: DealHealth
  owner: string
  ownerInitials: string
  lastActivity: string
}

interface Stage {
  name: string
  key: string
  deals: Deal[]
  total: number
}

const stages: Stage[] = [
  {
    name: 'Prospecting',
    key: 'prospecting',
    total: 420000,
    deals: [
      { id: 'd1', company: 'Lumina AI', amount: 45000, score: 72, health: 'medium', owner: 'Sarah Chen', ownerInitials: 'SC', lastActivity: '2h ago' },
      { id: 'd2', company: 'Vertex Labs', amount: 38000, score: 65, health: 'medium', owner: 'Mike Torres', ownerInitials: 'MT', lastActivity: '1d ago' },
      { id: 'd3', company: 'CloudPeak', amount: 62000, score: 58, health: 'cold', owner: 'Sarah Chen', ownerInitials: 'SC', lastActivity: '3d ago' },
    ],
  },
  {
    name: 'Qualification',
    key: 'qualification',
    total: 580000,
    deals: [
      { id: 'd4', company: 'Acme Corp', amount: 120000, score: 85, health: 'strong', owner: 'James Patel', ownerInitials: 'JP', lastActivity: '30m ago' },
      { id: 'd5', company: 'NovaBridge', amount: 32000, score: 78, health: 'strong', owner: 'Lisa Wang', ownerInitials: 'LW', lastActivity: '4h ago' },
    ],
  },
  {
    name: 'Proposal',
    key: 'proposal',
    total: 640000,
    deals: [
      { id: 'd6', company: 'TechFlow Inc', amount: 85000, score: 82, health: 'strong', owner: 'Mike Torres', ownerInitials: 'MT', lastActivity: '1h ago' },
      { id: 'd7', company: 'DataVault', amount: 45000, score: 54, health: 'at-risk', owner: 'James Patel', ownerInitials: 'JP', lastActivity: '5d ago' },
      { id: 'd8', company: 'Orbital Systems', amount: 92000, score: 76, health: 'medium', owner: 'Sarah Chen', ownerInitials: 'SC', lastActivity: '2d ago' },
    ],
  },
  {
    name: 'Negotiation',
    key: 'negotiation',
    total: 480000,
    deals: [
      { id: 'd9', company: 'GlobalSync', amount: 64000, score: 68, health: 'at-risk', owner: 'Lisa Wang', ownerInitials: 'LW', lastActivity: '6h ago' },
      { id: 'd10', company: 'QuantumEdge', amount: 150000, score: 91, health: 'strong', owner: 'James Patel', ownerInitials: 'JP', lastActivity: '45m ago' },
    ],
  },
  {
    name: 'Closed Won',
    key: 'closed-won',
    total: 270000,
    deals: [
      { id: 'd11', company: 'SkyNet Analytics', amount: 78000, score: 98, health: 'strong', owner: 'Sarah Chen', ownerInitials: 'SC', lastActivity: '1d ago' },
      { id: 'd12', company: 'PrimePath', amount: 52000, score: 95, health: 'strong', owner: 'Mike Torres', ownerInitials: 'MT', lastActivity: '2d ago' },
    ],
  },
  {
    name: 'Closed Lost',
    key: 'closed-lost',
    total: 95000,
    deals: [
      { id: 'd13', company: 'IronClad Security', amount: 95000, score: 12, health: 'cold', owner: 'Lisa Wang', ownerInitials: 'LW', lastActivity: '1w ago' },
    ],
  },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

function healthBorderColor(health: DealHealth): string {
  switch (health) {
    case 'strong': return 'border-l-success-500'
    case 'medium': return 'border-l-warn-400'
    case 'at-risk': return 'border-l-danger-500'
    case 'cold': return 'border-l-gray-400'
    default: return 'border-l-gray-300'
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return 'bg-success-100 text-success-700'
  if (score >= 60) return 'bg-warn-100 text-warn-700'
  return 'bg-danger-100 text-danger-700'
}

function stageHeaderColor(key: string): string {
  switch (key) {
    case 'prospecting': return 'bg-brand-100 text-brand-700'
    case 'qualification': return 'bg-brand-200 text-brand-800'
    case 'proposal': return 'bg-brand-300 text-brand-800'
    case 'negotiation': return 'bg-brand-400 text-white'
    case 'closed-won': return 'bg-success-500 text-white'
    case 'closed-lost': return 'bg-danger-100 text-danger-700'
    default: return 'bg-surface-secondary text-text-secondary'
  }
}

export default function DealsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Deals</h1>
          <p className="text-text-secondary mt-1">Manage and track your sales pipeline.</p>
        </div>
        <Button className="bg-brand-600 text-white hover:bg-brand-700">
          + New Deal
        </Button>
      </div>

      {/* View Toggle + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-surface-secondary rounded-lg">
          <Button size="sm" className="bg-brand-600 text-white shadow-xs text-sm px-4">
            Kanban
          </Button>
          <Button variant="ghost" size="sm" className="text-text-secondary text-sm px-4 hover:text-text-primary">
            List
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
            <option>All Owners</option>
            <option>Sarah Chen</option>
            <option>Mike Torres</option>
            <option>James Patel</option>
            <option>Lisa Wang</option>
          </select>
          <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
            <option>Any Amount</option>
            <option>Under $50K</option>
            <option>$50K - $100K</option>
            <option>Over $100K</option>
          </select>
          <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
            <option>Any Health</option>
            <option>Strong</option>
            <option>Medium</option>
            <option>At Risk</option>
            <option>Cold</option>
          </select>
          <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
            <option>Any Close Date</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>Next Quarter</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => (
            <div key={stage.key} className="w-72 flex-shrink-0">
              {/* Stage Header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${stageHeaderColor(stage.key)}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-heading font-semibold">{stage.name}</span>
                  <Badge variant="gray" className="text-xs font-mono px-1.5 py-0 bg-white/20">
                    {stage.deals.length}
                  </Badge>
                </div>
                <span className="text-xs font-mono font-medium">{formatCurrency(stage.total)}</span>
              </div>

              {/* Deal Cards */}
              <div className="bg-surface-secondary rounded-b-lg p-2 space-y-2 min-h-[200px]">
                {stage.deals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                    <p className="text-sm">No deals</p>
                    <p className="text-xs mt-1">Drag a deal here or create a new one</p>
                  </div>
                ) : (
                  stage.deals.map((deal) => (
                    <Card
                      key={deal.id}
                      className={`bg-surface border-border shadow-xs rounded-lg border-l-4 ${healthBorderColor(deal.health)} cursor-pointer hover:shadow-md transition-shadow`}
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-text-primary truncate">{deal.company}</p>
                          </div>
                          <Badge className={`${scoreColor(deal.score)} text-xs font-mono px-1.5 py-0 ml-2 flex-shrink-0`}>
                            {deal.score}
                          </Badge>
                        </div>
                        <p className="font-mono text-base font-semibold text-text-primary mb-3">
                          {formatCurrency(deal.amount)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">
                              {deal.ownerInitials}
                            </div>
                            <span className="text-xs text-text-muted">{deal.owner.split(' ')[0]}</span>
                          </div>
                          <span className="text-xs text-text-muted">{deal.lastActivity}</span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
