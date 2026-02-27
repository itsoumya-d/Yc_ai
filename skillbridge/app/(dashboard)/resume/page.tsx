'use client';

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Loader2, ChevronDown, CheckCircle, ArrowLeftRight } from 'lucide-react';
import { getCareerPaths } from '@/lib/actions/careers';
import { rewriteResume, getResumes } from '@/lib/actions/resume';
import type { CareerPath, Resume } from '@/types/database';

export default function ResumePage() {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const [originalContent, setOriginalContent] = useState('');
  const [rewritten, setRewritten] = useState<{ content: string; improvements: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'original' | 'rewritten'>('original');

  useEffect(() => {
    async function load() {
      setFetchLoading(true);
      try {
        const [paths, existingResumes] = await Promise.all([
          getCareerPaths(),
          getResumes(),
        ]);
        setCareerPaths(paths);
        setResumes(existingResumes);
        if (paths.length > 0) setSelectedPathId(paths[0].id);
        if (existingResumes.length > 0) {
          const latest = existingResumes[0];
          setOriginalContent(latest.original_content);
          setRewritten({
            content: latest.rewritten_content,
            improvements: latest.improvements,
          });
          setView('rewritten');
        }
      } catch {
        // ignore fetch errors
      } finally {
        setFetchLoading(false);
      }
    }
    load();
  }, []);

  const selectedPath = careerPaths.find((p) => p.id === selectedPathId);

  async function handleRewrite() {
    if (!originalContent.trim()) {
      setError('Please paste your current resume text.');
      return;
    }
    if (!selectedPath) {
      setError('Please select a career path target.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await rewriteResume(originalContent, selectedPath.title);
      setRewritten({ content: result.rewritten_content, improvements: result.improvements });
      setView('rewritten');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rewrite resume. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume Rewriter</h1>
        <p className="text-gray-500 mt-1">Use AI to tailor your resume to your target career path.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Career path selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Career Path</label>
          {careerPaths.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No career paths found. Complete your assessment first to generate career recommendations.
            </p>
          ) : (
            <div className="relative">
              <select
                value={selectedPathId}
                onChange={(e) => setSelectedPathId(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10"
              >
                {careerPaths.map((path) => (
                  <option key={path.id} value={path.id}>
                    {path.title} — {path.industry}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Resume input */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Your Current Resume</label>
          <span className="text-xs text-gray-400">{originalContent.length} chars</span>
        </div>
        <textarea
          value={originalContent}
          onChange={(e) => setOriginalContent(e.target.value)}
          rows={12}
          placeholder="Paste your current resume text here..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y font-mono leading-relaxed"
        />
        <button
          onClick={handleRewrite}
          disabled={loading || careerPaths.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Rewriting with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Rewrite with AI
            </>
          )}
        </button>
      </div>

      {/* Before/after comparison */}
      {rewritten && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-5 h-5 text-sky-500" />
            <h2 className="font-semibold text-gray-900">AI Rewritten Resume</h2>
          </div>

          {/* Tab toggle */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setView('original')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                view === 'original'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Original
            </button>
            <button
              onClick={() => setView('rewritten')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                view === 'rewritten'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1" />
              AI Rewritten
            </button>
          </div>

          <div className="min-h-64">
            <textarea
              readOnly
              value={view === 'original' ? originalContent : rewritten.content}
              rows={16}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono leading-relaxed bg-gray-50 resize-y"
            />
          </div>

          {/* Improvements */}
          {rewritten.improvements.length > 0 && (
            <div className="p-4 bg-sky-50 rounded-lg">
              <h3 className="text-sm font-semibold text-sky-800 mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> AI Improvements Made
              </h3>
              <ul className="space-y-1.5">
                {rewritten.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-sky-700">
                    <span className="text-sky-400 mt-0.5">•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
