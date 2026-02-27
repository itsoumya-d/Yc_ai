'use client';
import { Star, MessageCircle, Clock, Briefcase, MapPin } from 'lucide-react';

const MENTORS = [
  { id: 1, name: 'Diana Liu', from: 'Factory Floor Supervisor', to: 'Data Quality Manager', at: 'Salesforce', years: 3, rating: 4.9, sessions: 47, location: 'Chicago, IL', bio: 'Made the switch in 2021. Happy to share what worked and what didn\'t about transitioning from manufacturing to tech.', tags: ['Manufacturing → Tech', 'SQL', 'Career Coaching'], available: true },
  { id: 2, name: 'Marcus Webb', from: 'Retail Store Manager', to: 'Operations Analyst', at: 'CVS Health', years: 2, rating: 4.8, sessions: 31, location: 'Boston, MA', bio: 'Retail to corporate operations. Your customer service and inventory skills are more valuable than you think.', tags: ['Retail → Corporate', 'Excel', 'Process Improvement'], available: true },
  { id: 3, name: 'Priya Nair', from: 'Administrative Assistant', to: 'Compliance Specialist', at: 'JP Morgan', years: 4, rating: 4.9, sessions: 62, location: 'Remote', bio: 'Admin to compliance in under a year. Organization and attention to detail are highly valued skills in finance.', tags: ['Admin → Finance', 'Compliance', 'FINRA'], available: false },
  { id: 4, name: 'Tom Garrett', from: 'Assembly Line Worker', to: 'Quality Assurance Analyst', at: 'General Electric', years: 5, rating: 4.7, sessions: 38, location: 'Detroit, MI', bio: 'From the floor to the office. Your quality control experience directly translates. Let me show you how.', tags: ['Manufacturing → QA', 'Data Analysis', 'Six Sigma'], available: true },
];

export default function MentorsPage() {
  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mentor Matching</h1>
        <p className="text-sm text-text-secondary mt-1">Connect with people who made the same transition you're planning</p>
      </div>

      <div className="grid gap-4">
        {MENTORS.map((mentor) => (
          <div key={mentor.id} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-xl font-bold text-primary">
                {mentor.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-text-primary">{mentor.name}</h3>
                    <p className="text-sm text-text-secondary mt-0.5">
                      <span className="text-text-tertiary">{mentor.from}</span>
                      <span className="mx-1.5 text-text-tertiary">→</span>
                      <span className="font-medium text-primary">{mentor.to}</span>
                      <span className="text-text-tertiary"> at {mentor.at}</span>
                    </p>
                  </div>
                  <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${mentor.available ? 'bg-green-100 text-green-700' : 'bg-surface text-text-tertiary'}`}>
                    {mentor.available ? '● Available' : '○ Waitlist'}
                  </div>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{mentor.bio}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{mentor.rating} ({mentor.sessions} sessions)</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{mentor.years}y in new career</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{mentor.location}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {mentor.tags.map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button disabled={!mentor.available} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${mentor.available ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-surface text-text-tertiary cursor-not-allowed'}`}>
                <MessageCircle className="h-4 w-4" />
                {mentor.available ? 'Book Session' : 'Join Waitlist'}
              </button>
              <button className="btn-outline text-sm py-2">View Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
