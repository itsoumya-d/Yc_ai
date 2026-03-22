import { createClient } from '@/lib/supabase/server';
import { getGenreLabel, getGenreEmoji, formatWordCount } from '@/lib/utils';
import { PageHeader } from '@/components/layout/page-header';
import { BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Discover Stories' };

const genreFilters = [
  { id: 'all', label: 'All Genres' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'sci_fi', label: 'Sci-Fi' },
  { id: 'romance', label: 'Romance' },
  { id: 'mystery', label: 'Mystery' },
  { id: 'thriller', label: 'Thriller' },
  { id: 'horror', label: 'Horror' },
  { id: 'literary', label: 'Literary' },
  { id: 'historical', label: 'Historical' },
  { id: 'adventure', label: 'Adventure' },
];

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; q?: string }>;
}) {
  const params = await searchParams;
  const selectedGenre = params.genre ?? 'all';
  const query = params.q ?? '';

  const supabase = await createClient();

  let dbQuery = supabase
    .from('stories')
    .select('id, title, description, genre, word_count, tags, updated_at, profiles(full_name, pen_name)')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(30);

  if (selectedGenre !== 'all') {
    dbQuery = dbQuery.eq('genre', selectedGenre);
  }

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }

  const { data: stories } = await dbQuery;

  return (
    <div>
      <PageHeader
        title="Discover Stories"
        description="Explore published fiction from writers on StoryThread."
        className="mb-6"
      />

      {/* Genre filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {genreFilters.map((g) => (
          <Link
            key={g.id}
            href={g.id === 'all' ? '/discover' : `/discover?genre=${g.id}`}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              selectedGenre === g.id
                ? 'bg-brand-600 text-white'
                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:border-brand-300 hover:text-brand-600',
            ].join(' ')}
          >
            {g.label}
          </Link>
        ))}
      </div>

      {/* Stories grid */}
      {!stories || stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] py-24 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
          <h3 className="font-heading text-lg font-semibold text-[var(--foreground)]">No stories yet</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {selectedGenre !== 'all'
              ? `No published ${getGenreLabel(selectedGenre)} stories found.`
              : 'No published stories yet. Be the first to publish!'}
          </p>
          <Link
            href="/stories/new"
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Write a Story
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => {
            const profile = Array.isArray(story.profiles) ? story.profiles[0] : story.profiles;
            const authorName = (profile as { pen_name?: string; full_name?: string } | null)?.pen_name
              ?? (profile as { pen_name?: string; full_name?: string } | null)?.full_name
              ?? 'Anonymous';
            const readTime = Math.max(1, Math.round((story.word_count ?? 0) / 250));

            return (
              <Link
                key={story.id}
                href={`/read/${story.id}`}
                className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-brand-200"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-2xl">{getGenreEmoji(story.genre)}</span>
                  <span className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                    {getGenreLabel(story.genre)}
                  </span>
                </div>

                <h3 className="font-heading text-base font-semibold text-[var(--foreground)] group-hover:text-brand-600 transition-colors line-clamp-2">
                  {story.title}
                </h3>

                {story.description && (
                  <p className="mt-2 flex-1 text-sm text-[var(--muted-foreground)] line-clamp-3">
                    {story.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--foreground)]">by {authorName}</span>
                  <div className="flex items-center gap-3">
                    <span>{formatWordCount(story.word_count ?? 0)} words</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {readTime}m
                    </span>
                  </div>
                </div>

                {story.tags && story.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(story.tags as string[]).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
