import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getReportData } from '@/lib/actions/reports';
import { getAnalyticsData } from '@/lib/actions/analytics';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard',
};

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if onboarding is completed
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profile && !profile.onboarding_completed) {
      redirect('/onboarding');
    }
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Parse date range from search params
  const startParam = typeof params.start === 'string' ? params.start : undefined;
  const endParam = typeof params.end === 'string' ? params.end : undefined;
  const dateRange = startParam && endParam ? { start: startParam, end: endParam } : undefined;

  const [{ data: report }, { data: analytics }] = await Promise.all([
    getReportData(),
    getAnalyticsData(dateRange),
  ]);

  const hasData =
    report && (report.revenue.total > 0 || report.outstanding.total > 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Here&apos;s how your business is doing today.
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Invoice
          </Button>
        </Link>
      </div>

      {hasData && analytics && report ? (
        <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-[var(--muted)]" />}>
          <DashboardContent analytics={analytics} report={report} />
        </Suspense>
      ) : (
        <div className="mt-12">
          <EmptyState
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            }
            title="Create your first invoice"
            description="Get started by creating an invoice. You can use AI to draft it from a simple description."
            action={
              <Link href="/invoices/new">
                <Button>Create Invoice</Button>
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
