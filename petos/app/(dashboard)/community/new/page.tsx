'use client';

import { useState } from 'react';
import { ArrowLeft, Image, X } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['General', 'Training', 'Nutrition', 'Health', 'Stories', 'Products'];

export default function NewPostPage() {
  const [category, setCategory] = useState('General');
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/community" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"><ArrowLeft className="h-4 w-4" /> Back to Community</Link>
      <h1 className="text-2xl font-bold text-text-primary">New Post</h1>
      <div className="space-y-4">
        <div><label className="text-sm font-medium text-text-secondary">Category</label><div className="flex flex-wrap gap-2 mt-2">{CATEGORIES.map(c => (<button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm ${category === c ? 'bg-primary text-white' : 'bg-bg-surface border border-border-default text-text-secondary'}`}>{c}</button>))}</div></div>
        <div><label className="text-sm font-medium text-text-secondary">Title</label><input className="w-full mt-1 px-4 py-2.5 rounded-lg border border-border-default bg-bg-surface text-sm" placeholder="What's on your mind?" /></div>
        <div><label className="text-sm font-medium text-text-secondary">Body</label><textarea rows={6} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-border-default bg-bg-surface text-sm resize-none" placeholder="Share your thoughts..." /></div>
        <div><label className="text-sm font-medium text-text-secondary">Tags</label><input className="w-full mt-1 px-4 py-2.5 rounded-lg border border-border-default bg-bg-surface text-sm" placeholder="Add tags (comma separated)" /></div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border-default rounded-lg text-sm text-text-secondary hover:bg-bg-surface"><Image className="h-4 w-4" /> Add Photo</button>
        <div className="flex gap-3 pt-4"><button className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold">Publish Post</button><button className="px-6 py-3 border border-border-default rounded-xl text-sm font-medium text-text-secondary">Save Draft</button></div>
      </div>
    </div>
  );
}
