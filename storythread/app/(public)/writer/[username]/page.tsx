import { createClient } from '@/lib/supabase/server';
import { getGenreLabel, getGenreEmoji, formatWordCount, formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Feather } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} | StoryThread Writer`,
    description: `Read stories by ${username} on StoryThread.`,
  };
}

export default async function WriterProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // Look up profile by pen_name or username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, pen_name, bio, created_at')
    .or(`pen_name.eq.${username},full_name.eq.${username}`)
    .single();

  if (!profile) {
    notFound();
  }

  // Get published stories for this writer
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, description, genre, word_count, tags, updated_at, status')
    .eq('author_id', profile.id)
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  const displayName = profile.pen_name ?? profile.full_name ?? username;
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const totalWords = (stories ?? []).reduce((sum, s) => sum + (s.word_count ?? 0), 0);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold text-brand-600">
            <Feather className="h-4 w-4" />
            StoryThread
          </Link>
          <Link href="/discover" className="text-sm text-[var(--muted-foreground)] hover:text-brand-600">
            Discover Stories
          </Link>
        </div>
      </header>

      {/* Writer hero */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-100 font-heading text-2xl font-bold text-brand-700">
              {initials}
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{displayName}</h1>
              {profile.bio && (
                <p className="mt-2 max-w-xl text-[var(--muted-foreground)]">{profile.bio}</p>
              )}
              <div className="mt-4 flex gap-6 text-sm text-[var(--muted-foreground)]">
                <span>
                  <strong className="text-[var(--foreground)]">{stories?.length ?? 0}</strong> stories
                </span>
                <span>
                  <strong className="text-[var(--foreground)]">{formatWordCount(totalWords)}</strong> words published
                </span>
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stories */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="mb-6 font-heading text-lg font-semibold text-[var(--foreground)]">
          Published Stories
        </h2>

        {!stories || stories.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-[var(--border)] py-16 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-[var(--muted-foreground)]" />
            <p className="text-[var(--muted-foreground)]">No published stories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/read/${story.id}`}
                className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] hover:border-brand-200"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xl">{getGenreEmoji(story.genre)}</span>
                  <span className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                    {getGenreLabel(story.genre)}
                  </span>
                </div>
                <h3 className="font-heading text-base font-semibold text-[var(--foreground)] group-hover:text-brand-600 transition-colors">
                  {story.title}
                </h3>
                {story.description && (
                  <p className="mt-2 text-sm text-[var(--muted-foreground)] line-clamp-2">
                    {story.description}
                  </p>
                )}
                <div className="mt-4 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted-foreground)]">
                  {formatWordCount(story.word_count ?? 0)} words &middot; Updated {formatDate(story.updated_at)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
