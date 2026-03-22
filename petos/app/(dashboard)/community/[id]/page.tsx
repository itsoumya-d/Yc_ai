'use client';

import { Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const REPLIES = [
  { id: '1', author: 'PetMom22', text: 'We had the same issue! Try a white noise machine near their crate.', time: '1h ago', likes: 12 },
  { id: '2', author: 'DogTrainerMike', text: 'This is common in puppies under 6 months. Consistent bedtime routine is key.', time: '2h ago', likes: 28 },
  { id: '3', author: 'VetDrChen', text: 'If it persists, rule out any medical causes. Sometimes pain can cause nighttime restlessness.', time: '3h ago', likes: 35 },
];

export default function ThreadPage() {
  return (
    <div className="space-y-6">
      <Link href="/community" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"><ArrowLeft className="h-4 w-4" /> Back to Community</Link>
      <div className="bg-bg-surface border border-border-default rounded-xl p-6">
        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">Training</span>
        <h1 className="text-xl font-bold text-text-primary mt-3">My puppy won't stop barking at night</h1>
        <p className="text-sm text-text-secondary mt-1">Posted by PuppyParent99 · 5h ago</p>
        <p className="text-text-primary mt-4 leading-relaxed">Our 4-month-old Golden Retriever has been barking every night from around 2-4 AM. We've tried ignoring it, crate training, and exercise before bed. Any suggestions?</p>
        <div className="flex gap-4 mt-4 pt-4 border-t border-border-default text-sm text-text-secondary"><button className="flex items-center gap-1 hover:text-primary"><Heart className="h-4 w-4" /> 24</button><button className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {REPLIES.length}</button><button className="flex items-center gap-1"><Share2 className="h-4 w-4" /> Share</button></div>
      </div>
      <h2 className="text-lg font-semibold text-text-primary">{REPLIES.length} Replies</h2>
      {REPLIES.map(r => (
        <div key={r.id} className="bg-bg-surface border border-border-default rounded-xl p-5">
          <div className="flex items-center justify-between mb-2"><span className="font-medium text-text-primary">{r.author}</span><span className="text-xs text-text-tertiary">{r.time}</span></div>
          <p className="text-sm text-text-secondary">{r.text}</p>
          <button className="flex items-center gap-1 text-sm text-text-tertiary mt-3 hover:text-primary"><Heart className="h-3.5 w-3.5" /> {r.likes}</button>
        </div>
      ))}
    </div>
  );
}
