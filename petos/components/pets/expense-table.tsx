'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import type { Expense } from '@/types/database';

type ExpenseWithPet = Expense & { pets?: { name: string } };

interface ExpenseTableProps {
  expenses: ExpenseWithPet[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <DataTable
      columns={[
        {
          key: 'date',
          header: 'Date',
          sortable: true,
          render: (expense: Expense) => formatDate(expense.date),
        },
        {
          key: 'description',
          header: 'Description',
          render: (expense: Expense) => (
            <span className="text-[var(--foreground)]">
              {expense.description || 'No description'}
            </span>
          ),
        },
        {
          key: 'category',
          header: 'Category',
          render: (expense: Expense) => (
            <Badge>{expense.category}</Badge>
          ),
        },
        {
          key: 'pet',
          header: 'Pet',
          render: (expense: ExpenseWithPet) => {
            return expense.pets?.name || '—';
          },
        },
        {
          key: 'amount',
          header: 'Amount',
          sortable: true,
          className: 'text-right',
          render: (expense: Expense) => (
            <span className="font-medium">{formatCurrency(expense.amount)}</span>
          ),
        },
      ]}
      data={expenses}
      keyExtractor={(expense) => expense.id}
      emptyState={
        <EmptyState
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75" /></svg>}
          title="No expenses tracked"
          description="Start tracking pet expenses to see where your money goes."
        />
      }
    />
  );
}
