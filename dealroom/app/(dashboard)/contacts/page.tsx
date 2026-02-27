import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type RoleBadge = 'Champion' | 'Decision Maker' | 'Influencer' | 'Blocker' | 'End User'
type EngagementLevel = 'High' | 'Medium' | 'Low'

interface Contact {
  id: string
  name: string
  initials: string
  company: string
  title: string
  role: RoleBadge
  engagement: EngagementLevel
  lastContact: string
  email: string
}

const contacts: Contact[] = [
  {
    id: 'ct1',
    name: 'Sarah Chen',
    initials: 'SC',
    company: 'Acme Corp',
    title: 'VP of Engineering',
    role: 'Champion',
    engagement: 'High',
    lastContact: 'Today',
    email: 'sarah.chen@acme.com',
  },
  {
    id: 'ct2',
    name: 'Tom Bradley',
    initials: 'TB',
    company: 'Acme Corp',
    title: 'CFO',
    role: 'Decision Maker',
    engagement: 'Medium',
    lastContact: '2 days ago',
    email: 'tom.bradley@acme.com',
  },
  {
    id: 'ct3',
    name: 'Marcus Lee',
    initials: 'ML',
    company: 'TechFlow Inc',
    title: 'CTO',
    role: 'Decision Maker',
    engagement: 'High',
    lastContact: 'Today',
    email: 'marcus@techflow.io',
  },
  {
    id: 'ct4',
    name: 'David Park',
    initials: 'DP',
    company: 'GlobalSync',
    title: 'Director of Operations',
    role: 'Influencer',
    engagement: 'Low',
    lastContact: '1 week ago',
    email: 'david.park@globalsync.com',
  },
  {
    id: 'ct5',
    name: 'Rachel Kim',
    initials: 'RK',
    company: 'DataVault',
    title: 'Head of Data',
    role: 'Champion',
    engagement: 'Medium',
    lastContact: 'Yesterday',
    email: 'rachel@datavault.io',
  },
  {
    id: 'ct6',
    name: 'Anna Rodriguez',
    initials: 'AR',
    company: 'NovaBridge',
    title: 'Product Manager',
    role: 'End User',
    engagement: 'High',
    lastContact: '3 days ago',
    email: 'anna.r@novabridge.co',
  },
  {
    id: 'ct7',
    name: 'Jason Ng',
    initials: 'JN',
    company: 'Vertex Labs',
    title: 'VP Sales',
    role: 'Influencer',
    engagement: 'Medium',
    lastContact: 'Yesterday',
    email: 'jason.ng@vertexlabs.com',
  },
  {
    id: 'ct8',
    name: 'Carol West',
    initials: 'CW',
    company: 'Vertex Labs',
    title: 'CTO',
    role: 'Decision Maker',
    engagement: 'High',
    lastContact: 'Yesterday',
    email: 'carol@vertexlabs.com',
  },
  {
    id: 'ct9',
    name: 'Frank Miller',
    initials: 'FM',
    company: 'Orbital Systems',
    title: 'Procurement Lead',
    role: 'Blocker',
    engagement: 'Low',
    lastContact: '2 weeks ago',
    email: 'fmiller@orbitalsys.com',
  },
]

function roleBadgeColor(role: RoleBadge): string {
  switch (role) {
    case 'Champion': return 'bg-success-100 text-success-700'
    case 'Decision Maker': return 'bg-brand-100 text-brand-700'
    case 'Influencer': return 'bg-ai-100 text-ai-700'
    case 'Blocker': return 'bg-danger-100 text-danger-700'
    case 'End User': return 'bg-surface-secondary text-text-secondary'
  }
}

function engagementBadge(level: EngagementLevel): { className: string; dotColor: string } {
  switch (level) {
    case 'High': return { className: 'text-success-700', dotColor: 'bg-success-500' }
    case 'Medium': return { className: 'text-warn-700', dotColor: 'bg-warn-400' }
    case 'Low': return { className: 'text-danger-600', dotColor: 'bg-danger-400' }
  }
}

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Contacts</h1>
          <p className="text-text-secondary mt-1">Manage your stakeholders and track engagement.</p>
        </div>
        <Button className="bg-brand-600 text-white hover:bg-brand-700">
          + Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-surface border-border shadow-xs rounded-lg">
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="flex-1 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search contacts by name, company, or email..."
              className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
              <option>All Companies</option>
              <option>Acme Corp</option>
              <option>TechFlow Inc</option>
              <option>GlobalSync</option>
              <option>DataVault</option>
              <option>NovaBridge</option>
              <option>Vertex Labs</option>
              <option>Orbital Systems</option>
            </select>
            <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
              <option>All Roles</option>
              <option>Champion</option>
              <option>Decision Maker</option>
              <option>Influencer</option>
              <option>Blocker</option>
              <option>End User</option>
            </select>
            <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
              <option>Any Engagement</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Contact Table */}
      {contacts.length === 0 ? (
        <Card className="bg-surface border-border shadow-xs rounded-lg">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-1">No contacts yet</h3>
            <p className="text-sm text-text-muted text-center max-w-md">
              Add contacts manually or sync them from your CRM to start tracking stakeholder engagement.
            </p>
            <Button className="mt-4 bg-brand-600 text-white hover:bg-brand-700">
              + Add Contact
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="bg-surface border-border shadow-xs rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-secondary border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Name</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Company</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Title</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Role</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Engagement</th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => {
                  const engagement = engagementBadge(contact.engagement)
                  return (
                    <tr key={contact.id} className="border-b border-border/50 last:border-0 hover:bg-surface-secondary/50 cursor-pointer transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold flex-shrink-0">
                            {contact.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">{contact.name}</p>
                            <p className="text-xs text-text-muted truncate">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-text-primary">{contact.company}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-text-secondary">{contact.title}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${roleBadgeColor(contact.role)} text-xs px-2 py-0.5`}>
                          {contact.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${engagement.dotColor}`} />
                          <span className={`text-sm ${engagement.className}`}>{contact.engagement}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-text-muted">{contact.lastContact}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
