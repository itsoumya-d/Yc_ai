import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Sentiment = 'positive' | 'neutral' | 'negative'
type Direction = 'sent' | 'received'

interface Email {
  id: string
  sender: string
  senderInitials: string
  company: string
  subject: string
  preview: string
  sentiment: Sentiment
  direction: Direction
  isAiGenerated: boolean
  timestamp: string
  isGhostAlert: boolean
}

const stats = [
  { label: 'Total Emails', value: '1,247', subtext: 'Last 30 days', icon: '✉' },
  { label: 'Avg Response Time', value: '2.4h', subtext: 'Down from 3.1h', icon: '⏱' },
  { label: 'Positive Sentiment', value: '68%', subtext: '+5% vs last month', icon: '😊' },
  { label: 'Ghost Alerts', value: '4', subtext: 'Contacts gone silent', icon: '👻' },
]

const emails: Email[] = [
  {
    id: 'e1',
    sender: 'Sarah Chen',
    senderInitials: 'SC',
    company: 'Acme Corp',
    subject: 'Re: Enterprise License Proposal',
    preview: 'Thanks for sending over the updated pricing. We have reviewed it internally and I wanted to share some feedback...',
    sentiment: 'positive',
    direction: 'received',
    isAiGenerated: false,
    timestamp: '10:23 AM',
    isGhostAlert: false,
  },
  {
    id: 'e2',
    sender: 'You',
    senderInitials: 'You',
    company: 'TechFlow Inc',
    subject: 'Follow-up: Platform Migration Timeline',
    preview: 'Hi Marcus, I wanted to follow up on our conversation last week about the migration timeline. Based on your requirements...',
    sentiment: 'neutral',
    direction: 'sent',
    isAiGenerated: true,
    timestamp: '9:45 AM',
    isGhostAlert: false,
  },
  {
    id: 'e3',
    sender: 'David Park',
    senderInitials: 'DP',
    company: 'GlobalSync',
    subject: 'Re: Annual Renewal Discussion',
    preview: 'I need to be honest with you -- we have been evaluating other options and the budget situation has changed significantly...',
    sentiment: 'negative',
    direction: 'received',
    isAiGenerated: false,
    timestamp: '8:12 AM',
    isGhostAlert: false,
  },
  {
    id: 'e4',
    sender: 'You',
    senderInitials: 'You',
    company: 'NovaBridge',
    subject: 'Pilot Program Kickoff Details',
    preview: 'Great news! I have put together the pilot program timeline and key milestones we discussed. Please review and let me know...',
    sentiment: 'positive',
    direction: 'sent',
    isAiGenerated: true,
    timestamp: 'Yesterday',
    isGhostAlert: false,
  },
  {
    id: 'e5',
    sender: 'Rachel Kim',
    senderInitials: 'RK',
    company: 'DataVault',
    subject: 'Quick question about integrations',
    preview: 'Hey, just wanted to check -- does your platform support direct integration with our existing Snowflake setup? We need to...',
    sentiment: 'neutral',
    direction: 'received',
    isAiGenerated: false,
    timestamp: 'Yesterday',
    isGhostAlert: false,
  },
  {
    id: 'e6',
    sender: 'Mark Johnson',
    senderInitials: 'MJ',
    company: 'Orbital Systems',
    subject: 'Re: Pricing Discussion',
    preview: 'No response in 7 days. Last email was sent requesting updated pricing terms for the enterprise tier.',
    sentiment: 'negative',
    direction: 'sent',
    isAiGenerated: false,
    timestamp: '7 days ago',
    isGhostAlert: true,
  },
]

function sentimentBadge(sentiment: Sentiment) {
  switch (sentiment) {
    case 'positive': return { className: 'bg-success-100 text-success-700', label: 'Positive' }
    case 'neutral': return { className: 'bg-surface-secondary text-text-secondary', label: 'Neutral' }
    case 'negative': return { className: 'bg-danger-100 text-danger-700', label: 'Negative' }
  }
}

export default function EmailsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">Email Intelligence</h1>
        <p className="text-text-secondary mt-1">AI-powered email analytics and engagement tracking.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Filter Bar */}
      <Card className="bg-surface border-border shadow-xs rounded-lg">
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Direction Tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-secondary rounded-lg">
            <Button size="sm" className="bg-brand-600 text-white shadow-xs text-sm px-4">
              All
            </Button>
            <Button variant="ghost" size="sm" className="text-text-secondary text-sm px-4 hover:text-text-primary">
              Sent
            </Button>
            <Button variant="ghost" size="sm" className="text-text-secondary text-sm px-4 hover:text-text-primary">
              Received
            </Button>
          </div>

          {/* Search */}
          <div className="flex-1 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by contact, company, or subject..."
              className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
      </Card>

      {/* Email List */}
      <div className="space-y-2">
        {emails.length === 0 ? (
          <Card className="bg-surface border-border shadow-xs rounded-lg">
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
                <span className="text-3xl">✉</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-1">No emails yet</h3>
              <p className="text-sm text-text-muted text-center max-w-md">
                Connect your email account to start tracking conversations and get AI-powered insights.
              </p>
              <Button className="mt-4 bg-brand-600 text-white hover:bg-brand-700">
                Connect Email
              </Button>
            </div>
          </Card>
        ) : (
          emails.map((email) => {
            const sentiment = sentimentBadge(email.sentiment)
            return (
              <Card
                key={email.id}
                className={`bg-surface border-border shadow-xs rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                  email.isGhostAlert ? 'border-l-4 border-l-danger-400' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      email.direction === 'sent'
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-surface-secondary text-text-primary'
                    }`}>
                      {email.senderInitials}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-text-primary truncate">
                            {email.sender}
                          </span>
                          <span className="text-xs text-text-muted truncate hidden sm:inline">
                            {email.company}
                          </span>
                        </div>
                        <span className="text-xs text-text-muted flex-shrink-0 ml-2">{email.timestamp}</span>
                      </div>

                      <p className="text-sm font-medium text-text-primary mb-1 truncate">{email.subject}</p>
                      <p className="text-sm text-text-muted line-clamp-1">{email.preview}</p>

                      {/* Tags */}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${sentiment.className} text-xs px-2 py-0.5`}>
                          {sentiment.label}
                        </Badge>
                        {email.direction === 'sent' && (
                          <Badge className="bg-brand-50 text-brand-600 text-xs px-2 py-0.5">Sent</Badge>
                        )}
                        {email.isAiGenerated && (
                          <Badge className="bg-ai-100 text-ai-700 text-xs px-2 py-0.5">
                            AI Generated
                          </Badge>
                        )}
                        {email.isGhostAlert && (
                          <Badge className="bg-danger-100 text-danger-700 text-xs px-2 py-0.5">
                            Ghost Alert
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
