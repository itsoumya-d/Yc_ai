import { getExpenses } from '@/lib/actions/expenses';
import { ExpensesList } from '@/components/expenses/expenses-list';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Expenses',
};

export default async function ExpensesPage() {
  const { expenses, total } = await getExpenses();

  return <ExpensesList initialExpenses={expenses} totalCount={total} />;
}
