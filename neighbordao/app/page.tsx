import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <nav className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-lg text-slate-900">NeighborDAO</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">Log in</Link>
          <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Join your neighborhood</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-8">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Community Platform</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          Your neighborhood,<br />
          <span className="text-indigo-600">organized together</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Connect with neighbors, coordinate events, vote on proposals, and make group purchases. Everything your neighborhood needs in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-lg">
            Get started free
          </Link>
          <Link href="/login" className="bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold border border-slate-200 hover:border-slate-300 transition-colors text-lg">
            Sign in
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { icon: '📋', title: 'Community Feed', desc: 'Share updates, alerts, marketplace listings, and questions with your neighbors.' },
            { icon: '🗳️', title: 'Democratic Voting', desc: 'Create proposals and vote on neighborhood decisions with transparent results.' },
            { icon: '🛒', title: 'Group Purchasing', desc: 'Coordinate bulk orders to save money with collective buying power.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
