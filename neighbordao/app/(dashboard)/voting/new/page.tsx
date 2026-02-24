'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VoteMethod } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

const VOTE_METHODS: { value: VoteMethod; label: string; description: string }[] = [
  { value: 'simple_majority', label: 'Simple Majority', description: '50%+ to pass' },
  { value: 'supermajority', label: 'Supermajority', description: '67%+ to pass' },
  { value: 'consensus', label: 'Consensus', description: '100% agreement required' },
];

export default function NewVotePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [votingMethod, setVotingMethod] = useState<VoteMethod>('simple_majority');
  const [quorumPercent, setQuorumPercent] = useState('50');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  function addOption() {
    setOptions([...options, '']);
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== idx));
  }

  function updateOption(idx: number, value: string) {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const filledOptions = options.filter((o) => o.trim());
    if (filledOptions.length < 2) {
      setError('Please provide at least 2 options');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    const { data: member } = await supabase
      .from('neighborhood_members')
      .select('neighborhood_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) { setError('No neighborhood found'); setLoading(false); return; }

    const voteOptions = filledOptions.map((text) => ({
      id: crypto.randomUUID(),
      text,
      votes: 0,
    }));

    const { error: insertError } = await supabase.from('votes').insert({
      neighborhood_id: member.neighborhood_id,
      creator_id: user.id,
      title,
      description,
      options: voteOptions,
      voting_method: votingMethod,
      quorum_percent: parseInt(quorumPercent, 10),
      deadline: new Date(deadline || defaultDeadline).toISOString(),
      is_closed: false,
      total_votes: 0,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push('/voting');
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-green-600 hover:underline mb-3 block">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-green-900">Create Proposal</h1>
        <p className="text-green-600 text-sm mt-1">Start a democratic vote in your neighborhood</p>
      </div>

      <div className="bg-white rounded-xl border border-green-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Proposal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Should we host a community garden?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Provide context to help neighbors decide..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-800 mb-2">Options</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder={`Option ${idx + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="px-2 py-1 text-red-500 hover:text-red-700 text-sm"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium"
            >
              + Add Option
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-800 mb-2">Voting Method</label>
            <div className="space-y-2">
              {VOTE_METHODS.map((m) => (
                <label key={m.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="voting_method"
                    value={m.value}
                    checked={votingMethod === m.value}
                    onChange={() => setVotingMethod(m.value)}
                    className="mt-0.5 accent-green-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-green-900">{m.label}</span>
                    <span className="text-xs text-green-500 ml-2">{m.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Quorum (%)</label>
              <input
                type="number"
                value={quorumPercent}
                onChange={(e) => setQuorumPercent(e.target.value)}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Voting Deadline</label>
              <input
                type="datetime-local"
                value={deadline || defaultDeadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
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
            {loading ? 'Creating...' : 'Create Proposal'}
          </button>
        </form>
      </div>
    </div>
  );
}
