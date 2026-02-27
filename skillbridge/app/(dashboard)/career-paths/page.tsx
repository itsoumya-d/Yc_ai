import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Clock, DollarSign, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import type { CareerPath } from '@/types/database';

async function getCareerPaths(): Promise<CareerPath[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('career_paths')
    .select('*')
    .eq('user_id', user.id)
    .order('transferability_score', { ascending: false });

  return data ?? [];
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 75 ? 'text-green-600 bg-green-50' :
    pct >= 50 ? 'text-yellow-600 bg-yellow-50' :
    'text-red-600 bg-red-50';

  return (
    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full ${color} border-2 border-current`}>
      <span className="text-lg font-bold leading-none">{pct}</span>
      <span className="text-xs opacity-70">%</span>
    </div>
  );
}

function formatSalary(min: number, max: number) {
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  return `${fmt(min)} – ${fmt(max)}`;
}

export default async function CareerPathsPage() {
  const paths = await getCareerPaths();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Career Paths</h1>
          <p className="text-gray-500 mt-1">AI-matched career opportunities based on your transferable skills.</p>
        </div>
        {paths.length > 0 && (
          <Link
            href="/assessment"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Re-run Assessment
          </Link>
        )}
      </div>

      {paths.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-sky-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No career paths yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Complete your skills assessment to get AI-powered career path recommendations tailored to you.
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Start Assessment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {paths.map((path) => (
            <div key={path.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <ScoreRing score={Math.round(path.transferability_score)} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
                      <span className="inline-block text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full mt-1">
                        {path.industry}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {formatSalary(path.salary_min, path.salary_max)}
                      </div>
                      <div className="text-xs text-gray-400">per year</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{path.description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>{path.growth_rate}% growth</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span>{path.time_to_transition} to transition</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {path.skills_match.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 text-xs font-medium text-green-700 mb-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Skills you have ({path.skills_match.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {path.skills_match.slice(0, 5).map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                              {s}
                            </span>
                          ))}
                          {path.skills_match.length > 5 && (
                            <span className="text-xs text-gray-400">+{path.skills_match.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {path.skills_gap.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 text-xs font-medium text-orange-700 mb-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Skills to learn ({path.skills_gap.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {path.skills_gap.slice(0, 5).map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                              {s}
                            </span>
                          ))}
                          {path.skills_gap.length > 5 && (
                            <span className="text-xs text-gray-400">+{path.skills_gap.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
