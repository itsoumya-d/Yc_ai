'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Trash2, Bell, BookOpen, User, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const GENRES = ['Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Horror', 'Literary Fiction', 'Historical', 'Biography', 'Self-Help'];

export default function ProfileSettingsPage() {
  const [displayName, setDisplayName] = useState('Jordan Rivera');
  const [bio, setBio] = useState('Passionate reader & aspiring author. I love sci-fi, fantasy, and anything with a twist ending.');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Science Fiction', 'Fantasy', 'Mystery', 'Thriller']);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Email notification settings
  const [emailNewFollower, setEmailNewFollower] = useState(true);
  const [emailStoryUpdate, setEmailStoryUpdate] = useState(true);
  const [emailComment, setEmailComment] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [emailMarketing, setEmailMarketing] = useState(false);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Profile Settings</h1>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-white" fill="currentColor">
              <path d="M8.5 2.5L4 7.5 1.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          Changes saved successfully!
        </div>
      )}

      <div className="space-y-5">
        {/* Display Name & Bio */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Display Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] outline-none focus:border-brand-500 transition-colors"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] outline-none focus:border-brand-500 transition-colors resize-none"
                placeholder="Tell other readers about yourself..."
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">{bio.length}/160 characters</p>
            </div>
          </div>
        </div>

        {/* Reading Preferences */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Reading Preferences</h2>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            Select genres you enjoy — we'll personalize your Discover feed.
          </p>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  selectedGenres.includes(genre)
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-brand-500'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Email Notifications</h2>
          </div>

          <div className="space-y-3">
            {[
              { label: 'New follower', sublabel: 'When someone follows you', value: emailNewFollower, setter: setEmailNewFollower },
              { label: 'Story updates', sublabel: 'When a story you follow is updated', value: emailStoryUpdate, setter: setEmailStoryUpdate },
              { label: 'Comments & reactions', sublabel: 'When someone comments on your story', value: emailComment, setter: setEmailComment },
              { label: 'Weekly reading digest', sublabel: 'A weekly summary of trending stories', value: emailDigest, setter: setEmailDigest },
              { label: 'Product updates', sublabel: 'News and announcements from StoryThread', value: emailMarketing, setter: setEmailMarketing },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{item.sublabel}</p>
                </div>
                <button
                  onClick={() => item.setter(!item.value)}
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${item.value ? 'bg-brand-600' : 'bg-[var(--border)]'}`}
                  style={{ width: 40, height: 22 }}
                >
                  <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0.5'}`}
                    style={{ width: 18, height: 18, top: 2, left: item.value ? 20 : 2 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Save size={16} />
          Save Changes
        </button>

        {/* Danger Zone */}
        <div className="bg-[var(--card)] border border-red-200/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="text-sm font-semibold text-red-500">Danger Zone</h2>
          </div>

          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Delete Account</p>
                <p className="text-xs text-[var(--muted-foreground)]">Permanently remove your account and all data</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-500/30 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm font-medium text-red-400 mb-3">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--accent)] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
