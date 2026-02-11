import { getPets } from '@/lib/actions/pets';
import { getExpenses, getExpenseSummary } from '@/lib/actions/expenses';
import { PageHeader } from '@/components/layout/page-header';
import { ExpenseTable } from '@/components/pets/expense-table';
import { ExpenseForm } from '@/components/pets/expense-form';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Expenses',
};

export default async function ExpensesPage() {
  const [petsResult, expensesResult, summaryResult] = await Promise.all([
    getPets(),
    getExpenses(),
    getExpenseSummary(),
  ]);

  const pets = petsResult.data || [];
  const expenses = expensesResult.data || [];
  const summary = summaryResult.data;

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track spending on your pets."
        action={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm pets={pets} />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Spent" value={formatCurrency(summary?.total ?? 0)} />
        <StatCard title="This Month" value={formatCurrency(summary?.thisMonth ?? 0)} />
        <StatCard
          title="Top Category"
          value={
            summary?.byCategory
              ? Object.entries(summary.byCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
              : 'N/A'
          }
        />
      </div>

      <div className="mt-6">
        <ExpenseTable expenses={expenses} />
      </div>
    </div>
  );
}
