import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-heading text-xl text-brand-600">PetOS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link href="/signup" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="text-6xl mb-6">🐾</div>
        <h1 className="text-5xl font-bold text-gray-900">
          Smart Pet Care,{' '}
          <span className="text-brand-600">Simplified</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
          Track your pet&apos;s health records, medications, and appointments. Get AI-powered symptom analysis and never miss a vet visit again.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/signup" className="rounded-lg bg-brand-600 px-8 py-3 text-sm font-medium text-white hover:bg-brand-700">
            Start for Free
          </Link>
          <Link href="/login" className="rounded-lg border border-gray-200 px-8 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Sign In
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-gray-100 p-6 text-left">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-900">Health Records</h3>
            <p className="mt-2 text-sm text-gray-500">
              Track vaccinations, medications, and vet visits all in one place.
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 p-6 text-left">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-gray-900">AI Symptom Check</h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload a photo or describe symptoms for instant AI health analysis.
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 p-6 text-left">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-900">Expense Tracking</h3>
            <p className="mt-2 text-sm text-gray-500">
              Monitor spending on food, vet visits, grooming, and supplies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
