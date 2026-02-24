'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostCategory } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'event', label: 'Event' },
  { value: 'alert', label: 'Alert' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'request', label: 'Request' },
];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<PostCategory>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    const { data: member } = await supabase
      .from('neighborhood_members')
      .select('neighborhood_id, display_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) { setError('No neighborhood found'); setLoading(false); return; }

    const { error: insertError } = await supabase.from('posts').insert({
      neighborhood_id: member.neighborhood_id,
      author_id: user.id,
      author_name: member.display_name || user.email?.split('@')[0] || 'Member',
      category,
      title,
      body,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-green-600 hover:underline mb-3 block">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-green-900">New Post</h1>
      </div>

      <div className="bg-white rounded-xl border border-green-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PostCategory)}
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="What's on your mind?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={5}
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Share details with your neighborhood..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Posting...' : 'Post to Community'}
          </button>
        </form>
      </div>
    </div>
  );
}
