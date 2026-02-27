import { getDiscoveryStories } from '@/lib/actions/social';
import { getGenreLabel, getGenreEmoji, formatWordCount, formatRelativeTime } from '@/lib/utils/index';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Discover Stories | StoryThread',
  description: 'Explore published stories from writers around the world on StoryThread.',
};

const GENRES = [
  { value: 'all', label: 'All Genres' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'sci_fi', label: 'Science Fiction' },
  { value: 'romance', label: 'Romance' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'horror', label: 'Horror' },
  { value: 'literary', label: 'Literary' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'historical', label: 'Historical' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
];

interface PageProps {
  searchParams: Promise<{ genre?: string; q?: string; sort?: string }>;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const genre = params.genre || 'all';
  const search = params.q || '';
  const sortBy = (params.sort as 'latest' | 'popular' | 'trending') || 'latest';

  const result = await getDiscoveryStories({ genre, search, sortBy, limit: 24 });
  const stories = result.data?.stories ?? [];
  const total = result.data?.total ?? 0;

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-serif text-lg font-bold text-gray-900 shrink-0">
            <span className="text-brand-600">✦</span> StoryThread
          </Link>

          {/* Search */}
          <form method="GET" action="/discover" className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                name="q"
                defaultValue={search}
                placeholder="Search stories..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
              {genre !== 'all' && <input type="hidden" name="genre" value={genre} />}
              {sortBy !== 'latest' && <input type="hidden" name="sort" value={sortBy} />}
            </div>
          </form>

          <Link href="/login" className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700">
            Sign in to write
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-gray-900">
            Discover Stories
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            {total > 0 ? `${total.toLocaleString()} published stories from writers worldwide` : 'Explore published stories from writers worldwide'}
          </p>
        </div>

        {/* Genre Filter */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {GENRES.map((g) => (
            <Link
              key={g.value}
              href={`/discover?genre=${g.value}${search ? `&q=${encodeURIComponent(search)}` : ''}${sortBy !== 'latest' ? `&sort=${sortBy}` : ''}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                genre === g.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {g.label}
            </Link>
          ))}
        </div>

        {/* Sort */}
        <div className="mb-8 flex items-center gap-3 text-sm">
          <span className="text-gray-500">Sort by:</span>
          {(['latest', 'popular', 'trending'] as const).map((s) => (
            <Link
              key={s}
              href={`/discover?sort=${s}${genre !== 'all' ? `&genre=${genre}` : ''}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
              className={`capitalize ${
                sortBy === s
                  ? 'font-semibold text-brand-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Story Grid */}
        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">📚</span>
            <h2 className="text-xl font-semibold text-gray-700">No stories found</h2>
            <p className="mt-2 text-gray-500">
              {search ? `No results for "${search}"` : 'Be the first to publish a story in this genre!'}
            </p>
            <Link
              href="/discover"
              className="mt-6 rounded-full bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Browse all stories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => {
              const author = story.author_pen_name || story.author_name || 'Anonymous';
              const estimatedReadTime = Math.max(1, Math.round(story.total_word_count / 250));

              return (
                <Link
                  key={story.id}
                  href={`/read/${story.id}`}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
                >
                  {/* Genre emoji + genre label */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{getGenreEmoji(story.genre)}</span>
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      {getGenreLabel(story.genre)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-serif text-lg font-bold text-gray-900 leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
                    {story.title}
                  </h2>

                  {/* Description */}
                  {story.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-1">
                      {story.description}
                    </p>
                  )}

                  {/* Tags */}
                  {story.tags && story.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {story.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span className="font-medium text-gray-600">by {author}</span>
                    <div className="flex items-center gap-2">
                      <span>{formatWordCount(story.total_word_count)} words</span>
                      <span>·</span>
                      <span>{estimatedReadTime}m read</span>
                      {story.chapter_count > 0 && (
                        <>
                          <span>·</span>
                          <span>{story.chapter_count} ch.</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 py-8 text-center text-sm text-gray-400">
          <p>
            <Link href="/" className="text-brand-600 hover:underline">StoryThread</Link>
            {' — '}Where stories come alive
          </p>
        </footer>
      </div>
    </div>
  );
}
