import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { formatWordCount, formatDate } from '@/lib/utils';
import { BarChart2, Eye, BookOpen, Clock, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return { title: 'Story Analytics' };
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
        <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      </div>
      <p className="mt-3 font-heading text-3xl font-bold text-[var(--foreground)]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{sub}</p>}
    </div>
  );
}

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: story } = await supabase
    .from('stories')
    .select('id, title, genre, status, word_count, created_at, updated_at, author_id')
    .eq('id', id)
    .single();

  if (!story) {
    notFound();
  }

  // Ensure this writer owns the story
  if (story.author_id !== user.id) {
    redirect('/stories');
  }

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, title, word_count, status, created_at, updated_at, order_index')
    .eq('story_id', id)
    .order('order_index');

  const publishedChapters = (chapters ?? []).filter((c) => c.status === 'published');
  const draftChapters = (chapters ?? []).filter((c) => c.status === 'draft');
  const totalWords = (chapters ?? []).reduce((sum, c) => sum + (c.word_count ?? 0), 0);
  const estimatedReadTime = Math.max(1, Math.round(totalWords / 250));

  // Writing velocity: words per chapter on average
  const avgWordsPerChapter =
    chapters && chapters.length > 0 ? Math.round(totalWords / chapters.length) : 0;

  return (
    <div>
      <div className="mb-2">
        <Link href={`/stories/${id}`} className="text-sm text-[var(--muted-foreground)] hover:text-brand-600">
          &larr; Back to story
        </Link>
      </div>
      <PageHeader
        title="Analytics"
        description={`Writing insights for "${story.title}"`}
        className="mb-8"
      />

      {/* Upgrade prompt for non-published stories */}
      {story.status !== 'published' && (
        <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 h-5 w-5 text-brand-600" />
            <div>
              <p className="font-semibold text-brand-700">
                Publish your story to unlock full reader analytics
              </p>
              <p className="mt-1 text-sm text-brand-600">
                Once published, you&apos;ll see reader views, read-through rates, and engagement
                metrics. Upgrade to Pro for advanced analytics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Total Words"
          value={formatWordCount(totalWords)}
          sub={`${totalWords.toLocaleString()} words written`}
        />
        <StatCard
          icon={Clock}
          label="Est. Read Time"
          value={`${estimatedReadTime}m`}
          sub="At 250 words per minute"
        />
        <StatCard
          icon={BarChart2}
          label="Total Chapters"
          value={chapters?.length ?? 0}
          sub={`${publishedChapters.length} published, ${draftChapters.length} draft`}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Words / Chapter"
          value={formatWordCount(avgWordsPerChapter)}
          sub="Your writing consistency"
        />
        <StatCard
          icon={Eye}
          label="Reader Views"
          value={story.status === 'published' ? '—' : 'Not published'}
          sub={story.status === 'published' ? 'Coming soon for Pro plan' : 'Publish to start tracking'}
        />
        <StatCard
          icon={Users}
          label="Unique Readers"
          value={story.status === 'published' ? '—' : 'Not published'}
          sub={story.status === 'published' ? 'Coming soon for Pro plan' : 'Publish to start tracking'}
        />
      </div>

      {/* Chapter breakdown */}
      {chapters && chapters.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-heading text-lg font-semibold text-[var(--foreground)]">
            Chapter Breakdown
          </h2>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">#</th>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">Chapter</th>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">Words</th>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">Status</th>
                  <th className="px-4 py-3 font-medium text-[var(--muted-foreground)]">Updated</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter, i) => (
                  <tr
                    key={chapter.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)] transition-colors"
                  >
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                      <Link
                        href={`/stories/${id}/chapters/${chapter.id}`}
                        className="hover:text-brand-600 hover:underline"
                      >
                        {chapter.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">
                      {(chapter.word_count ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'rounded-full px-2.5 py-0.5 text-xs font-medium',
                          chapter.status === 'published'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-[var(--muted)] text-[var(--muted-foreground)]',
                        ].join(' ')}
                      >
                        {chapter.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">
                      {formatDate(chapter.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Writing timeline */}
      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-1 font-heading text-base font-semibold text-[var(--foreground)]">
          Story Timeline
        </h2>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">Key dates for this story.</p>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Created</span>
            <span className="font-medium text-[var(--foreground)]">{formatDate(story.created_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Last updated</span>
            <span className="font-medium text-[var(--foreground)]">{formatDate(story.updated_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)]">Status</span>
            <span className="font-medium capitalize text-[var(--foreground)]">
              {story.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
