import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Report {
  id: string
  title: string
  description: string
  icon: string
  audience: string
  audienceColor: string
}

const prebuiltReports: Report[] = [
  {
    id: 'r1',
    title: 'Pipeline Summary',
    description: 'Overview of current pipeline by stage, owner, and time period. Includes deal count, total value, and weighted pipeline metrics.',
    icon: '📊',
    audience: 'Sales Managers',
    audienceColor: 'bg-brand-100 text-brand-700',
  },
  {
    id: 'r2',
    title: 'Forecast vs Actual',
    description: 'Compare AI-generated forecasts with actual closed revenue over time. Tracks forecast accuracy and identifies patterns in over/under prediction.',
    icon: '🎯',
    audience: 'Leadership',
    audienceColor: 'bg-ai-100 text-ai-700',
  },
  {
    id: 'r3',
    title: 'Rep Activity',
    description: 'Detailed breakdown of individual rep activities including emails, calls, meetings, and tasks. Compare productivity across the team.',
    icon: '📈',
    audience: 'Sales Managers',
    audienceColor: 'bg-brand-100 text-brand-700',
  },
  {
    id: 'r4',
    title: 'Deal Velocity',
    description: 'Analyze how quickly deals move through each pipeline stage. Identify bottlenecks and compare cycle times across reps, deal sizes, and segments.',
    icon: '⚡',
    audience: 'Sales Ops',
    audienceColor: 'bg-warn-100 text-warn-700',
  },
  {
    id: 'r5',
    title: 'Win/Loss Analysis',
    description: 'Deep dive into win and loss reasons with trends over time. Includes competitor analysis, common objections, and recommended actions.',
    icon: '🏆',
    audience: 'Leadership',
    audienceColor: 'bg-ai-100 text-ai-700',
  },
  {
    id: 'r6',
    title: 'AI Accuracy',
    description: 'Evaluate the accuracy of AI deal scores, forecasts, and coaching recommendations. Track improvements in model performance over time.',
    icon: '🤖',
    audience: 'Sales Ops',
    audienceColor: 'bg-warn-100 text-warn-700',
  },
  {
    id: 'r7',
    title: 'Coaching Summary',
    description: 'Aggregate coaching insights across the team. Highlights common strengths, improvement areas, and progress on coaching recommendations.',
    icon: '🎓',
    audience: 'Sales Managers',
    audienceColor: 'bg-brand-100 text-brand-700',
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Reports</h1>
          <p className="text-text-secondary mt-1">Generate and view pre-built and custom reports.</p>
        </div>
      </div>

      {/* Pre-built Reports */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Pre-built Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prebuiltReports.map((report) => (
            <Card
              key={report.id}
              className="bg-surface border-border shadow-xs rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center text-xl">
                    {report.icon}
                  </div>
                  <Badge className={`${report.audienceColor} text-xs px-2 py-0.5`}>
                    {report.audience}
                  </Badge>
                </div>
                <h3 className="text-base font-heading font-semibold text-text-primary mb-2">
                  {report.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {report.description}
                </p>
                <Button className="w-full bg-brand-600 text-white hover:bg-brand-700 text-sm">
                  Generate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Reports - Post-MVP Empty State */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Custom Reports</h2>
        <Card className="bg-surface border-border shadow-xs rounded-lg">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-1">Custom Reports Coming Soon</h3>
            <p className="text-sm text-text-muted text-center max-w-md">
              Build your own reports with custom filters, metrics, and visualizations. This feature is planned for a future release.
            </p>
            <Badge className="mt-3 bg-surface-secondary text-text-muted text-xs px-3 py-1">
              Post-MVP
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}
