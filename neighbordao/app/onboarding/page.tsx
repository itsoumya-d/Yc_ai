'use client';

import { useState } from 'react';
import { Home, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create neighborhood form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Join neighborhood form state
  const [slug, setSlug] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/neighborhood/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to create neighborhood');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/neighborhood/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to join neighborhood');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="w-full max-w-lg px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <Home className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-900">Welcome to NeighborDAO</h1>
            <p className="text-green-600 text-sm mt-1 text-center">Get started by creating or joining a neighborhood</p>
          </div>

          {mode === 'choose' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full py-4 px-6 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Create a Neighborhood</p>
                    <p className="text-sm text-green-600">Start your own community from scratch</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full py-4 px-6 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-xl text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Join a Neighborhood</p>
                    <p className="text-sm text-green-600">Enter a neighborhood slug to join</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <button type="button" onClick={() => setMode('choose')} className="text-sm text-green-600 hover:underline mb-2">
                &larr; Back
              </button>
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Neighborhood Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Maplewood Heights"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  placeholder="Tell neighbors about your community..."
                />
              </div>
              {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Neighborhood'}
              </button>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoin} className="space-y-4">
              <button type="button" onClick={() => setMode('choose')} className="text-sm text-green-600 hover:underline mb-2">
                &larr; Back
              </button>
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Neighborhood Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. maplewood-heights"
                />
                <p className="text-xs text-green-500 mt-1">Ask your neighborhood admin for the slug</p>
              </div>
              {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Joining...' : 'Join Neighborhood'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
