import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getNeighborhood } from '@/lib/actions/neighborhood';
import { getTreasuryEntries, getBalance } from '@/lib/actions/treasury';
import { TreasuryEntry, TreasuryEntryType } from '@/types/database';
import Link from 'next/link';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const entryTypeStyles: Record<TreasuryEntryType, { label: string; amountClass: string; prefix: string }> = {
  income: { label: 'Income', amountClass: 'text-green-600', prefix: '+' },
  expense: { label: 'Expense', amountClass: 'text-red-600', prefix: '-' },
  transfer: { label: 'Transfer', amountClass: 'text-blue-600', prefix: '' },
};

function EntryRow({ entry }: { entry: TreasuryEntry }) {
  const style = entryTypeStyles[entry.entry_type];

  return (
    <div className="flex items-center justify-between py-3 border-b border-green-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
              entry.entry_type === 'income'
                ? 'bg-green-100 text-green-700'
                : entry.entry_type === 'expense'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {style.label}
          </span>
          <span className="text-xs text-green-500 capitalize">{entry.category}</span>
        </div>
        <p className="text-sm font-medium text-green-900 truncate">{entry.description}</p>
        <p className="text-xs text-green-500">{formatDate(entry.created_at)}</p>
      </div>
      <p className={`font-semibold ml-4 ${style.amountClass}`}>
        {style.prefix}${Math.abs(entry.amount).toFixed(2)}
      </p>
    </div>
  );
}

export default async function TreasuryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const neighborhood = await getNeighborhood();
  if (!neighborhood) redirect('/onboarding');

  const [entries, balance] = await Promise.all([
    getTreasuryEntries(neighborhood.id),
    getBalance(neighborhood.id),
  ]);

  // Category breakdown
  const categoryMap: Record<string, { income: number; expense: number }> = {};
  for (const entry of entries) {
    if (!categoryMap[entry.category]) {
      categoryMap[entry.category] = { income: 0, expense: 0 };
    }
    if (entry.entry_type === 'income') categoryMap[entry.category].income += Number(entry.amount);
    if (entry.entry_type === 'expense') categoryMap[entry.category].expense += Number(entry.amount);
  }

  const totalIncome = entries
    .filter((e) => e.entry_type === 'income')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalExpenses = entries
    .filter((e) => e.entry_type === 'expense')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">Treasury</h1>
          <p className="text-green-600 text-sm mt-1">Transparent community fund management</p>
        </div>
        <Link
          href="/treasury/new"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Entry
        </Link>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-green-100 p-5 col-span-1">
          <p className="text-sm text-green-600 mb-1">Balance</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            ${Math.abs(balance).toFixed(2)}
          </p>
          {balance < 0 && <p className="text-xs text-red-500">Deficit</p>}
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <p className="text-sm text-green-600 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-700">+${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <p className="text-sm text-green-600 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">-${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryMap).length > 0 && (
        <div className="bg-white rounded-xl border border-green-100 p-5 mb-6">
          <h2 className="text-base font-semibold text-green-900 mb-3">Category Breakdown</h2>
          <div className="space-y-2">
            {Object.entries(categoryMap).map(([cat, { income, expense }]) => (
              <div key={cat} className="flex items-center justify-between text-sm">
                <span className="capitalize text-green-800">{cat}</span>
                <div className="flex gap-4">
                  {income > 0 && <span className="text-green-600">+${income.toFixed(2)}</span>}
                  {expense > 0 && <span className="text-red-600">-${expense.toFixed(2)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="bg-white rounded-xl border border-green-100 p-5">
        <h2 className="text-base font-semibold text-green-900 mb-3">Transactions</h2>
        {entries.length === 0 ? (
          <p className="text-green-600 text-center py-4">No transactions yet.</p>
        ) : (
          <div>
            {entries.map((entry) => <EntryRow key={entry.id} entry={entry} />)}
          </div>
        )}
      </div>
    </div>
  );
}
