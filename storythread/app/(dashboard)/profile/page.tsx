import Link from 'next/link';
import { BookOpen, Settings, PenTool, Layers, FileText, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/actions/dashboard';
import { getStories } from '@/lib/actions/stories';

function UserInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-bold">
      {initials}
    </div>
  );
}

function formatWordCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-[var(--muted-foreground)]">Please sign in to view your profile.</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, bio, created_at')
    .eq('id', user.id)
    .single();

  const [dashResult, storiesResult] = await Promise.all([
    getDashboardData(),
    getStories(),
  ]);

  const dash = dashResult.data;
  const stories = storiesResult.data ?? [];
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Writer';
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  // Compute genre distribution from stories
  const genreCounts: Record<string, number> = {};
  for (const story of stories) {
    const genre = story.genre || 'Uncategorized';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  }
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  const publishedStories = stories.filter(s => s.is_public);
  const draftStories = stories.filter(s => !s.is_public);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">My Profile</h1>
        <Link
          href="/profile/settings"
          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--accent)] rounded-lg transition-colors"
        >
          <Settings size={16} />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex flex-col items-center text-center">
              <UserInitials name={displayName} />
              <h2 className="text-lg font-bold text-[var(--foreground)] mt-3">{displayName}</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">{user.email}</p>
              {profile?.bio && (
                <p className="text-sm text-[var(--muted-foreground)] text-center leading-relaxed">{profile.bio}</p>
              )}
              <p className="text-xs text-[var(--muted-foreground)] mt-3">Member since {joinedDate}</p>
            </div>
          </div>

          {/* Writing Stats */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Writing Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  <BookOpen size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{dash?.storyCount ?? 0} stories</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{publishedStories.length} published</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <PenTool size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{formatWordCount(dash?.totalWordCount ?? 0)} words</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Total written</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Layers size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{dash?.totalChapters ?? 0} chapters</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Across all stories</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Genres */}
          {topGenres.length > 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Top Genres</h3>
              <div className="flex flex-wrap gap-2">
                {topGenres.map(genre => (
                  <span
                    key={genre}
                    className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Stories */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-brand-600" />
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Recent Stories</h3>
            </div>
            {(dash?.recentStories ?? []).length === 0 ? (
              <div className="text-center py-8">
                <FileText size={32} className="text-[var(--muted-foreground)] mx-auto mb-2 opacity-40" />
                <p className="text-sm text-[var(--muted-foreground)]">No stories yet. Start writing!</p>
                <Link
                  href="/stories"
                  className="inline-block mt-3 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Create Your First Story
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(dash?.recentStories ?? []).map(story => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="flex items-center gap-4 p-3 bg-[var(--background)] rounded-lg hover:bg-[var(--accent)] transition-colors group"
                  >
                    <div className="text-2xl w-10 text-center">
                      {story.genre === 'Science Fiction' ? '\u{1F30C}' :
                       story.genre === 'Fantasy' ? '\u2694\uFE0F' :
                       story.genre === 'Mystery' ? '\u{1F50D}' :
                       story.genre === 'Romance' ? '\u{1F495}' :
                       story.genre === 'Horror' ? '\u{1F47B}' :
                       story.genre === 'Thriller' ? '\u{1F525}' : '\u{1F4D6}'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--foreground)] truncate group-hover:text-brand-600 transition-colors">
                        {story.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {story.genre || 'Uncategorized'} &middot; {story.chapter_count ?? 0} chapters &middot; {formatWordCount(story.total_word_count ?? 0)} words
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        story.is_public
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {story.is_public ? 'Published' : 'Draft'}
                      </span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(story.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Drafts */}
          {draftStories.length > 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-orange-500" />
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Works in Progress</h3>
                <span className="ml-auto text-xs text-[var(--muted-foreground)] bg-[var(--accent)] px-2 py-0.5 rounded-full">
                  {draftStories.length}
                </span>
              </div>
              <div className="space-y-2">
                {draftStories.slice(0, 5).map(story => (
                  <Link
                    key={story.id}
                    href={`/stories/${story.id}`}
                    className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg hover:bg-[var(--accent)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{story.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {story.genre || 'Uncategorized'} &middot; {formatWordCount(story.total_word_count ?? 0)} words
                      </p>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
                      {new Date(story.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
