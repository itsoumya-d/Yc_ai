import { getPublicStory } from '@/lib/actions/sharing';
import { getComments, getReactions, isFollowingAuthor } from '@/lib/actions/social';
import { createClient } from '@/lib/supabase/server';
import { getGenreLabel, getGenreEmoji, formatWordCount, formatDate } from '@/lib/utils';
import { StoryReactions } from '@/components/social/story-reactions';
import { StoryComments } from '@/components/social/story-comments';
import { FollowButton } from '@/components/social/follow-button';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicStory(id);
  if (!result.data) return { title: 'Story Not Found' };

  const { story } = result.data;
  const author = story.author_pen_name || story.author_name || 'Anonymous';

  return {
    title: `${story.title} by ${author}`,
    description: story.description || `Read "${story.title}" on StoryThread`,
    openGraph: {
      title: `${story.title} by ${author}`,
      description: story.description || `Read "${story.title}" on StoryThread`,
      type: 'article',
    },
  };
}

export default async function PublicStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Get current user (may be null for unauthenticated visitors)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [storyResult, commentsResult, reactionsResult, followingResult] = await Promise.all([
    getPublicStory(id),
    getComments(id),
    getReactions(id),
    user ? isFollowingAuthor(id) : Promise.resolve({ data: false }),
  ]);

  if (storyResult.error || !storyResult.data) {
    notFound();
  }

  const { story, chapters } = storyResult.data;
  const author = story.author_pen_name || story.author_name || 'Anonymous';
  const totalWords = chapters.reduce((sum, ch) => sum + ch.word_count, 0);
  const estimatedReadTime = Math.max(1, Math.round(totalWords / 250));
  const comments = commentsResult.data ?? [];
  const reactionCounts = reactionsResult.data ?? {
    like: 0, love: 0, fire: 0, mind_blown: 0, sad: 0, userReaction: null,
  };
  const isFollowing = followingResult.data ?? false;

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/discover" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Discover
          </Link>
          <Link href="/discover" className="text-sm font-semibold text-brand-600">
            StoryThread
          </Link>
          <span className="text-xs text-gray-400">
            {getGenreLabel(story.genre)}
          </span>
        </div>
      </header>

      {/* Story Header */}
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-12">
        <div className="text-center">
          <span className="text-4xl mb-4 block">{getGenreEmoji(story.genre)}</span>
          <h1 className="font-serif text-4xl font-bold text-gray-900 leading-tight">
            {story.title}
          </h1>
          {story.description && (
            <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
              {story.description}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 flex-wrap">
            <div className="flex items-center gap-2">
              <span>by <span className="font-medium text-gray-700">{author}</span></span>
              <FollowButton
                authorId={story.user_id}
                initialIsFollowing={isFollowing}
                currentUserId={user?.id}
              />
            </div>
            <span className="text-gray-300">|</span>
            <span>{formatWordCount(totalWords)} words</span>
            <span className="text-gray-300">|</span>
            <span>{estimatedReadTime} min read</span>
            <span className="text-gray-300">|</span>
            <span>{chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}</span>
          </div>
          {story.tags && story.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {story.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/discover?q=${encodeURIComponent(tag)}`}
                  className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table of Contents */}
      {chapters.length > 1 && (
        <nav className="mx-auto max-w-3xl px-6 pb-12">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Table of Contents
            </h2>
            <ol className="space-y-2">
              {chapters.map((chapter, i) => (
                <li key={chapter.id}>
                  <a
                    href={`#chapter-${i + 1}`}
                    className="flex items-center justify-between py-1.5 text-sm hover:text-brand-600 transition-colors"
                  >
                    <span className="text-gray-800">
                      <span className="text-gray-400 mr-2">{i + 1}.</span>
                      {chapter.title}
                    </span>
                    <span className="text-xs text-gray-400 ml-4 shrink-0">
                      {formatWordCount(chapter.word_count)} words
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}

      {/* Chapters */}
      <div className="mx-auto max-w-3xl px-6 pb-12">
        {chapters.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>This story has no published chapters yet.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {chapters.map((chapter, i) => (
              <article key={chapter.id} id={`chapter-${i + 1}`} className="scroll-mt-8">
                <div className="mb-8 text-center">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Chapter {i + 1}
                  </span>
                  <h2 className="mt-2 font-serif text-2xl font-bold text-gray-900">
                    {chapter.title}
                  </h2>
                </div>
                <div className="prose prose-lg max-w-none prose-gray prose-p:leading-relaxed prose-p:text-gray-700 prose-headings:font-serif">
                  {chapter.content.split('\n\n').map((paragraph, pi) => (
                    <p key={pi}>{paragraph}</p>
                  ))}
                </div>
                {i < chapters.length - 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <span className="h-px w-12 bg-gray-300" />
                    <span className="text-gray-300 text-lg">*</span>
                    <span className="h-px w-12 bg-gray-300" />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Reactions */}
      <div className="mx-auto max-w-3xl px-6 pb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">React to this story</h3>
          {user ? (
            <StoryReactions storyId={story.id} initialCounts={reactionCounts} />
          ) : (
            <div className="flex items-center gap-3">
              {['👍', '❤️', '🔥', '🤯', '😢'].map((e) => (
                <span key={e} className="text-2xl opacity-40">{e}</span>
              ))}
              <Link href="/login" className="ml-2 text-sm text-brand-600 hover:underline">
                Sign in to react
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="mx-auto max-w-3xl px-6 pb-24">
        <StoryComments
          storyId={story.id}
          initialComments={comments}
          currentUserId={user?.id}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-3xl px-6 text-center text-sm text-gray-500">
          <p>
            &ldquo;{story.title}&rdquo; by {author}
          </p>
          <p className="mt-1">
            Published on {formatDate(story.updated_at)} &middot; Written on{' '}
            <Link href="/discover" className="text-brand-600 hover:underline">StoryThread</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
