import { getPublicStory } from '@/lib/actions/sharing';
import { getPublicComments } from '@/lib/actions/comments';
import { createClient } from '@/lib/supabase/server';
import { getGenreLabel, getGenreEmoji, formatWordCount, formatDate } from '@/lib/utils';
import { CommentSection } from '@/components/stories/comment-section';
import { notFound } from 'next/navigation';
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
  };
}

export default async function PublicStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [result, commentsResult] = await Promise.all([
    getPublicStory(id),
    getPublicComments(id),
  ]);

  if (result.error || !result.data) {
    notFound();
  }

  // Get current user (may be null for anonymous readers)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { story, chapters } = result.data;
  const comments = commentsResult.data ?? [];
  const author = story.author_pen_name || story.author_name || 'Anonymous';
  const totalWords = chapters.reduce((sum, ch) => sum + ch.word_count, 0);
  const estimatedReadTime = Math.max(1, Math.round(totalWords / 250));

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            StoryThread
          </a>
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
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>by <span className="font-medium text-gray-700">{author}</span></span>
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
                <span
                  key={tag}
                  className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                >
                  {tag}
                </span>
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
      <div className="mx-auto max-w-3xl px-6 pb-24">
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

      {/* Comments */}
      <CommentSection
        storyId={story.id}
        comments={comments}
        currentUserId={user?.id}
      />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-3xl px-6 text-center text-sm text-gray-500">
          <p>
            &ldquo;{story.title}&rdquo; by {author}
          </p>
          <p className="mt-1">
            Published on {formatDate(story.updated_at)} &middot; Written on{' '}
            <a href="/" className="text-brand-600 hover:underline">StoryThread</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
