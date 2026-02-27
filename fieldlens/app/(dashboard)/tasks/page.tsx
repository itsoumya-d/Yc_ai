import { BookOpen, Clock, Wrench, Shield } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchGuides } from '@/lib/actions/tasks';
import { getTradeLabel, getSkillLevelLabel, getDuration } from '@/lib/utils';

export default async function TasksPage() {
  const guidesResult = await fetchGuides();
  const guides = guidesResult.success ? guidesResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tasks &amp; Guides</h1>
        <p className="text-sm text-text-secondary mt-1">Step-by-step trade guides and learning tasks</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-safety-500">
          <option value="all">All Trades</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="hvac">HVAC</option>
          <option value="carpentry">Carpentry</option>
          <option value="welding">Welding</option>
          <option value="general">General</option>
        </select>
        <select className="rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-safety-500">
          <option value="all">All Difficulty</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      {/* Guide Cards */}
      {guides.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-8">
            <BookOpen className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No guides available yet</p>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((guide) => (
            <Link key={guide.id} href={`/guides?id=${guide.id}`}>
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="blue">{getTradeLabel(guide.trade)}</Badge>
                  <Badge variant={
                    guide.difficulty === 'beginner' ? 'green' :
                    guide.difficulty === 'intermediate' ? 'blue' :
                    guide.difficulty === 'advanced' ? 'orange' : 'red'
                  }>
                    {getSkillLevelLabel(guide.difficulty)}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{guide.title}</h3>
                <p className="text-xs text-text-secondary line-clamp-2 mb-3">{guide.description}</p>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getDuration(guide.estimated_minutes)}
                  </span>
                  {guide.tools_needed.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      {guide.tools_needed.length} tools
                    </span>
                  )}
                  {guide.safety_warnings.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-warning-500">
                      <Shield className="h-3 w-3" />
                      {guide.safety_warnings.length} warnings
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
