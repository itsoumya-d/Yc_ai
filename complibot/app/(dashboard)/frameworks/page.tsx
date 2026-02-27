import { Shield } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const frameworks = [
  {
    id: 'soc2',
    emoji: '\u{1F6E1}\u{FE0F}',
    name: 'SOC 2',
    description: 'Service Organization Control 2 - Trust Services Criteria',
    bestFor: 'SaaS companies selling to US enterprise customers',
    effort: 'Medium-High',
    timeline: '8-12 weeks',
  },
  {
    id: 'gdpr',
    emoji: '\u{1F1EA}\u{1F1FA}',
    name: 'GDPR',
    description: 'General Data Protection Regulation - EU data privacy framework',
    bestFor: 'Companies processing EU personal data',
    effort: 'Medium',
    timeline: '6-10 weeks',
  },
  {
    id: 'hipaa',
    emoji: '\u{1FA7A}',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    bestFor: 'Healthcare and health-tech companies in the US',
    effort: 'High',
    timeline: '10-16 weeks',
  },
  {
    id: 'iso27001',
    emoji: '\u{1F310}',
    name: 'ISO 27001',
    description: 'International information security management standard',
    bestFor: 'Companies with global enterprise customers',
    effort: 'High',
    timeline: '12-20 weeks',
  },
];

export default function FrameworksPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Compliance Frameworks</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Choose the frameworks that apply to your business
          </p>
        </div>
        <Button>
          <Shield className="h-4 w-4" />
          Select Framework
        </Button>
      </div>

      {/* Framework Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {frameworks.map((fw) => (
          <Card key={fw.id} hover className="flex flex-col">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{fw.emoji}</span>
                <div>
                  <CardTitle>{fw.name}</CardTitle>
                  <p className="mt-0.5 text-sm text-text-secondary">{fw.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-2 space-y-2 text-sm">
              <div>
                <span className="font-medium text-text-primary">Best for: </span>
                <span className="text-text-secondary">{fw.bestFor}</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-medium text-text-primary">Effort: </span>
                  <Badge variant={fw.effort === 'High' ? 'amber' : fw.effort === 'Medium-High' ? 'amber' : 'green'}>
                    {fw.effort}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Timeline: </span>
                  <span className="text-text-secondary">{fw.timeline}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-3 border-t border-border pt-4 mt-4">
              <Button size="sm">Select</Button>
              <Button variant="ghost" size="sm">Learn More</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Frameworks */}
      <Card>
        <CardTitle>Selected Frameworks</CardTitle>
        <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
          <Shield className="mb-3 h-10 w-10 text-text-muted" />
          <p className="text-sm font-medium text-text-secondary">No frameworks selected</p>
          <p className="mt-1 text-xs text-text-muted">
            Select one or more frameworks above to begin your compliance journey
          </p>
        </div>
      </Card>
    </div>
  );
}
