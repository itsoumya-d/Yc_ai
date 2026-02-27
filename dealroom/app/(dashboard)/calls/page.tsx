import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type CallStatus = 'scheduled' | 'completed' | 'missed'
type RecordingStatus = 'available' | 'processing' | 'none'

interface Call {
  id: string
  title: string
  participants: string[]
  duration: string
  status: CallStatus
  recordingStatus: RecordingStatus
  scheduledAt: string
  aiSummary: string | null
  deal: string
}

const stats = [
  { label: 'Total Calls', value: '86', subtext: 'Last 30 days', icon: '📞' },
  { label: 'Avg Duration', value: '24m', subtext: 'Up from 19m', icon: '⏱' },
  { label: 'Recordings Pending', value: '3', subtext: 'Processing now', icon: '🔴' },
]

const calls: Call[] = [
  {
    id: 'c1',
    title: 'Enterprise License Review',
    participants: ['Sarah Chen', 'Tom Bradley', 'You'],
    duration: '42:15',
    status: 'completed',
    recordingStatus: 'available',
    scheduledAt: 'Today, 10:00 AM',
    aiSummary: 'Positive discussion on pricing. Sarah confirmed budget approval is expected by end of week. Next step: send revised SOW by Thursday.',
    deal: 'Acme Corp',
  },
  {
    id: 'c2',
    title: 'Platform Demo - Technical Deep Dive',
    participants: ['Marcus Lee', 'Engineering Team', 'You'],
    duration: '58:30',
    status: 'completed',
    recordingStatus: 'processing',
    scheduledAt: 'Today, 8:30 AM',
    aiSummary: 'Technical requirements discussed in detail. Integration concerns raised about API rate limits. Follow-up demo with DevOps team requested.',
    deal: 'TechFlow Inc',
  },
  {
    id: 'c3',
    title: 'Quarterly Business Review',
    participants: ['David Park', 'VP Sales', 'You'],
    duration: '--:--',
    status: 'scheduled',
    recordingStatus: 'none',
    scheduledAt: 'Today, 2:00 PM',
    aiSummary: null,
    deal: 'GlobalSync',
  },
  {
    id: 'c4',
    title: 'Pilot Program Check-in',
    participants: ['Anna Rodriguez', 'You'],
    duration: '--:--',
    status: 'scheduled',
    recordingStatus: 'none',
    scheduledAt: 'Today, 4:30 PM',
    aiSummary: null,
    deal: 'NovaBridge',
  },
  {
    id: 'c5',
    title: 'Renewal Discussion',
    participants: ['Rachel Kim', 'You'],
    duration: '00:00',
    status: 'missed',
    recordingStatus: 'none',
    scheduledAt: 'Yesterday, 3:00 PM',
    aiSummary: null,
    deal: 'DataVault',
  },
  {
    id: 'c6',
    title: 'Discovery Call - New Opportunity',
    participants: ['Jason Ng', 'Carol West', 'You'],
    duration: '31:47',
    status: 'completed',
    recordingStatus: 'available',
    scheduledAt: 'Yesterday, 11:00 AM',
    aiSummary: 'Strong interest in analytics module. Budget confirmed at $60-80K range. Decision expected in 3 weeks. Key stakeholder: CTO Carol West.',
    deal: 'Vertex Labs',
  },
]

function statusBadge(status: CallStatus) {
  switch (status) {
    case 'scheduled': return { className: 'bg-brand-100 text-brand-700', label: 'Scheduled' }
    case 'completed': return { className: 'bg-success-100 text-success-700', label: 'Completed' }
    case 'missed': return { className: 'bg-danger-100 text-danger-700', label: 'Missed' }
  }
}

function recordingBadge(status: RecordingStatus) {
  switch (status) {
    case 'available': return { className: 'bg-success-50 text-success-600', label: 'Recording Available', icon: '▶' }
    case 'processing': return { className: 'bg-warn-50 text-warn-600', label: 'Processing...', icon: '⏳' }
    case 'none': return null
  }
}

export default function CallsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">Call Intelligence</h1>
        <p className="text-text-secondary mt-1">Track calls, review recordings, and get AI-powered summaries.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-surface border-border shadow-xs rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-2xl font-mono font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.subtext}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface-secondary rounded-lg w-fit">
        <Button size="sm" className="bg-brand-600 text-white shadow-xs text-sm px-4">
          All
        </Button>
        <Button variant="ghost" size="sm" className="text-text-secondary text-sm px-4 hover:text-text-primary">
          Scheduled
        </Button>
        <Button variant="ghost" size="sm" className="text-text-secondary text-sm px-4 hover:text-text-primary">
          Completed
        </Button>
        <Button variant="ghost" size="sm" className="text-text-secondary text-sm px-4 hover:text-text-primary">
          Missed
        </Button>
      </div>

      {/* Call List */}
      <div className="space-y-3">
        {calls.length === 0 ? (
          <Card className="bg-surface border-border shadow-xs rounded-lg">
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
                <span className="text-3xl">📞</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-1">No calls yet</h3>
              <p className="text-sm text-text-muted text-center max-w-md">
                Connect your calendar and phone system to start tracking calls and get AI-powered insights.
              </p>
              <Button className="mt-4 bg-brand-600 text-white hover:bg-brand-700">
                Connect Calendar
              </Button>
            </div>
          </Card>
        ) : (
          calls.map((call) => {
            const status = statusBadge(call.status)
            const recording = recordingBadge(call.recordingStatus)
            return (
              <Card
                key={call.id}
                className={`bg-surface border-border shadow-xs rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                  call.status === 'missed' ? 'border-l-4 border-l-danger-400' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-text-primary truncate">{call.title}</h3>
                        <Badge className={`${status.className} text-xs px-2 py-0.5 flex-shrink-0`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted">
                        {call.deal} &middot; {call.participants.join(', ')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-mono text-sm font-semibold text-text-primary">{call.duration}</p>
                      <p className="text-xs text-text-muted">{call.scheduledAt}</p>
                    </div>
                  </div>

                  {/* Recording Status */}
                  {recording && (
                    <div className="mt-2">
                      <Badge className={`${recording.className} text-xs px-2 py-0.5`}>
                        {recording.icon} {recording.label}
                      </Badge>
                    </div>
                  )}

                  {/* AI Summary */}
                  {call.aiSummary && (
                    <div className="mt-3 p-3 bg-ai-50 border border-ai-100 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">🤖</span>
                        <span className="text-xs font-semibold text-ai-700">AI Summary</span>
                      </div>
                      <p className="text-sm text-ai-900 leading-relaxed">{call.aiSummary}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {call.status === 'completed' && (
                    <div className="flex items-center gap-2 mt-3">
                      {call.recordingStatus === 'available' && (
                        <Button variant="secondary" size="sm" className="text-xs border-border text-text-secondary hover:text-text-primary">
                          Play Recording
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" className="text-xs border-border text-text-secondary hover:text-text-primary">
                        View Full Summary
                      </Button>
                    </div>
                  )}
                  {call.status === 'missed' && (
                    <div className="mt-3">
                      <Button variant="secondary" size="sm" className="text-xs border-danger-200 text-danger-600 hover:bg-danger-50">
                        Reschedule Call
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
